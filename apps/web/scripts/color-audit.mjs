#!/usr/bin/env node
// Colour-law audit (runtime). Brief §1: every rendered colour, after alpha compositing, must lie on the
// RGB polyline  #FFFFFF -> #5C000E -> #000000  (±4 per channel).
//
// For each route x theme x width this walks every visible element (and ::before / ::after, ::placeholder,
// ::selection), reads every colour that paints pixels — color, background-color, border colours, outline,
// box-shadow, text-shadow, text-decoration, -webkit-text-stroke, caret, accent-color of native controls,
// SVG fill/stroke (+ fill/stroke-opacity), SVG gradient <stop>s, CSS gradient stops, scrollbar-color —
// composites alpha (and inherited opacity) over the element's backdrop (ancestor background colours)
// and checks the result. It also decodes every raster ornament (<img> / CSS url() under /ornaments/ or
// /brand/, data: SVG) at natural size and requires its opaque pixels to be on the line, and tabs through
// the page to check focus rings.
//
// Exempt: user photos — [data-user-image] subtrees, and <img>/<video>/<canvas> whose source is not under
// /ornaments/, /brand/ or a data: SVG (next/image URLs are unwrapped first) — plus iframes (third party),
// <mask>/<clipPath> contents and [data-color-audit-ignore] subtrees (escape hatch: needs a reason in review).
// Exempt images are listed in the report so stock photos cannot hide there unnoticed.
//
// Usage (local stack only — mock API + next on 3101):
//   node scripts/color-audit.mjs --routes "/,/courses,admin:/dashboard/courses" [--themes light,dark] [--widths 1440,390]
//     [--scope "main"] [--out color-audit] [--shots <dir>] [--base http://localhost:3101] [--api http://localhost:5101/api]
//     [--actions "click=…" --name modal | --plan plan.json [--only <regex>]] [--tolerance 4] [--consent 1] [--scroll 1]
//     [--reduced-motion 1 (default) | 0]
// Output: <out>/color-audit.json + <out>/color-audit.txt; per-route counts on stdout; exit code 1 on any violation.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DEFAULT_API, DEFAULT_BASE, assertLocal, launchBrowser, list, loadTargets, loginContext, newContext, openTarget, parseArgs, targetSlug, truthy } from './lib/session.mjs';

const args = parseArgs();
const base = (args.base || DEFAULT_BASE).replace(/\/$/, '');
const api = args.api || DEFAULT_API;
const out = args.out || 'color-audit';
const themes = list(args.themes, 'dark');
const widths = list(args.widths, '1440,390').map(Number);
const TOL = Number(args.tolerance || 4);
const RASTER_MAX_OFF = Number(args['raster-max-off'] || 0.002); // fraction of opaque pixels allowed off-law (codec / antialias noise)
const consent = truthy(args.consent, true);
const scroll = truthy(args.scroll, true);
const reducedMotion = truthy(args['reduced-motion'], true) ? 'reduce' : 'no-preference';

assertLocal(base);

/* ---------------------------------------------------------------- in-page auditor */
async function auditPage(page, tol, scope, skipRasters = []) {
  return page.evaluate(async ({ TOL, SCOPE, SKIP }) => {
    const WINE = [92, 0, 14];
    const lawCache = new Map();
    const onLawRaw = (c) => {
      let best = Infinity;
      for (const [p0, p1] of [[[255, 255, 255], WINE], [WINE, [0, 0, 0]]]) {
        for (let i = 0; i <= 512; i += 1) {
          const t = i / 512;
          const d = Math.max(
            Math.abs(c[0] - (p0[0] + (p1[0] - p0[0]) * t)),
            Math.abs(c[1] - (p0[1] + (p1[1] - p0[1]) * t)),
            Math.abs(c[2] - (p0[2] + (p1[2] - p0[2]) * t))
          );
          if (d < best) best = d;
        }
      }
      return best <= TOL ? true : best;
    };
    const onLaw = (c) => {
      const r = c.map((v) => Math.round(v));
      const key = (r[0] << 16) | (r[1] << 8) | r[2];
      let res = lawCache.get(key);
      if (res === undefined) {
        res = onLawRaw(r);
        lawCache.set(key, res);
      }
      return res;
    };

    // CSS colour string -> [r,g,b,a] in sRGB via two canvas fills (over white / over black)
    const cv = document.createElement('canvas');
    cv.width = 2;
    cv.height = 1;
    const cx = cv.getContext('2d', { willReadFrequently: true });
    const cache = new Map();
    const parse = (str) => {
      if (!str || str === 'none' || str === 'transparent' || str === 'auto' || str.startsWith('url(')) return null;
      if (cache.has(str)) return cache.get(str);
      cx.clearRect(0, 0, 2, 1);
      cx.fillStyle = '#ffffff';
      cx.fillRect(0, 0, 1, 1);
      cx.fillStyle = '#000000';
      cx.fillRect(1, 0, 1, 1);
      cx.fillStyle = '#123456';
      cx.fillStyle = str;
      if (cx.fillStyle === '#123456' && str.toLowerCase() !== '#123456') {
        cache.set(str, null);
        return null;
      }
      cx.fillRect(0, 0, 2, 1);
      const d = cx.getImageData(0, 0, 2, 1).data;
      const w = [d[0], d[1], d[2]];
      const b = [d[4], d[5], d[6]];
      const a = 1 - (w[0] - b[0] + w[1] - b[1] + w[2] - b[2]) / (3 * 255);
      const rgb = a > 0.004 ? b.map((v) => Math.min(255, v / a)) : [0, 0, 0];
      const res = [...rgb, Math.max(0, Math.min(1, a))];
      cache.set(str, res);
      return res;
    };
    const over = (c, bg, extra = 1) => {
      const a = c[3] * extra;
      return [0, 1, 2].map((i) => c[i] * a + bg[i] * (1 - a));
    };

    /* ---- what is a user photo vs. an ornament */
    const realUrl = (u) => {
      try {
        const url = new URL(u, location.href);
        if (url.pathname.startsWith('/_next/image')) {
          const inner = url.searchParams.get('url');
          if (inner) return new URL(inner, location.href);
        }
        return url;
      } catch {
        return null;
      }
    };
    const isOrnamentSrc = (u) => {
      if (!u) return false;
      if (u.startsWith('data:')) return /^data:image\/svg\+xml/i.test(u) && !/(%3Cimage|<image)/i.test(u); // blur placeholders embed a photo
      const url = realUrl(u);
      return !!url && url.origin === location.origin && /^\/(ornaments|brand)\//.test(url.pathname);
    };
    const shortSrc = (u) => {
      const url = u.startsWith('data:') ? null : realUrl(u);
      return url ? (url.origin === location.origin ? url.pathname : url.href) : `${u.slice(0, 40)}…`;
    };

    const skip = (el) => el.closest('[data-user-image], [data-color-audit-ignore], iframe, mask, clipPath, nextjs-portal');
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return false;
      const cs = getComputedStyle(el);
      return cs.visibility !== 'hidden' && cs.display !== 'none';
    };
    const effOpacity = (el) => {
      let o = 1;
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
      return o;
    };
    const bdCache = new Map();
    const backdrop = (el) => {
      if (!el) return [255, 255, 255];
      if (bdCache.has(el)) return bdCache.get(el);
      const below = el.parentElement ? backdrop(el.parentElement) : [255, 255, 255];
      const bg = parse(getComputedStyle(el).backgroundColor);
      const res = bg && bg[3] > 0 ? over(bg, below) : below;
      bdCache.set(el, res);
      return res;
    };
    const short = (el) => {
      const parts = [];
      for (let n = el; n && n.nodeType === 1 && parts.length < 4; n = n.parentElement) {
        let s = n.tagName.toLowerCase();
        if (n.id) s += `#${n.id}`;
        const cls = typeof n.className === 'string' ? n.className.trim().split(/\s+/).slice(0, 3).join('.') : '';
        if (cls) s += `.${cls}`;
        parts.unshift(s);
      }
      return parts.join(' > ');
    };
    const colorsIn = (s) => (s && s !== 'none' ? s.match(/(rgba?|oklab|oklch|lab|lch|hsla?|hwb|color)\([^()]*(\([^()]*\)[^()]*)*\)|#[0-9a-f]{3,8}\b/gi) || [] : []);
    const urlsIn = (s) => (s && s !== 'none' ? [...s.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map((m) => m[1]) : []);

    const violations = [];
    const warnings = [];
    const rasters = new Set();
    const exemptImages = new Set();
    let checks = 0;
    let walked = 0;
    const check = (el, prop, raw, c, bg, extra) => {
      if (!c || c[3] * extra < 0.01) return;
      checks += 1;
      const final = over(c, bg, extra).map((v) => Math.round(v));
      const res = onLaw(final);
      if (res !== true) violations.push({ selector: short(el), prop, value: raw, rendered: `rgb(${final.join(', ')})`, distance: Math.round(res) });
    };
    const noteUrl = (u) => {
      const abs = u.startsWith('data:') ? u : new URL(u, location.href).href;
      if (isOrnamentSrc(abs)) rasters.add(abs);
      else exemptImages.add(shortSrc(abs));
    };

    const SVG_PAINT = new Set(['path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse', 'text', 'tspan', 'textPath', 'use']);
    const NATIVE_ACCENT = new Set(['checkbox', 'radio', 'range']);
    const hasOwnText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());

    const auditStyle = (el, cs, pseudo, outerBg, op) => {
      const tag = pseudo || '';
      const bgc = parse(cs.backgroundColor);
      if (bgc && bgc[3] > 0) check(el, `${tag}background-color`, cs.backgroundColor, bgc, outerBg, op);
      const surface = bgc && bgc[3] > 0 ? over(bgc, outerBg) : outerBg;
      for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
        if (cs[`border${side}Style`] !== 'none' && parseFloat(cs[`border${side}Width`]) > 0) {
          check(el, `${tag}border-${side.toLowerCase()}-color`, cs[`border${side}Color`], parse(cs[`border${side}Color`]), surface, op);
        }
      }
      if (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) check(el, `${tag}outline-color`, cs.outlineColor, parse(cs.outlineColor), outerBg, op);
      for (const raw of colorsIn(cs.boxShadow)) check(el, `${tag}box-shadow`, raw, parse(raw), outerBg, op);
      for (const raw of colorsIn(cs.backgroundImage)) check(el, `${tag}background-image (gradient stop)`, raw, parse(raw), outerBg, op);
      for (const u of urlsIn(cs.backgroundImage)) noteUrl(u);
      for (const u of urlsIn(cs.borderImageSource)) noteUrl(u);
      if (pseudo) for (const u of urlsIn(cs.content)) noteUrl(u);
      const paintsText = pseudo ? cs.content && !['none', 'normal', '""', "''"].includes(cs.content) && !cs.content.startsWith('url(') : hasOwnText(el) || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(el.tagName);
      if (paintsText) {
        check(el, `${tag}color`, cs.color, parse(cs.color), surface, op);
        if (cs.textDecorationLine && cs.textDecorationLine !== 'none') check(el, `${tag}text-decoration-color`, cs.textDecorationColor, parse(cs.textDecorationColor), surface, op);
        for (const raw of colorsIn(cs.textShadow)) check(el, `${tag}text-shadow`, raw, parse(raw), surface, op);
        if (parseFloat(cs.webkitTextStrokeWidth) > 0) check(el, `${tag}-webkit-text-stroke-color`, cs.webkitTextStrokeColor, parse(cs.webkitTextStrokeColor), surface, op);
      }
      if (pseudo) return;
      if (['INPUT', 'TEXTAREA'].includes(el.tagName) || el.isContentEditable) check(el, 'caret-color', cs.caretColor, parse(cs.caretColor), surface, op);
      if ((el.tagName === 'INPUT' && NATIVE_ACCENT.has(el.type)) || el.tagName === 'PROGRESS' || el.tagName === 'METER') {
        if (cs.appearance !== 'none') {
          if (cs.accentColor === 'auto') violations.push({ selector: short(el), prop: 'accent-color', value: 'auto', rendered: 'browser accent (blue)', distance: -1 });
          else check(el, 'accent-color', cs.accentColor, parse(cs.accentColor), surface, op);
        }
      }
      if (el instanceof SVGElement && SVG_PAINT.has(el.tagName)) {
        if (cs.fill && !cs.fill.startsWith('url') && cs.fill !== 'none') check(el, 'fill', cs.fill, parse(cs.fill), outerBg, op * Number(cs.fillOpacity));
        if (cs.stroke && !cs.stroke.startsWith('url') && cs.stroke !== 'none' && parseFloat(cs.strokeWidth) > 0) check(el, 'stroke', cs.stroke, parse(cs.stroke), outerBg, op * Number(cs.strokeOpacity));
      }
      if (el.tagName === 'IMG' && el.currentSrc) {
        if (isOrnamentSrc(el.currentSrc)) {
          if (el.complete && el.naturalWidth > 0) rasters.add(el.currentSrc);
        } else exemptImages.add(shortSrc(el.currentSrc));
      }
      if (el.tagName === 'image' && el.href?.baseVal) noteUrl(el.href.baseVal);
      if (el.tagName === 'VIDEO' || el.tagName === 'CANVAS') exemptImages.add(`<${el.tagName.toLowerCase()}> ${el.currentSrc || el.id || ''}`.trim());
    };

    for (const el of document.querySelectorAll('body, body *')) {
      if (skip(el) || !visible(el)) continue;
      if (SCOPE && !el.closest(SCOPE)) continue;
      walked += 1;
      const op = effOpacity(el);
      if (op < 0.01) {
        if (hasOwnText(el) && !el.closest('[aria-hidden="true"], [hidden], [inert]')) {
          warnings.push({ selector: short(el), prop: 'invisible text', value: `opacity ${op.toFixed(3)}`, text: el.textContent.trim().slice(0, 60) });
        }
        continue;
      }
      const cs = getComputedStyle(el);
      auditStyle(el, cs, null, backdrop(el.parentElement), op);
      const own = backdrop(el);
      for (const p of ['::before', '::after']) {
        const ps = getComputedStyle(el, p);
        if (ps.content && ps.content !== 'none' && ps.content !== 'normal') auditStyle(el, ps, p, own, op * Number(ps.opacity || 1));
      }
      if ((el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && el.placeholder) {
        const ph = getComputedStyle(el, '::placeholder');
        check(el, '::placeholder color', ph.color, parse(ph.color), own, op);
      }
    }

    // SVG gradient stops (inside <defs>, so not "visible" themselves): composite over the svg's backdrop
    for (const stop of document.querySelectorAll('svg stop')) {
      const svg = stop.ownerSVGElement;
      if (!svg || skip(stop) || !visible(svg)) continue;
      if (SCOPE && !svg.closest(SCOPE)) continue;
      const cs = getComputedStyle(stop);
      check(stop, 'stop-color', cs.stopColor, parse(cs.stopColor), backdrop(svg.parentElement), effOpacity(svg) * Number(cs.stopOpacity));
    }

    // page level: selection + scrollbar
    const sel = getComputedStyle(document.body, '::selection');
    const selBg = parse(sel.backgroundColor);
    if (selBg && selBg[3] > 0) {
      check(document.body, '::selection background', sel.backgroundColor, selBg, backdrop(document.body), 1);
      check(document.body, '::selection color', sel.color, parse(sel.color), over(selBg, backdrop(document.body)), 1);
    }
    for (const raw of colorsIn(getComputedStyle(document.documentElement).scrollbarColor)) {
      check(document.documentElement, 'scrollbar-color', raw, parse(raw), backdrop(document.body), 1);
    }

    // raster ornaments: every pixel with alpha >= 64 must itself be a polyline tone
    const rasterResults = [];
    for (const src of rasters) {
      if (SKIP.includes(src)) continue;
      try {
        const img = new Image();
        img.decoding = 'async';
        img.src = src;
        await img.decode();
        // natural size: resampling would blend neighbours and invent off-law colours
        const w = img.naturalWidth || 256;
        const h = img.naturalHeight || 256;
        const oc = new OffscreenCanvas(w, h);
        const ox = oc.getContext('2d', { willReadFrequently: true });
        ox.drawImage(img, 0, 0, w, h);
        const d = ox.getImageData(0, 0, w, h).data;
        let n = 0;
        let off = 0;
        let worst = null;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i + 3] < 64) continue;
          n += 1;
          const res = onLaw([d[i], d[i + 1], d[i + 2]]);
          if (res !== true) {
            off += 1;
            if (!worst || res > worst.distance) worst = { rgb: `rgb(${d[i]}, ${d[i + 1]}, ${d[i + 2]})`, distance: Math.round(res) };
          }
        }
        rasterResults.push({ src, pixels: n, off, worst });
      } catch (e) {
        rasterResults.push({ src, error: String(e) });
      }
    }
    return { violations, warnings, rasterResults, checks, walked, exemptImages: [...exemptImages] };
  }, { TOL: tol, SCOPE: scope || null, SKIP: skipRasters });
}

async function auditFocus(page, tol) {
  // Tab through the first focusable elements and check the solid part of the focus ring
  const found = [];
  for (let i = 0; i < 8; i += 1) {
    await page.keyboard.press('Tab');
    const res = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body || el.closest('[data-user-image], [data-color-audit-ignore], iframe')) return null;
      let o = 1;
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
      if (o < 0.01) return null;
      const cs = getComputedStyle(el);
      return { tag: el.tagName.toLowerCase(), cls: String(el.className?.baseVal ?? el.className ?? '').slice(0, 60), outline: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0 ? cs.outlineColor : null, shadow: cs.boxShadow };
    });
    if (res) found.push(res);
  }
  const WINE = [92, 0, 14];
  const onLaw = (c) => {
    let best = Infinity;
    for (const [p0, p1] of [[[255, 255, 255], WINE], [WINE, [0, 0, 0]]]) {
      for (let i = 0; i <= 512; i += 1) {
        const t = i / 512;
        best = Math.min(best, Math.max(...[0, 1, 2].map((k) => Math.abs(c[k] - (p0[k] + (p1[k] - p0[k]) * t)))));
      }
    }
    return best <= tol;
  };
  const bad = [];
  for (const f of found) {
    for (const raw of [f.outline, ...((f.shadow || '').match(/rgba?\([^)]*\)/g) || [])].filter(Boolean)) {
      const m = (raw.match(/[\d.]+/g) || []).map(Number);
      if (m.length >= 3 && (m[3] ?? 1) >= 0.99 && !onLaw(m.slice(0, 3))) bad.push({ selector: `${f.tag}.${f.cls}`, prop: 'focus ring', value: raw, rendered: raw, distance: -1 });
    }
  }
  return bad;
}

/* ---------------------------------------------------------------- run */
mkdirSync(out, { recursive: true });
if (args.shots) mkdirSync(args.shots, { recursive: true });
const targets = await loadTargets(args, api, readFileSync);
const browser = await launchBrowser();
const report = [];
const rasterOk = new Set();
let total = 0;
try {
  for (const target of targets) {
    const label = `${target.admin ? 'admin:' : ''}${target.path}${target.name ? ` #${target.name}` : ''}`;
    for (const theme of target.themes || themes) {
      for (const width of target.widths || widths) {
        const context = await newContext(browser, { theme, width, base, consent, reducedMotion });
        const page = await context.newPage();
        try {
          if (target.admin) await loginContext(context, { api, base });
          await openTarget(page, target, { base, scroll, log: console.log });
        } catch (e) {
          total += 1;
          report.push({ route: target.path, name: target.name, admin: !!target.admin, theme, width, checks: 0, rasters: 0, violations: [{ selector: '-', prop: 'load/action', value: e.message.split('\n')[0], rendered: '-', distance: -1 }], warnings: [], exemptImages: [] });
          console.log(`FAIL ${label} ${theme} ${width}px — ${e.message.split('\n')[0]}`);
          await context.close();
          continue;
        }
        if (args.shots) await page.screenshot({ path: join(args.shots, `${targetSlug(target)}-${theme}-${width}.png`), fullPage: !target.steps.length });
        const { violations, warnings, rasterResults, checks, walked, exemptImages } = await auditPage(page, TOL, args.scope, [...rasterOk]);
        const rasterBad = (r) => r.error || (r.pixels > 0 && r.off / r.pixels > RASTER_MAX_OFF);
        for (const r of rasterResults) if (!rasterBad(r)) rasterOk.add(r.src);
        const focus = await auditFocus(page, TOL);
        if (page.__health?.overlay) focus.push({ selector: 'nextjs-portal', prop: 'Next.js error overlay', value: page.__health.overlay, rendered: '-', distance: -1 });
        if (walked === 0 || checks === 0) focus.push({ selector: args.scope || 'body', prop: 'nothing audited', value: args.scope ? `0 colour checks — --scope "${args.scope}" matched nothing visible` : '0 colour checks — blank or crashed page?', rendered: '-', distance: -1 });
        const rasterViolations = rasterResults.filter(rasterBad).map((r) => ({
          selector: r.src.startsWith('data:') ? `${r.src.slice(0, 48)}…` : r.src.replace(base, ''),
          prop: 'raster pixels',
          value: r.error || `${r.off}/${r.pixels} pixels off-law`,
          rendered: r.worst?.rgb || '-',
          distance: r.worst?.distance ?? -1,
        }));
        const seen = new Set();
        const unique = [...violations, ...focus, ...rasterViolations].filter((v) => {
          const k = `${v.selector}|${v.prop}|${v.value}`;
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });
        total += unique.length;
        report.push({ route: target.path, name: target.name, admin: !!target.admin, theme, width, checks, rasters: rasterResults.length, violations: unique, warnings, exemptImages });
        console.log(
          `${unique.length ? 'FAIL' : 'ok  '} ${label} ${theme} ${width}px — ${checks} colour checks, ${rasterResults.length} rasters, ${unique.length} violations` +
            `${warnings.length ? `, ${warnings.length} invisible-text warnings` : ''}${exemptImages.length ? `, ${exemptImages.length} exempt images` : ''}`
        );
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}

writeFileSync(join(out, 'color-audit.json'), JSON.stringify({ tolerance: TOL, base, total, report }, null, 2));
const lines = [`Colour audit — ${base} — tolerance ±${TOL}/channel — ${total} violation(s)`, ''];
for (const r of report) {
  lines.push(`## ${r.admin ? 'admin:' : ''}${r.route}${r.name ? ` #${r.name}` : ''} · ${r.theme} · ${r.width}px — ${r.violations.length} violation(s)`);
  for (const v of r.violations.slice(0, 200)) lines.push(`  - ${v.prop}: ${v.value} -> ${v.rendered} (off by ${v.distance})  @ ${v.selector}`);
  if (r.violations.length > 200) lines.push(`  … ${r.violations.length - 200} more in color-audit.json`);
  for (const w of (r.warnings || []).slice(0, 30)) lines.push(`  ! ${w.prop} (${w.value}): "${w.text}"  @ ${w.selector}`);
  if (r.exemptImages?.length) lines.push(`  exempt images (user photos — must sit in ornate frames): ${r.exemptImages.slice(0, 12).join(', ')}${r.exemptImages.length > 12 ? ' …' : ''}`);
  lines.push('');
}
writeFileSync(join(out, 'color-audit.txt'), lines.join('\n'));
console.log(`\n${total} violation(s). Report: ${join(out, 'color-audit.txt')}`);
process.exit(total ? 1 : 0);
