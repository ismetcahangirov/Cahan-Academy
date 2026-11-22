// Shared Playwright helpers for screenshots.mjs, color-audit.mjs and perf-probe.mjs.
// LOCALHOST ONLY: every script refuses to run against a non-local host (never production).
//
// Theme: the site keeps 'light' | 'dark' | 'system' in localStorage['theme'] and an inline <head>
// script sets <html class="dark">. newContext() writes the key before any page script runs AND
// emulates the matching prefers-color-scheme, so both the class and media-query paths agree.
// Cookie banner: cookie_consent=accepted is set unless { consent: false } (--consent 0).
// Admin: routes prefixed "admin:" log in through the mock API (POST /auth/login) and carry the
// refreshToken cookie that apps/web/middleware.ts requires for /dashboard. Cookies are host-scoped
// (not port-scoped), so the cookie is valid for both the API (5101) and the site (3101).
import { chromium } from 'playwright';

/* ---------------------------------------------------------------- args */
/** --key value | --key=value | --flag (boolean "1"). Repeated keys: last wins. */
export function parseArgs(argv = process.argv.slice(2)) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const eq = a.indexOf('=');
    if (eq > 0) {
      args[a.slice(2, eq)] = a.slice(eq + 1);
    } else if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
      args[a.slice(2)] = argv[i + 1];
      i += 1;
    } else {
      args[a.slice(2)] = '1';
    }
  }
  return args;
}
export const truthy = (v, dflt = false) => (v === undefined ? dflt : !['0', 'false', 'no', 'off', ''].includes(String(v).toLowerCase()));
export const list = (v, dflt) => String(v ?? dflt).split(',').map((s) => s.trim()).filter(Boolean);

export const DEFAULT_BASE = 'http://localhost:3101';
export const DEFAULT_API = 'http://localhost:5101/api';

export function assertLocal(url) {
  const host = new URL(url).hostname;
  if (!['localhost', '127.0.0.1', '::1', '[::1]'].includes(host)) {
    throw new Error(`Refusing to run against ${host}: these scripts are for the local stack only.`);
  }
}

/* ---------------------------------------------------------------- browser + context */
export async function launchBrowser(opts = {}) {
  return chromium.launch({ headless: true, ...opts });
}

/**
 * Browser context for one theme x width.
 * { theme: 'light'|'dark', width, height?, base, consent = true, reducedMotion?, deviceScaleFactor?, mobile? }
 */
export async function newContext(browser, { theme = 'light', width = 1440, height, base = DEFAULT_BASE, consent = true, reducedMotion, deviceScaleFactor = 1, mobile, renderAll = true, extra = {} } = {}) {
  const isMobile = mobile ?? width < 600;
  const context = await browser.newContext({
    viewport: { width, height: height || (width < 600 ? 844 : 900) },
    deviceScaleFactor,
    isMobile,
    hasTouch: isMobile,
    colorScheme: theme === 'dark' ? 'dark' : 'light',
    reducedMotion: reducedMotion || 'no-preference',
    locale: 'az-AZ',
    ...extra,
  });
  await context.addInitScript((th) => {
    try {
      localStorage.setItem('theme', th);
    } catch {
      /* storage blocked: colorScheme emulation still applies */
    }
  }, theme);
  // Sections with `content-visibility: auto` (.cv-auto) are not painted while off-screen, so a full-page
  // screenshot or a page-wide colour audit would see them blank. Render everything for those tools;
  // perf-probe passes renderAll: false to measure the real page.
  if (renderAll) {
    await context.addInitScript(() => {
      const add = () => {
        const s = document.createElement('style');
        s.dataset.qa = 'render-all';
        s.textContent = '.cv-auto{content-visibility:visible!important}';
        document.head.appendChild(s);
      };
      if (document.head) add();
      else document.addEventListener('DOMContentLoaded', add, { once: true });
    });
  }
  if (consent) await context.addCookies([{ name: 'cookie_consent', value: 'accepted', url: new URL(base).origin }]);
  return context;
}

/* ---------------------------------------------------------------- admin login */
const loginCache = new Map();

/** POST /auth/login on the (mock) API from Node; returns { accessToken, refreshToken, user }. */
export async function apiLogin(api, { email, password } = {}) {
  assertLocal(api);
  const creds = { email: email || process.env.ADMIN_EMAIL || 'admin@cahan.az', password: password || process.env.ADMIN_PASSWORD || 'mock-admin' };
  const key = `${api}|${creds.email}`;
  if (loginCache.has(key)) return loginCache.get(key);
  const res = await fetch(`${api.replace(/\/$/, '')}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(creds) });
  if (!res.ok) throw new Error(`Admin login on ${api} failed: HTTP ${res.status} (is the mock API running? node scripts/mock-api.mjs --port 5101)`);
  const body = await res.json();
  const setCookie = (res.headers.getSetCookie?.() || [res.headers.get('set-cookie') || '']).join('\n');
  const fromCookie = setCookie.match(/refreshToken=([^;\s]+)/)?.[1];
  const session = { ...body.data, refreshToken: fromCookie || body.data?.refreshToken };
  if (!session.refreshToken) throw new Error('Login response carried no refresh token');
  loginCache.set(key, session);
  return session;
}

/** Give the context the refreshToken cookie for the site host and the API host. */
export async function loginContext(context, { api = DEFAULT_API, base = DEFAULT_BASE, email, password } = {}) {
  const s = await apiLogin(api, { email, password });
  const hosts = [...new Set([new URL(base).hostname, new URL(api).hostname])];
  await context.addCookies(hosts.map((domain) => ({ name: 'refreshToken', value: s.refreshToken, domain, path: '/', httpOnly: true, sameSite: 'Lax' })));
  return s;
}

/** Alternative: log in through the real /login form (exercises the UI). */
export async function loginViaForm(page, { base = DEFAULT_BASE, email = 'admin@cahan.az', password = 'mock-admin' } = {}) {
  await page.goto(`${base}/login`, { waitUntil: 'domcontentloaded' });
  await page.locator('input[type="email"], input[name="email"]').first().fill(email);
  await page.locator('input[type="password"]').first().fill(password);
  await Promise.all([page.waitForURL(/\/dashboard/, { timeout: 15000 }), page.locator('button[type="submit"]').first().click()]);
}

/* ---------------------------------------------------------------- targets */
/**
 * "/,/az/courses,admin:/dashboard/courses" -> [{ admin, path }]. Prefix "public:" is accepted too.
 * Paths may use templates resolved from the API: {course} {teacher} {post} (first slug of each list).
 */
export function parseRoutes(spec) {
  return list(spec, '/')
    .map((s) => {
      const m = s.match(/^(admin|public):(.*)$/);
      return m ? { admin: m[1] === 'admin', path: m[2] || '/' } : { admin: false, path: s };
    });
}

export async function resolveIds(api) {
  const get = async (p) => {
    try {
      const r = await fetch(`${api.replace(/\/$/, '')}${p}`);
      return r.ok ? (await r.json()).data || [] : [];
    } catch {
      return [];
    }
  };
  const [courses, teachers, posts] = await Promise.all([get('/courses'), get('/teachers'), get('/blog')]);
  return { course: courses[0]?.slug, teacher: teachers[0]?.slug, post: posts[0]?.slug };
}

export const fillTemplate = (path, ids) =>
  path.replace(/\{(\w+)\}/g, (_, k) => {
    if (!ids[k]) throw new Error(`No value for {${k}} (is the mock API running?)`);
    return ids[k];
  });

/**
 * Work list from --plan <json> (array of { path, admin?, name?, actions?, themes?, widths? }, path may be "admin:/x")
 * or --routes (+ --actions/--name applied to every route). --only <regex> filters either.
 */
export async function loadTargets(args, api, readFile) {
  let items;
  if (args.plan) {
    items = JSON.parse(readFile(args.plan, 'utf8')).map((e) => {
      const [r] = parseRoutes(e.path);
      return { ...e, path: r.path, admin: e.admin ?? r.admin };
    });
  } else {
    items = parseRoutes(args.routes || '/').map((r) => ({ ...r, actions: args.actions, name: args.name }));
  }
  if (args.only) {
    const re = new RegExp(args.only, 'i');
    items = items.filter((e) => re.test(`${e.admin ? 'admin:' : ''}${e.path}${e.name ? `#${e.name}` : ''}`));
  }
  const ids = items.some((e) => /\{\w+\}/.test(e.path)) ? await resolveIds(api) : {};
  return items.map((e) => ({ ...e, rawPath: e.path, path: fillTemplate(e.path, ids), steps: parseActions(e.actions) }));
}

/** File-name slug: "/" -> home, "/az/courses" -> az_courses, "/_kit" -> _kit; + "-<name>" */
export const targetSlug = (t) => {
  const p = (t.rawPath || t.path).split('?')[0].replace(/^\/+|\/+$/g, '').replace(/[{}]/g, '').replace(/[\\/:?=&#;]+/g, '_');
  return `${p || 'home'}${t.name ? `-${t.name}` : ''}`;
};

/* ---------------------------------------------------------------- page helpers */
export async function settle(page, { idleTimeout = 8000, pause = 500 } = {}) {
  await page.waitForLoadState('networkidle', { timeout: idleTimeout }).catch(() => {});
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
  await page.waitForTimeout(pause);
}

/**
 * Scroll to the bottom in viewport-sized steps (fires IntersectionObserver reveals, lazy images,
 * whileInView), wait for what that loaded, then return to the top.
 */
export async function scrollThrough(page, { stepRatio = 0.8, delay = 140, maxSteps = 80 } = {}) {
  await page.evaluate(
    async ({ stepRatio: sr, delay: d, maxSteps: max }) => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const root = document.scrollingElement || document.documentElement;
      for (let i = 0; i < max; i += 1) {
        const before = root.scrollTop;
        window.scrollBy(0, Math.max(200, window.innerHeight * sr));
        await sleep(d);
        if (root.scrollTop === before && root.scrollTop + window.innerHeight >= root.scrollHeight - 2) break;
      }
      await sleep(d * 2);
      window.scrollTo(0, 0);
      await sleep(d);
    },
    { stepRatio, delay, maxSteps }
  );
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  // lazy images that started loading during the scroll
  await page
    .evaluate(() => Promise.race([Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; }))), new Promise((r) => setTimeout(r, 4000))]))
    .catch(() => {});
}

/** Wait (max 3 s) until finite animations have finished, so nothing is sampled mid-fade. */
export async function finishAnimations(page) {
  await page
    .evaluate(() =>
      Promise.race([
        Promise.all(document.getAnimations().filter((a) => a.effect?.getTiming?.().iterations !== Infinity).map((a) => a.finished.catch(() => {}))),
        new Promise((r) => setTimeout(r, 3000)),
      ])
    )
    .catch(() => {});
}

/** { blank: no visible text in <body>, overlay: text of the Next.js dev error overlay (or null), status } */
export async function pageHealth(page) {
  return page
    .evaluate(() => {
      const sr = document.querySelector('nextjs-portal')?.shadowRoot;
      const dialog = sr?.querySelector('[data-nextjs-dialog], [data-nextjs-dialog-overlay], [data-nextjs-error-overlay]');
      return {
        blank: !(document.body?.innerText || '').trim(),
        overlay: dialog ? (dialog.textContent || 'error').replace(/\s+/g, ' ').trim().slice(0, 160) : null,
      };
    })
    .catch((e) => ({ blank: true, overlay: null, error: String(e) }));
}

/**
 * Open a target: goto, settle, (one reload if the page came up blank — dev recompiles), optional
 * scroll-through, run actions. Sets page.__health = pageHealth() so callers can flag error overlays.
 * Throws on a blank page or an admin route that bounced to /login. Returns the response (or null).
 */
export async function openTarget(page, target, { base, scroll = true, log = () => {} } = {}) {
  let resp = await page.goto(base + target.path, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await settle(page);
  let health = await pageHealth(page);
  if (health.blank && !health.overlay) {
    log(`  (blank page, reloading once: ${target.path})`);
    await page.waitForTimeout(2000);
    resp = await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
    await settle(page);
    health = await pageHealth(page);
  }
  if (target.admin && /\/login(\/|$|\?)/.test(new URL(page.url()).pathname)) {
    throw new Error(`redirected to ${new URL(page.url()).pathname} — admin session not accepted (mock API running? NEXT_PUBLIC_API_URL pointing at it?)`);
  }
  if (health.blank && !health.overlay) throw new Error(`blank page (no visible text) at ${page.url()}${resp ? ` — HTTP ${resp.status()}` : ''}`);
  if (scroll) await scrollThrough(page);
  await runActions(page, target.steps || [], { log });
  await finishAnimations(page);
  page.__health = { ...health, status: resp?.status() ?? null };
  return resp;
}

/* ---------------------------------------------------------------- interaction steps
 * Open modals, menus, toasts … before a screenshot / audit.
 *   --actions "click=role=button[name=/Yeni/] ; wait=400"
 * Steps (separated by " ; ", or an array in a plan file):
 *   click=<selector>  dblclick=<selector>  hover=<selector>  focus=<selector>  check=<selector>
 *   fill=<selector>|<text>   select=<selector>|<value>   press=<key> (Escape, Tab …)
 *   wait=<ms>   waitfor=<selector>   scroll=<selector> (into view)   scrollto=<y|bottom|top>
 *   eval=<js expression>   dialog=accept|dismiss (answer the next alert/confirm)
 * Selectors are Playwright selectors (css, text=…, role=button[name="…"], >> chains); first VISIBLE match.
 * A step prefixed with "?" is optional: skipped when its selector is missing.
 */
const STEP = /^(\??)(click|dblclick|hover|focus|check|fill|press|select|wait|waitfor|scroll|scrollto|eval|dialog)=(.*)$/s;

export function parseActions(spec) {
  if (!spec) return [];
  // split on ";" only where the next token starts a known step, so ";" inside eval=/selectors survives
  const items = Array.isArray(spec) ? spec : String(spec).split(/\s*;\s*(?=\??(?:click|dblclick|hover|focus|check|fill|press|select|wait|waitfor|scroll|scrollto|eval|dialog)=)/);
  return items
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const m = s.match(STEP);
      if (!m) throw new Error(`Unknown action step: ${s}`);
      return { optional: m[1] === '?', op: m[2], arg: m[3] };
    });
}

export async function runActions(page, steps, { log = () => {} } = {}) {
  for (const { optional, op, arg } of steps) {
    const cut = ['fill', 'select'].includes(op) ? arg.lastIndexOf('|') : -1;
    const sel = cut >= 0 ? arg.slice(0, cut) : arg;
    const value = cut >= 0 ? arg.slice(cut + 1) : undefined;
    const loc = () => page.locator(`${sel} >> visible=true`).first();
    try {
      if (['click', 'dblclick', 'hover', 'focus', 'check', 'fill', 'select', 'waitfor', 'scroll'].includes(op)) {
        await loc().waitFor({ state: 'visible', timeout: optional ? 2500 : 10000 });
      }
      switch (op) {
        case 'click': await loc().click(); break;
        case 'dblclick': await loc().dblclick(); break;
        case 'hover': await loc().hover(); break;
        case 'focus': await loc().focus(); break;
        case 'check': await loc().check(); break;
        case 'fill': await loc().fill(value ?? ''); break;
        case 'select': await loc().selectOption(value ?? ''); break;
        case 'press': await page.keyboard.press(arg); break;
        case 'wait': await page.waitForTimeout(Number(arg)); break;
        case 'waitfor': break;
        case 'scroll': await loc().scrollIntoViewIfNeeded(); break;
        case 'scrollto':
          await page.evaluate((y) => window.scrollTo(0, y === 'bottom' ? document.documentElement.scrollHeight : y === 'top' ? 0 : Number(y)), arg);
          break;
        case 'eval': await page.evaluate(arg); break;
        case 'dialog': page.once('dialog', (d) => (arg === 'dismiss' ? d.dismiss() : d.accept())); break;
        default: break;
      }
    } catch (e) {
      if (!optional) throw new Error(`Action ${op}=${arg} failed: ${e.message.split('\n')[0]}`);
      log(`  (skipped optional ${op}=${arg})`);
    }
  }
  if (steps.length) await page.waitForTimeout(450);
}
