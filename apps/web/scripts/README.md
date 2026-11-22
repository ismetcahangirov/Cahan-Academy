# apps/web/scripts: local QA tooling

These scripts check the ornate redesign: the colour law, screenshots and performance. They run only against `localhost` and refuse any other host. Never point them at production.

## Local recipe

```bash
cd apps/web
node scripts/mock-api.mjs --port 5101                                   # terminal 1: fake API
NEXT_PUBLIC_API_URL=http://localhost:5101/api npx next dev -p 3101      # terminal 2 (or: next build && next start -p 3101)
node scripts/screenshots.mjs --routes "/,/_kit" --out ../../../shots/x
node scripts/color-audit.mjs --routes "/,admin:/dashboard/courses" --out ../../../audit/x
node scripts/color-lint.mjs
node scripts/perf-probe.mjs --routes "/" --out ../../../perf/x            # against `next start`, not `next dev`
```

On Windows PowerShell, set the variable first: `$env:NEXT_PUBLIC_API_URL='http://localhost:5101/api'; npx next dev -p 3101`.

In Git Bash, put `MSYS_NO_PATHCONV=1` in front of the command. Without it, MSYS rewrites `--routes "/,/courses"` into Windows paths such as `C:\Program Files\Git\`.

Never run two `next dev` servers in the same `apps/web`. They share `.next` and break each other.

To check that the scripts saw a working page: `openTarget` reloads a blank page once, then fails. An open Next.js dev error overlay counts as a failure in screenshots and in the audit. An audit that ran zero colour checks fails, because the page was blank or `--scope` matched nothing.

Playwright comes from the root `node_modules` (`@playwright/test`). If Chromium is missing, run `npx playwright install chromium`.

## Shared flags (screenshots, color-audit, perf-probe)

| flag | default | meaning |
|---|---|---|
| `--base` | `http://localhost:3101` | site under test (must be local) |
| `--api` | `http://localhost:5101/api` | API used for admin login and `{course}` / `{teacher}` / `{post}` templates |
| `--routes` | `/` | comma list. Prefix a route with `admin:` to log in first, e.g. `admin:/dashboard/courses`. Paths may use `{course}`, `{teacher}` or `{post}` (the first slug from the API), e.g. `/courses/{course}` |
| `--themes` | `light,dark` | sets `localStorage.theme` before any page script runs and emulates `prefers-color-scheme` to match |
| `--widths` | `1440,390` | viewport widths. The height is 900, or 844 below 600 px |
| `--consent` | `1` | sets the cookie `cookie_consent=accepted` so the banner does not cover the page. Use `0` to show it |
| `--scroll` | `1` | scrolls to the bottom in steps (fires reveals and lazy images), then back to the top |
| `--reduced-motion` | screenshots `0`, audit `1` | emulates `prefers-reduced-motion: reduce` |
| `--actions` | none | steps run before capture, separated by `;`. Example: `click=role=button[name=/Yeni/] ; wait=300` (full step list in `lib/session.mjs`) |
| `--name` | none | suffix for the file name when `--actions` is used |
| `--plan` / `--only` | none | `--plan` takes a JSON array of `{ path, admin?, name?, actions?, themes?, widths? }`. `--only` is a regex filter |

How admin login works: the script calls `POST <api>/auth/login` from Node (default `admin@cahan.az` / `mock-admin`, or `ADMIN_EMAIL` / `ADMIN_PASSWORD`). It then gives the browser the `refreshToken` cookie, which `middleware.ts` checks before it serves `/dashboard`. `AuthContext` then refreshes the session against the API. Cookies are scoped to the host, not the port, so one cookie works for both 5101 and 3101.

## mock-api.mjs

```bash
node scripts/mock-api.mjs --port 5101       # or PORT=5101
BULK=40 node scripts/mock-api.mjs           # every list padded to about 40 items (long-list shots and perf)
DELAY=800 node scripts/mock-api.mjs         # slow responses (skeleton and loading states)
MOCK_PUBLIC_URL=http://127.0.0.1:5101 ...   # origin used in fixture image URLs
node scripts/mock-api.mjs --images none     # (or MOCK_IMAGES=none) every fixture image is null: use it while
                                            # next.config.ts has no remotePatterns entry for http://localhost
```

- Implements every endpoint the web app calls, with the same response shapes as `apps/api` (`{ success, message?, data }`). Public routes return strings for the `?locale=` you ask for (default `az`). Admin routes return raw rows: snake_case for the admin course list, `{ post, author }` for the admin blog list.
- Data lives in memory: create, update and delete last until the process stops. `POST /api/__mock/reset` restores the fixtures.
- Admin login accepts any email and password. The password `wrong` returns 401. Login sets `refreshToken=mock-refresh; Path=/; HttpOnly; SameSite=Lax`. Access tokens look like `mock-access.<id>.<n>`. Admin routes without a valid Bearer token return 401, the same as the real API, so the refresh flow gets exercised.
- Fixtures are deterministic Azerbaijani text (ə ı ş ğ ç ö ü İ) with en and ru translations. Some images are `null` so the "missing image → sketch placeholder" path is tested. The others are `http://localhost:<port>/api/mock-image/<id>.png`: palette-toned PNGs generated on the fly (`.svg` and `?w=&h=` also work). For `next/image` to load them, `next.config.ts` needs `{ protocol: 'http', hostname: 'localhost' }` in `images.remotePatterns`.
- Unknown routes return 404 `{ success:false, message }` and print `[mock-api] 404 METHOD /path` on stderr, so a missing endpoint shows up in the terminal.

## screenshots.mjs

```bash
node scripts/screenshots.mjs --routes "/,/_kit,/courses" --out C:/dev/landing-ornate/shots/foundation [--full 1]
```

Writes full-page PNGs named `<slug>[-<name>]-<theme>-<width>.png` (`/` → `home`, `/az/courses` → `az_courses`). When `--actions` is used it captures the viewport only, because the modal or menu is the subject. Look at every image.

## color-audit.mjs (runtime colour law)

```bash
node scripts/color-audit.mjs --routes "/,/courses,admin:/dashboard/courses" --out C:/dev/landing-ornate/audit/x [--scope main] [--shots dir]
```

- Every painted colour, after alpha compositing over its backdrop, must lie on white → `#5C000E` → black (±4 per channel; change with `--tolerance`).
- Checks text, backgrounds, borders, outlines, box and text shadows, text decoration, text stroke, caret, accent colour of native checkboxes, radios and ranges (`auto` means the browser's blue), placeholders, selection, scrollbar, SVG fill and stroke, gradient stops in CSS and SVG, and focus rings (it tabs through the page).
- Decodes raster ornaments (`/ornaments/*`, `/brand/*`, `data:` SVG; `next/image` URLs are unwrapped) and checks their pixels.
- Exempt: `[data-user-image]` subtrees, other `<img>`, `<video>` and `<canvas>` (user photos), iframes, mask and clipPath content, and `[data-color-audit-ignore]` (needs a reason in review). Exempt image URLs are listed in the report so stock photos cannot hide there.
- Also warns about text that stays invisible (effective opacity ≈ 0), the "blank section until scrolled" bug.
- Output: `<out>/color-audit.json`, `<out>/color-audit.txt` and per-route counts on stdout. Exits 1 on any violation.

## color-lint.mjs + color-lint-pending.txt (static, CI)

```bash
node apps/web/scripts/color-lint.mjs                  # works from any cwd
node scripts/color-lint.mjs --all                     # also list every violation in pending files
node scripts/color-lint.mjs --write-pending           # pending file = every file that violates now (sorted)
```

- Scans `app`, `components`, `lib` and `context` (`.ts`, `.tsx`, `.css`) for these rules:
  - `hex`: a hex colour that is off the line
  - `rgb`: an `rgb()` colour that is off the line, or an `rgba()` whose alpha colour is not wine. Black or white with alpha is allowed only in `app/globals.css`
  - `color-fn`: `hsl()`, `oklch()` and similar colour functions
  - `named`: CSS named colours
  - `tw-palette`: Tailwind palette colours, such as `bg-gray-500`
  - `tw-alpha`: an opacity modifier on a token or on white or black, such as `text-ink-muted/70` or `bg-black/60`. Only `wine/<n>` and `bordo/<n>` are allowed
  - `legacy`: the old gold `secondary` token
- Output format: `file:line:col  rule  snippet`. In GitHub Actions it also emits `::error` annotations.
- Pending files are summarised and do not fail the run. A violation in any other file exits 1. It warns about pending entries that are now clean or missing; remove those lines.
- Escape hatch: `color-lint-ignore` on the line, with a reason.

## a11y-scan.mjs

```bash
node scripts/a11y-scan.mjs --plan scripts/qa-plan.json --out C:/dev/landing-ornate/shots/x/a11y [--only courses] [--themes light]
```

- Runs axe-core (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `best-practice`) on every target after its actions, so open
  modals, menus and drawers are scanned too. `serious` and `critical` fail the run; `moderate`/`minor` are listed.
- Also: Tab through 30 stops (every stop shows a ring and is visible), focus stays inside an open `aria-modal` dialog,
  and with `prefers-reduced-motion: reduce` nothing loops or runs longer than 200 ms (spinners excepted).
- Output: `<out>/a11y.json`, `<out>/a11y.txt`. axe-core is a devDependency of `@academy/web`.

## qa-plan.json

The shared sweep used by the final QA: every marketing route in az/en/ru, the 404 page, every admin page, and the
interactive states (mobile menu, language menu, form validation, empty results, FAQ open, newsletter error, admin
create/edit modals, confirm dialog, toast, drawer). Use it with `--plan` in screenshots, color-audit and a11y-scan.
Run against `next start` with `BULK=40 node scripts/mock-api.mjs` for realistic list lengths. The `toast` target
deletes a FAQ in the mock (`POST /api/__mock/reset` restores it).

## perf-probe.mjs

```bash
next build && next start -p 3101
node scripts/perf-probe.mjs --routes "/,/courses" --out C:/dev/landing-ornate/perf/x [--runs 3] [--network slow4g] [--reduced-motion 1] [--device desktop]
```

- Setup: 4x CPU throttle through CDP, a Moto G Power–like viewport (412×823 at 1.75x, touch) and the cache disabled.
- Load metrics: TTFB, FCP, LCP and its element, CLS (largest session window), TBT (the sum of long-task time over 50 ms after FCP), long tasks over 100 ms, JS and total KB transferred, request count, and font files.
- Scroll: scrolls the whole page in about 10 steps and reports average fps, dropped frames and the worst frame.
- Route change: clicks an internal link (or `--nav-link <selector>`) and measures URL change, content settled and next paint.
- Output: `<out>/perf.md` is a table to paste into the PR; `<out>/perf.json` has the raw samples. It warns when the target looks like `next dev`.
- `--lighthouse 1` runs Lighthouse only if it is already installed (locally or globally). It is never installed by this script.
