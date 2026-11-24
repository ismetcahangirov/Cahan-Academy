#!/usr/bin/env node
// Full-page screenshots of routes in light + dark at 1440 and 390 px against the LOCAL stack.
//
//   node scripts/screenshots.mjs --routes "/,/_kit,/courses,admin:/dashboard/courses" \
//     --out C:/dev/landing-ornate/shots/foundation [--themes light,dark] [--widths 1440,390] [--full 1]
//
// Files: <out>/<slug>[-<name>]-<theme>-<width>.png  ("/" -> home, "/az/courses" -> az_courses). LOOK at them.
// Flags:
//   --base http://localhost:3101   --api http://localhost:5101/api   (admin: routes log in through the API)
//   --full 1|0        full page (default) or viewport only (always viewport when --actions ran: the modal is the subject)
//   --consent 1|0     pre-accept the cookie banner (default 1)
//   --scroll 1|0      scroll the page through first to fire reveals / lazy images (default 1)
//   --reduced-motion 1   emulate prefers-reduced-motion: reduce
//   --actions "click=role=button[name=/Yeni/] ; wait=300" --name modal   (steps: see scripts/lib/session.mjs)
//   --plan plan.json [--only <regex>]   many targets with their own actions/themes/widths
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DEFAULT_API, DEFAULT_BASE, assertLocal, launchBrowser, list, loadTargets, loginContext, newContext, openTarget, parseArgs, targetSlug, truthy } from './lib/session.mjs';

const args = parseArgs();
const base = (args.base || DEFAULT_BASE).replace(/\/$/, '');
const api = args.api || DEFAULT_API;
const out = args.out || 'shots';
const themes = list(args.themes, 'dark');
const widths = list(args.widths, '1440,390').map(Number);
const fullPage = truthy(args.full, true);
const consent = truthy(args.consent, true);
const scroll = truthy(args.scroll, true);
const reducedMotion = truthy(args['reduced-motion']) ? 'reduce' : 'no-preference';

assertLocal(base);
mkdirSync(out, { recursive: true });
const targets = await loadTargets(args, api, readFileSync);
const browser = await launchBrowser();
let failed = 0;
let written = 0;
try {
  for (const target of targets) {
    for (const theme of target.themes || themes) {
      for (const width of target.widths || widths) {
        const context = await newContext(browser, { theme, width, base, consent, reducedMotion });
        const page = await context.newPage();
        const file = join(out, `${targetSlug(target)}-${theme}-${width}.png`);
        try {
          if (target.admin) await loginContext(context, { api, base });
          await openTarget(page, target, { base, scroll, log: console.log });
          await page.screenshot({ path: file, fullPage: fullPage && !target.steps.length });
          written += 1;
          const h = page.__health || {};
          console.log(`${file}${h.status >= 400 ? `  (HTTP ${h.status})` : ''}${h.overlay ? `  (Next.js error overlay: ${h.overlay})` : ''}`);
          if (h.overlay) failed += 1;
        } catch (e) {
          failed += 1;
          console.log(`FAILED ${file}: ${e.message.split('\n')[0]}`);
        }
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}
console.log(`\n${written} screenshot(s) in ${out}${failed ? `, ${failed} failed` : ''}`);
if (failed) process.exitCode = 1;
