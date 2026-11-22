#!/usr/bin/env node
// Load / scroll / route-change probe under 4x CPU throttling with mobile emulation (Lighthouse-like).
// Run against a PRODUCTION build — dev mode numbers are meaningless:
//   NEXT_PUBLIC_API_URL=http://localhost:5101/api npx next build && npx next start -p 3101
//   node scripts/perf-probe.mjs --routes "/,/courses,/blog" --out C:/dev/landing-ornate/perf/foundation
//
// Flags:
//   --routes "/,/courses"       routes to load (admin: prefix logs in, like the other scripts)
//   --base http://localhost:3101  --api http://localhost:5101/api
//   --throttle 4                CPU slowdown via CDP Emulation.setCPUThrottlingRate
//   --device moto|desktop       moto = Moto G Power-ish 412x823 @1.75x, touch, mobile (default); desktop = 1440x900
//   --network none|slow4g       slow4g = 150 ms RTT, 1.6 Mbps down / 750 kbps up (Lighthouse mobile); default none
//   --runs 1                    loads per route; numeric metrics are reported as the median
//   --reduced-motion 1          emulate prefers-reduced-motion: reduce (compare with a normal run = what motion costs)
//   --nav-link "<selector>"     link clicked for the route-change scenario (default: first internal header/nav link
//                               pointing at another page)
//   --lighthouse 1              also run Lighthouse if it is installed locally/globally (never installed by this script)
//   --theme light|dark          (default light)   --out perf
//
// Per route it records:
//   TTFB, FCP, LCP (+ element), CLS (session-window max), TBT (Σ(long task − 50 ms) between FCP and quiet),
//   long tasks > 100 ms, JS transferred bytes, request count, transferred bytes, font files loaded;
//   scroll: the whole page in ~10 wheel steps with rAF frame timing -> avg fps, dropped frames, worst frame;
//   route change: click a nav link -> URL change, content settled (last DOM mutation), next paint after it.
// Output: <out>/perf.json + <out>/perf.md (paste the table into the PR).
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { execSync, spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_API, DEFAULT_BASE, assertLocal, launchBrowser, loginContext, newContext, parseArgs, parseRoutes, truthy } from './lib/session.mjs';

const args = parseArgs();
const base = (args.base || DEFAULT_BASE).replace(/\/$/, '');
const api = args.api || DEFAULT_API;
const out = args.out || 'perf';
const throttle = Number(args.throttle || 4);
const runs = Math.max(1, Number(args.runs || 1));
const device = args.device || 'moto';
const network = args.network || 'none';
const reducedMotion = truthy(args['reduced-motion']);
const theme = args.theme || 'light';
assertLocal(base);
const routes = parseRoutes(args.routes || '/');

const DEVICES = {
  moto: { width: 412, height: 823, deviceScaleFactor: 1.75, mobile: true, ua: 'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36' },
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
};
const dev = DEVICES[device] || DEVICES.moto;

/* ---------------------------------------------------------------- in-page instrumentation (before any page script) */
const INSTRUMENT = () => {
  const P = (window.__perf = { long: [], lcp: null, shifts: [], frames: [], fcp: null });
  const obs = (type, cb, extra = {}) => {
    try {
      new PerformanceObserver((l) => l.getEntries().forEach(cb)).observe({ type, buffered: true, ...extra });
    } catch {
      /* unsupported */
    }
  };
  obs('longtask', (e) => P.long.push({ t: e.startTime, d: e.duration }));
  obs('paint', (e) => {
    if (e.name === 'first-contentful-paint') P.fcp = e.startTime;
  });
  obs('largest-contentful-paint', (e) => {
    const el = e.element;
    let desc = null;
    if (el) {
      desc = el.tagName.toLowerCase();
      if (el.id) desc += `#${el.id}`;
      const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
      if (cls) desc += `.${cls}`;
      if (e.url) desc += ` ${e.url.replace(location.origin, '').slice(0, 80)}`;
      else if (el.textContent) desc += ` "${el.textContent.trim().slice(0, 40)}"`;
    }
    P.lcp = { t: e.startTime, size: e.size, el: desc };
  });
  obs('layout-shift', (e) => {
    if (!e.hadRecentInput) P.shifts.push({ t: e.startTime, v: e.value });
  });
  const tick = (ts) => {
    P.frames.push(ts);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const median = (xs) => {
  const v = xs.filter((x) => typeof x === 'number' && Number.isFinite(x)).sort((a, b) => a - b);
  return v.length ? v[Math.floor((v.length - 1) / 2)] : null;
};
const now = (page) => page.evaluate(() => performance.now());

async function loadMetrics(page) {
  return page.evaluate(() => {
    const P = window.__perf;
    const nav = performance.getEntriesByType('navigation')[0];
    const res = performance.getEntriesByType('resource');
    // CLS: max session window (gap < 1 s, window < 5 s)
    let cls = 0;
    let cur = 0;
    let start = 0;
    let last = -Infinity;
    for (const s of P.shifts) {
      if (s.t - last > 1000 || s.t - start > 5000) {
        cur = 0;
        start = s.t;
      }
      cur += s.v;
      last = s.t;
      cls = Math.max(cls, cur);
    }
    const fcp = P.fcp ?? 0;
    const tbt = P.long.filter((l) => l.t + l.d > fcp).reduce((sum, l) => sum + Math.max(0, l.d - 50), 0);
    const isJs = (r) => r.initiatorType === 'script' || /\.m?js(\?|$)/.test(r.name);
    const fonts = res.filter((r) => /\.(woff2?|ttf|otf)(\?|$)/i.test(r.name));
    return {
      ttfb: nav ? nav.responseStart : null,
      fcp: P.fcp,
      lcp: P.lcp?.t ?? null,
      lcpElement: P.lcp?.el ?? null,
      cls: Math.round(cls * 1000) / 1000,
      tbt: Math.round(tbt),
      longTasks100: P.long.filter((l) => l.d > 100).length,
      longestTask: P.long.length ? Math.round(Math.max(...P.long.map((l) => l.d))) : 0,
      jsBytes: res.filter(isJs).reduce((s, r) => s + (r.transferSize || r.encodedBodySize || 0), 0),
      totalBytes: res.reduce((s, r) => s + (r.transferSize || r.encodedBodySize || 0), 0) + (nav?.transferSize || 0),
      requests: res.length + 1,
      fonts: fonts.map((f) => `${f.name.split('/').pop().split('?')[0]} (${Math.round((f.transferSize || f.encodedBodySize || 0) / 1024)} KB)`),
      looksLikeDev: !!document.querySelector('nextjs-portal, script[src*="react-refresh"], script[src*="webpack-hmr"], script[src*="turbopack"]'),
    };
  });
}

const frameStats = (page, from, to) =>
  page.evaluate(
    ({ a, b }) => {
      const f = window.__perf.frames.filter((t) => t >= a && t <= b);
      const gaps = f.slice(1).map((t, i) => t - f[i]);
      const budget = 1000 / 60;
      const dropped = gaps.reduce((s, g) => s + Math.max(0, Math.round(g / budget) - 1), 0);
      const long = window.__perf.long.filter((e) => e.t >= a - 50 && e.t <= b);
      return {
        fps: f.length > 1 ? Math.round(((f.length - 1) * 1000) / (f[f.length - 1] - f[0])) : 0,
        dropped,
        worstFrameMs: gaps.length ? Math.round(Math.max(...gaps)) : 0,
        longTasks: long.length,
        longestTaskMs: long.length ? Math.round(Math.max(...long.map((e) => e.d))) : 0,
      };
    },
    { a: from, b: to }
  );

async function scrollScenario(page, steps = 10) {
  const vp = page.viewportSize();
  await page.mouse.move(vp.width / 2, vp.height / 2);
  const total = await page.evaluate(() => Math.max(0, document.documentElement.scrollHeight - innerHeight));
  const step = Math.max(200, Math.ceil(total / steps));
  const t0 = await now(page);
  for (let i = 0; i < steps; i += 1) {
    await page.mouse.wheel(0, step);
    await page.waitForTimeout(180);
  }
  await page.waitForTimeout(250);
  const t1 = await now(page);
  const stats = await frameStats(page, t0, t1);
  await page.evaluate(() => window.scrollTo(0, 0));
  return { ...stats, scrolledPx: total };
}

async function routeChangeScenario(page, selector) {
  let link;
  if (selector) link = page.locator(selector).first();
  else {
    // first visible internal link to another page: header/nav first (desktop), then main/footer (mobile menus are collapsed)
    const found = await page.evaluate(() => {
      const here = location.pathname.replace(/\/$/, '') || '/';
      const ok = (a) => {
        if (a.target === '_blank' || a.hasAttribute('download')) return false;
        const u = new URL(a.href, location.href);
        const p = u.pathname.replace(/\/$/, '') || '/';
        if (u.origin !== location.origin || p === here || /\/(login|dashboard)(\/|$)/.test(p) || /^\/(az|en|ru)?$/.test(p)) return false;
        const r = a.getBoundingClientRect();
        const cs = getComputedStyle(a);
        return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
      };
      for (const scope of ['header', 'nav', 'main', 'footer', 'body']) {
        const a = [...document.querySelectorAll(`${scope} a[href]`)].find(ok);
        if (a) {
          a.setAttribute('data-perf-nav', '1');
          return true;
        }
      }
      return false;
    });
    if (!found) return { error: 'no internal link to another page (pass --nav-link)' };
    link = page.locator('[data-perf-nav="1"]').first();
  }
  if (!(await link.count())) return { error: `--nav-link ${selector} not found` };
  const href = await link.getAttribute('href');
  await page.evaluate(() => window.scrollTo(0, 0));
  const probe = page
    .evaluate(
      () =>
        new Promise((resolve) => {
          let t0 = null;
          let tUrl = null;
          let lastMut = 0;
          const start = location.href;
          addEventListener('pointerdown', () => (t0 = performance.now()), { capture: true, once: true });
          const mo = new MutationObserver(() => (lastMut = performance.now()));
          mo.observe(document.documentElement, { subtree: true, childList: true, characterData: true });
          const tick = () => {
            const t = performance.now();
            if (t0 !== null && tUrl === null && location.href !== start) tUrl = t;
            // settled = 400 ms without DOM mutations; pages with a carousel/ticker never go quiet, so cap at 5 s after the URL change
            const noisy = tUrl !== null && t - tUrl > 5000;
            if (tUrl !== null && (t - Math.max(lastMut, tUrl) > 400 || noisy)) {
              mo.disconnect();
              const settled = noisy ? tUrl : Math.max(lastMut, tUrl);
              requestAnimationFrame(() => requestAnimationFrame((p) => resolve({ urlChangeMs: tUrl - t0, contentSettledMs: settled - t0, paintMs: (noisy ? settled : p) - t0, noisy, t0 })));
            } else if (t0 !== null && t - t0 > 15000) {
              mo.disconnect();
              resolve({ error: 'URL did not change within 15 s', t0 });
            } else requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        })
    )
    .catch((e) => ({ error: `full page load? ${e.message.split('\n')[0]}` }));
  const tStart = Date.now();
  await link.click();
  const r = await probe;
  if (r.error && /full page/.test(r.error)) {
    await page.waitForLoadState('load').catch(() => {});
    return { href, hardNavigation: true, loadMs: Date.now() - tStart };
  }
  const round = (v) => (typeof v === 'number' ? Math.round(v) : v);
  const lt = r.t0 != null ? await frameStats(page, r.t0, r.t0 + (r.paintMs || 0)) : {};
  return { href, urlChangeMs: round(r.urlChangeMs), contentSettledMs: round(r.contentSettledMs), paintMs: round(r.paintMs), longTasks: lt.longTasks, longestTaskMs: lt.longestTaskMs, noisy: r.noisy || undefined, error: r.error };
}

function findLighthouse() {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [];
  for (let d = here; ; d = dirname(d)) {
    candidates.push(join(d, 'node_modules', 'lighthouse', 'cli', 'index.js'));
    if (dirname(d) === d) break;
  }
  try {
    const g = execSync('npm root -g', { encoding: 'utf8', timeout: 15000, stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    candidates.push(join(g, 'lighthouse', 'cli', 'index.js'));
  } catch {
    /* no npm */
  }
  return candidates.find((c) => existsSync(c)) || null;
}

/* ---------------------------------------------------------------- run */
mkdirSync(out, { recursive: true });
const browser = await launchBrowser();
const results = [];
let devWarned = false;
try {
  for (const route of routes) {
    const samples = [];
    for (let run = 0; run < runs; run += 1) {
      const context = await newContext(browser, {
        theme,
        width: dev.width,
        height: dev.height,
        base,
        deviceScaleFactor: dev.deviceScaleFactor,
        mobile: dev.mobile,
        reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
        extra: dev.ua ? { userAgent: dev.ua } : {},
      });
      if (route.admin) await loginContext(context, { api, base });
      await context.addInitScript(INSTRUMENT);
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
      if (network === 'slow4g') {
        await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
      }
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle });
      const row = { route: route.path, admin: route.admin, run: run + 1 };
      try {
        await page.goto(base + route.path, { waitUntil: 'load', timeout: 90000 });
        await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
        await page.waitForTimeout(2500); // let hydration long tasks land for TBT
        Object.assign(row, await loadMetrics(page)); // before any input (LCP stops at first input)
        if (row.looksLikeDev && !devWarned) {
          devWarned = true;
          console.warn('warning: this looks like `next dev` — use `next build && next start` for real numbers');
        }
        row.scroll = await scrollScenario(page);
        row.routeChange = await routeChangeScenario(page, args['nav-link']);
      } catch (e) {
        row.error = e.message.split('\n')[0];
      }
      samples.push(row);
      console.log(JSON.stringify(row));
      await context.close();
    }
    // median across runs
    const m = (k, src = (s) => s[k]) => median(samples.map(src));
    const first = samples.find((s) => !s.error) || samples[0];
    results.push({
      route: route.path,
      admin: route.admin,
      runs: samples.length,
      ttfb: m('ttfb'),
      fcp: m('fcp'),
      lcp: m('lcp'),
      lcpElement: first.lcpElement,
      cls: m('cls'),
      tbt: m('tbt'),
      longTasks100: m('longTasks100'),
      longestTask: m('longestTask'),
      jsBytes: m('jsBytes'),
      totalBytes: m('totalBytes'),
      requests: m('requests'),
      fonts: first.fonts || [],
      scroll: first.scroll && { fps: m(null, (s) => s.scroll?.fps), dropped: m(null, (s) => s.scroll?.dropped), worstFrameMs: m(null, (s) => s.scroll?.worstFrameMs), longTasks: m(null, (s) => s.scroll?.longTasks) },
      routeChange: first.routeChange && {
        href: first.routeChange.href,
        hardNavigation: first.routeChange.hardNavigation,
        noisy: first.routeChange.noisy,
        error: first.routeChange.error,
        urlChangeMs: m(null, (s) => s.routeChange?.urlChangeMs),
        contentSettledMs: m(null, (s) => s.routeChange?.contentSettledMs),
        paintMs: m(null, (s) => s.routeChange?.paintMs ?? s.routeChange?.loadMs),
      },
      error: samples.every((s) => s.error) ? samples[0].error : undefined,
      samples,
    });
  }
} finally {
  await browser.close();
}

/* ---------------------------------------------------------------- lighthouse (optional, only if already installed) */
let lighthouse = null;
if (truthy(args.lighthouse)) {
  const cli = findLighthouse();
  if (!cli) {
    lighthouse = { skipped: 'lighthouse not installed (not added as a dependency) — skipped' };
    console.log(lighthouse.skipped);
  } else {
    const { chromium } = await import('playwright');
    lighthouse = {};
    for (const route of routes.filter((r) => !r.admin)) {
      const file = join(out, `lighthouse-${route.path.replace(/[^\w]+/g, '_') || 'home'}.json`);
      const r = spawnSync(process.execPath, [cli, base + route.path, '--quiet', '--output=json', `--output-path=${file}`, '--only-categories=performance,accessibility,best-practices,seo', '--chrome-flags=--headless=new'], {
        env: { ...process.env, CHROME_PATH: chromium.executablePath() },
        encoding: 'utf8',
        timeout: 240000,
      });
      if (r.status === 0 && existsSync(file)) {
        const { readFileSync } = await import('node:fs');
        const cats = JSON.parse(readFileSync(file, 'utf8')).categories;
        lighthouse[route.path] = Object.fromEntries(Object.entries(cats).map(([k, v]) => [k, v.score]));
      } else lighthouse[route.path] = { error: (r.stderr || r.error?.message || 'failed').split('\n')[0] };
      console.log(`lighthouse ${route.path}: ${JSON.stringify(lighthouse[route.path])}`);
    }
  }
}

/* ---------------------------------------------------------------- report */
const ms = (v) => (v == null ? '–' : `${Math.round(v)}`);
const kb = (v) => (v == null ? '–' : `${Math.round(v / 1024)}`);
const conf = `${device === 'moto' ? 'Moto G Power 412×823 @1.75x' : 'desktop 1440×900'}, CPU ${throttle}x, network ${network}, ${reducedMotion ? 'reduced motion' : 'motion on'}, ${theme}, median of ${runs}`;
const md = [
  `**Perf probe** — ${base} — ${conf}`,
  '',
  '| route | TTFB | FCP | LCP | CLS | TBT | long tasks >100ms | JS KB | total KB | requests | fonts | scroll fps / dropped / worst ms | route change → paint ms |',
  '|---|---|---|---|---|---|---|---|---|---|---|---|---|',
];
for (const r of results) {
  if (r.error) {
    md.push(`| ${r.admin ? 'admin:' : ''}${r.route} | error: ${r.error} |||||||||||| `);
    continue;
  }
  const rc = r.routeChange;
  const rcText = !rc ? '–' : rc.error && rc.paintMs == null ? rc.error : `${ms(rc.paintMs)}${rc.hardNavigation ? ' (full load)' : ''}${rc.noisy ? ' (URL change only: DOM never went quiet)' : ''} (${rc.href})`;
  md.push(
    `| ${r.admin ? 'admin:' : ''}${r.route} | ${ms(r.ttfb)} | ${ms(r.fcp)} | ${ms(r.lcp)} | ${r.cls ?? '–'} | ${ms(r.tbt)} | ${r.longTasks100 ?? '–'} | ${kb(r.jsBytes)} | ${kb(r.totalBytes)} | ${r.requests ?? '–'} | ${r.fonts.length} | ` +
      `${r.scroll ? `${r.scroll.fps} / ${r.scroll.dropped} / ${r.scroll.worstFrameMs}` : '–'} | ${rcText} |`
  );
}
md.push('', '<details><summary>LCP elements and fonts</summary>', '');
for (const r of results) md.push(`- \`${r.route}\` LCP: ${r.lcpElement || '–'}; fonts: ${r.fonts.join(', ') || 'none'}`);
md.push('', '</details>');
if (lighthouse && !lighthouse.skipped) {
  md.push('', '| route | performance | accessibility | best-practices | seo |', '|---|---|---|---|---|');
  for (const [route, s] of Object.entries(lighthouse)) md.push(s.error ? `| ${route} | ${s.error} |||| ` : `| ${route} | ${s.performance} | ${s.accessibility} | ${s['best-practices']} | ${s.seo} |`);
} else if (lighthouse?.skipped) md.push('', `_Lighthouse: ${lighthouse.skipped}_`);

writeFileSync(join(out, 'perf.json'), JSON.stringify({ base, config: { device, throttle, network, reducedMotion, theme, runs }, results, lighthouse }, null, 2));
writeFileSync(join(out, 'perf.md'), `${md.join('\n')}\n`);
console.log(`\n${md.join('\n')}\n\nSaved ${join(out, 'perf.json')} and ${join(out, 'perf.md')}`);
