#!/usr/bin/env node
/**
 * Accessibility scan (local stack only). Same targets as screenshots / color-audit (--routes or --plan,
 * --only, --actions), light + dark x 1440 + 390 by default.
 *
 *   node scripts/a11y-scan.mjs --base http://localhost:3101 --plan scripts/qa-plan.json --out C:/…/a11y
 *
 * Per target it runs:
 *   axe     axe-core (WCAG 2.0/2.1 A + AA + best practices): labels, names, roles, landmarks, heading order,
 *           contrast, duplicate ids, lang … Only `serious` and `critical` impacts fail the run; `moderate`
 *           and `minor` are listed in the report as warnings.
 *   focus   Tab through the first 30 stops: each focused element must show a ring (outline or box-shadow)
 *           and must not be invisible.
 *   trap    with a [role=dialog][aria-modal] open, 30 Tabs never leave it.
 *   motion  with prefers-reduced-motion: reduce, nothing loops or runs longer than 200 ms (spinners excepted).
 * Each target gets --timeout seconds (default 120) before it is reported as failed.
 * Output: <out>/a11y.json + <out>/a11y.txt; exit code 1 on any failure.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { DEFAULT_API, DEFAULT_BASE, assertLocal, launchBrowser, list, loadTargets, loginContext, newContext, openTarget, parseArgs } from './lib/session.mjs';

const require = createRequire(import.meta.url);
const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const args = parseArgs();
const base = (args.base || DEFAULT_BASE).replace(/\/$/, '');
const api = args.api || DEFAULT_API;
const out = args.out || 'a11y';
const themes = list(args.themes, 'dark');
const widths = list(args.widths, '1440,390').map(Number);
const TARGET_TIMEOUT = Number(args.timeout || 120) * 1000;
assertLocal(base);

async function runAxe(page) {
  await page.addScriptTag({ content: AXE });
  return page.evaluate(async () => {
    const res = await window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] },
      resultTypes: ['violations'],
    });
    return res.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.slice(0, 6).map((n) => `${n.target.join(' ')}${n.any?.[0]?.message ? ` — ${n.any[0].message}` : ''}`),
      count: v.nodes.length,
    }));
  });
}

async function scanFocus(page) {
  const bad = [];
  const dialog = (await page.locator('[role="dialog"][aria-modal="true"]:visible').count()) > 0;
  let escaped = 0;
  const seen = new Set();
  for (let i = 0; i < 30; i += 1) {
    await page.keyboard.press('Tab');
    const r = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow && cs.boxShadow !== 'none');
      // stretched links draw the ring on ::after; custom controls on a wrapper label
      const after = getComputedStyle(el, '::after');
      const afterRing = after.content !== 'none' && after.outlineStyle !== 'none' && parseFloat(after.outlineWidth) > 0;
      const wrap = el.closest('label');
      const wrapRing = !!wrap && getComputedStyle(wrap).outlineStyle !== 'none';
      let o = 1;
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
      const rect = el.getBoundingClientRect();
      return {
        key: el.outerHTML.slice(0, 160),
        ring: ring || afterRing || wrapRing,
        hidden: o < 0.01 || (rect.width === 0 && rect.height === 0),
        inDialog: !!el.closest('[role="dialog"]'),
        desc: `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 50)}"`,
      };
    });
    if (!r) continue;
    if (dialog && !r.inDialog) escaped += 1;
    if (seen.has(r.key)) continue;
    seen.add(r.key);
    if (r.hidden) bad.push({ check: 'focus', impact: 'serious', el: `focus on an invisible element: ${r.desc}` });
    else if (!r.ring) bad.push({ check: 'focus', impact: 'serious', el: `no focus ring: ${r.desc}` });
  }
  if (escaped) bad.push({ check: 'trap', impact: 'critical', el: `${escaped}/30 Tab stops left the open dialog` });
  return bad;
}

const scanMotion = (page) =>
  page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.playState === 'running')
      .map((a) => {
        const t = a.effect?.getTiming?.() || {};
        const target = a.effect?.target;
        return { dur: Number(t.duration) || 0, iter: t.iterations, cls: target ? String(target.className?.baseVal ?? target.className ?? '') : '' };
      })
      .filter((a) => !/\bspin\b|animate-spin|skeleton/.test(a.cls) && (a.iter === Infinity || a.dur > 200))
      .map((a) => ({ check: 'motion', impact: 'serious', el: `${a.cls.slice(0, 60)} ${a.dur}ms x${a.iter}` }))
  );

mkdirSync(out, { recursive: true });
const targets = await loadTargets(args, api, readFileSync);
const browser = await launchBrowser();
const report = [];
let failures = 0;
let warnings = 0;
try {
  for (const target of targets) {
    for (const theme of target.themes || themes) {
      for (const width of target.widths || widths) {
        const context = await newContext(browser, { theme, width, base, reducedMotion: 'reduce' });
        const page = await context.newPage();
        const label = `${target.admin ? 'admin:' : ''}${target.path}${target.name ? ` #${target.name}` : ''} ${theme} ${width}`;
        let issues = [];
        try {
          const scan = async () => {
            if (target.admin) await loginContext(context, { api, base });
            await openTarget(page, target, { base, scroll: false });
            const axe = await runAxe(page);
            return [
              ...axe.map((v) => ({ check: `axe:${v.id}`, impact: v.impact, el: `${v.help} (${v.count}) — ${v.nodes.join(' | ')}` })),
              ...(await scanMotion(page)),
              ...(await scanFocus(page)),
            ];
          };
          // one stuck page must not hang the whole run
          issues = await Promise.race([
            scan(),
            new Promise((_, reject) => setTimeout(() => reject(new Error(`timed out after ${TARGET_TIMEOUT / 1000} s`)), TARGET_TIMEOUT)),
          ]);
        } catch (e) {
          issues = [{ check: 'action', impact: 'critical', el: e.message.split('\n')[0] }];
        }
        const fail = issues.filter((i) => i.impact === 'serious' || i.impact === 'critical');
        failures += fail.length;
        warnings += issues.length - fail.length;
        report.push({ target: label, issues });
        console.log(`${fail.length ? 'FAIL' : 'ok  '} ${label}${issues.length ? ` — ${fail.length} serious/critical, ${issues.length - fail.length} minor` : ''}`);
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}
writeFileSync(join(out, 'a11y.json'), JSON.stringify({ failures, warnings, report }, null, 2));
const lines = [`A11y scan — ${failures} serious/critical, ${warnings} moderate/minor`, ''];
for (const r of report.filter((x) => x.issues.length)) {
  lines.push(`## ${r.target}`);
  for (const i of r.issues) lines.push(`  - [${i.impact}] [${i.check}] ${i.el}`);
  lines.push('');
}
writeFileSync(join(out, 'a11y.txt'), lines.join('\n'));
console.log(`\n${failures} serious/critical, ${warnings} moderate/minor. Report: ${join(out, 'a11y.txt')}`);
process.exit(failures ? 1 : 0);
