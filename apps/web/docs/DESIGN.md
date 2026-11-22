# Cahan Academy landing · Ornate design system

The contract for every page of `apps/web`. If you restyle a page, read this file top to bottom, use only what it
describes, and run the checks in [§10 Verification](#10-verification). Live gallery of everything below:
**`/kit`** (noindex, not in the sitemap) — `app/[locale]/(marketing)/kit/page.tsx`.

The design language is the **Cahan Academy dashboard's** (`Cahan-Academy-Dashboard/docs/DESIGN.md`), ported to
Next.js 15 + Tailwind v4: same tokens, fonts, ornaments and component classes, so a visitor going from the landing
to the dashboard sees one brand. The landing is *more expressive*: it gets the full reference composition (wine hero
with lace, draped ribbon and wax seal, wavy section joins, parchment bands, sketches, timeline, bookmark ribbons,
ornate portrait frames). The admin CMS (`/dashboard/*`) follows the calmer data-page recipe.

Mood: a manuscript academy in deep wine — lace and satin at the edges, parchment for reading, a calligraphic hand for
short headings, small caps for labels. The ornament frames content and never hides it.

---

## 1. Colour law (hard rule, checked by scripts and CI)

**Only `#5C000E`, `#FFFFFF` and `#000000` exist.** Every rendered colour, after alpha compositing onto what is behind
it, must lie on the RGB polyline **white → #5C000E → black** (±4 per channel). Tone notation in `globals.css`:
`s = 0` white, `s = 1` #5C000E, `s = 2` black.

| segment | formula | examples |
|---|---|---|
| white → wine (`0 ≤ s ≤ 1`) | `rgb(255-163s, 255-255s, 255-241s)` | `#FAF7F8` (.03), `#E2D1D4` (.18), `#C6A6AB` (.35), `#86424D` (.74) |
| wine → black (`1 ≤ s ≤ 2`) | `rgb(92(2-s), 0, 14(2-s))` | `#4A000B` (1.2), `#2E0007` (1.5), `#1E0005` (1.67), `#170004` (1.75) |

**Alpha rule.** `#5C000E` with alpha (`rgba(92,0,14,a)`, `bg-wine/10`, `bg-bordo/20`) is safe over any allowed colour.
`rgba(0,0,0,a)` is safe only over dark (wine→black) surfaces, `rgba(255,255,255,a)` only over light ones — both are
allowed **only in `globals.css` tokens**. **Never put an opacity modifier on a token** (`text-ink-muted/70`,
`bg-primary/90`, `text-white/70`, `border-line/50`): pick the token that already has the tone. Don't put `opacity-*`
on raster ornaments or on tinted text over a dark backdrop (it makes brownish grey).

**Forbidden, concretely:** any Tailwind `gray|slate|zinc|neutral|stone|red|orange|amber|yellow|green|emerald|teal|
cyan|sky|blue|indigo|violet|purple|pink|rose-*` class; `#7B001C`, `#8B0020`, `#800020`, `#C9A84C` (gold) and any grey hex;
the legacy `secondary` (gold) tokens; `bg-black/60 backdrop-blur` overlays (use `--overlay`); `shadow-black/…`;
gradients through foreign hues; gold stars; coloured social icons; green/red status.

**Status without colour**: fill pattern + icon + text (`<StatusPill status="success|partial|pending|warning|excused|error|neutral">`).
Errors in forms: 1.5px `--accent-text` border + `AlertCircle` + bold message (`<FormField error>`). Destructive
buttons: `variant="danger"`. Success/error banners: icon + sentence, never a green/red box.

**Exempt**: photos users upload (course covers, teacher portraits, blog covers) — render them through
`<CoverImage>` (it marks `data-user-image` and frames them). Stock / placeholder URLs (unsplash, example.com,
missing) automatically become a palette-toned sketch. Browser `alert()/confirm()` and native validation bubbles are
off-palette: use `<Modal>` and `noValidate` + zod messages.

## 2. Tokens

All tokens live in `app/globals.css` (`:root` = light, `.dark` = dark, `.theme-wine` = a deep wine panel in either
theme). Tailwind utilities exist for the semantic ones:

| token | utility | light | dark | use |
|---|---|---|---|---|
| `--page` | `bg-page` | `#FAF7F8` | `#120003` | page background |
| `--surface` | `bg-surface` | `#FFFFFF` | `#1E0005` | cards, menus, modals |
| `--surface-2` / `-3` | `bg-surface-2` / `-3` | `#F5F0F1` / `#EBE0E2` | `#270006` / `#370008` | hover/muted, pressed |
| `--paper` | `bg-paper`, `.paper` | `#F8F4F4` | `#170004` | parchment bands (+ texture via `.paper`) |
| `--paper-base`, `--page-base` | — | | | theme paper/page even inside `.theme-wine` (wave fills) |
| `--field` | `bg-field` | `#FFFFFF` | `#170004` | inputs |
| `--ink` | `text-ink` | `#170004` | `#FFFFFF` | body text |
| `--ink-muted` | `text-ink-muted` | `#86424D` | `#C19EA3` | secondary text (AA) |
| `--ink-subtle` | `text-ink-subtle` | `#A5737A` | `#A06B73` | placeholder, disabled, tertiary |
| `--accent` | `bg-accent` | `#5C000E` | `#5C000E` | primary fills (**white inside `.theme-wine`**) |
| `--accent-hover` / `-fg` | | `#4A000B` / `#FFF` | `#742632` / `#FFF` | |
| `--accent-text` | `text-accent-text` | `#5C000E` | `#E2D1D4` | links, active labels, icons |
| `--accent-soft` | `bg-accent-soft` | `#F2EBEC` | `#2E0007` | soft badge / selected |
| `--line` / `-strong` / `-hair` | `border-line…` | `#E2D1D4` / `#C6A6AB` / `#F0E8E9` | `#4A000B` / `#803843` / `#2E0007` | borders |
| `--ornament` / `-soft` / `-strong` | `text-ornament…` | `#5C000E` / `#C6A6AB` / `#3C0009` | `#B68C93` / `#742632` / `#E2D1D4` | SVG ornaments (currentColor) |
| `--focus`, `--focus-soft`, `--overlay`, `--shadow-sm/md/lg`, `--glow-inset`, `--radius-sm/md/lg/xl` (8/12/18/26) | | | | |

`bg-wine` / `bg-bordo` = `#5C000E` literal. **Legacy aliases** (`primary`, `secondary`, `muted`, `muted-foreground`,
`card`, `background`, `foreground`, `border`, `font-heading`, `font-body`) still resolve to palette tones so pages
not yet migrated build and stay readable. **Do not use them in migrated code** — `color-lint` flags them. Note
`accent` now means the solid wine (dashboard naming), not the old grey hover fill.

`.theme-wine` on any element turns its subtree into a deep wine panel with dark tokens and dark ornament variants
(`dark:` utilities apply inside it too). `.hero-wine` (radial wine gradient + grain) and `.band-wine` (vertical
gradient + grain) are its backgrounds.

### Themes (owner requirement)
Light and dark are both first-class. Default = system preference; the header toggle (`components/layout/ThemeToggle`,
also in the mobile drawer) stores `localStorage.theme = 'light' | 'dark'` (try/catch) and `aria-pressed` = dark on.
An inline `<head>` script (`ThemeScript`) applies `.dark` before first paint (no flash; `<html suppressHydrationWarning>`).
**Every page agent must verify both themes** (screenshots + colour audit), and every raster ornament must use its
`-dark` variant in dark mode — the ornament components do that for you; never hard-code `/ornaments/x.webp`.

## 3. Typography

| role | family | class | rules |
|---|---|---|---|
| Script | **Great Vibes** | `.script-title`, `font-script`, `<ScriptTitle>` | short fixed headings (2–4 words): hero, section, page, modal, empty state. **Never** data (course/teacher/post names), buttons, inputs, nav, tables. |
| Serif body + data | **EB Garamond** 400–800 + italic | default `font-serif` | everything readable; `.num` = lining tabular figures; `.time-italic` for dates/times. |
| Small caps | **Cormorant SC** 600/700 | `.sc`, `font-sc` | eyebrows, labels, buttons, badges, nav, table headers. Always `text-transform: uppercase` (built into `.sc`, `.btn`, `.badge`, `.field-label`…). With `<html lang="az">` this gives the dotted **İ** — Cormorant SC draws lowercase `i` dotless ("Giriş" would read "Gırış"). Never remove the uppercase. Cormorant SC has no `₼`. |

Fonts are self-hosted with `next/font/local` (`lib/fonts.ts`, files in `assets/fonts/`, `display: swap`,
metric-adjusted fallback). EB Garamond and Great Vibes are split into a `-latin` subset (Basic Latin, Latin-1,
Latin Ext-A, Ə/ə, punctuation, №, ₼ — preloaded, everything az/en pages need) and a `-cyrillic` subset (only
downloaded on ru pages, via `unicode-range`); Cormorant SC is one small file per weight (600/700, not preloaded).
Proof: `npm run fonts:coverage` (every subset + every family). Rebuild: download the OFL TTFs from
`github.com/google/fonts/ofl/{ebgaramond,greatvibes,cormorantsc}` and run
`pyftsubset <ttf> --unicodes="<range from lib/fonts.ts>" --layout-features='kern,liga,clig,calt,lnum,onum,tnum,pnum,ccmp,locl,mark,mkmk,case' --flavor=woff2 --no-hinting --desubroutinize`.
Do not add other families.

Scale: hero script 3.3→5.6rem; page title 2.7→3.4rem; section 2.35→2.9rem; card/modal script 1.85rem; card title
serif `text-[1.25–1.3rem] font-semibold`; body 1.0625rem; lead 1.1–1.25rem `text-ink-muted`; SC labels 0.8–0.95rem.
Detail pages may show the entity's own name as the page title **in serif** (`text-[2.4rem] font-semibold`), with a
short script phrase above it if wanted.

## 4. Ornaments — when to use which

Import from `@/components/ornament` (all server-component friendly, decorative, `aria-hidden`).

| ornament | use | don't |
|---|---|---|
| `EdelweissGlyph` (8–20px) / `Edelweiss` (≥24px) | primary motif: divider centre, bullets, active nav item, button motif, current timeline step | emoji, hearts, stars as decoration |
| `OrnamentDivider` | under every `ScriptTitle` (built in), between long-text sections, in modals/footers | stacked dividers |
| `CornerFlourish` / `OrnateFrame` | featured panels, stat tiles, teacher portraits, CTA panel, timelines | every row of a dense list |
| `LaceEdge` (CSS bg strip) / `LaceCorner` (lazy img) | section **edges and corners** only (hero, wine bands, footer, drawer) | behind text/data, inside tables |
| `WaveEdge` | where two bands meet; `fill` = colour of the neighbour (`var(--paper-base)`/`var(--page-base)`), `invert` at the top of a band | more than one wave per join |
| `DrapedRibbon` | hero corner, closing CTA, celebratory spots — max one per view region | list pages |
| `BookmarkRibbon` | the ONE featured card in a view (`<Card variant="featured">`, `CourseCard featured`) | several per grid |
| `WaxSeal` | brand/closing moments: hero join, footer join, CTA panel | as a bullet |
| `SketchIllustration` (`books, inkwell, globe, lamp, cap, notebook`) | empty states, section accents, image placeholders (`CoverImage`) | behind text |
| `Timeline` | "how it works", history, schedules | |
| `BrandMark` / `BrandLogo` / `BrandLockup` | brand only (from the owner's paths, currentColor) | retyping "CAHAN ACADEMY" in a font |

Performance notes: the brand marks, `Edelweiss`, `EdelweissGlyph`, `CornerFlourish` and the divider flourish are
`<use>` references into one cached sprite, `public/brand/sprite.svg` (generated by `node scripts/build-brand-sprite.mjs`
from `components/brand/brandPaths.ts` — regenerate after changing either); never import `brandPaths.ts` into a
component (it inlines ~40 KB of path data per use). `draw` on `OrnamentDivider`/`CornerFlourish` renders inline
paths for the one-shot stroke animation — use it only on a single hero divider. Long pages: put `cv-auto`
(`content-visibility: auto`) on every section below the first screen (not on sections whose ornaments overflow
their box — it clips like `overflow: hidden`). No full-bleed raster backgrounds on the first screen (LCP).

Mobile: ornaments shrink, not multiply (lace corners `w-20–w-32`, hide side sketches below `xl`).
To make an ornament fainter use a lighter token (`text-ornament-soft`), never `opacity-*` on rasters.

## 5. Components

`import { Button, Card, CardHeader, Badge, StatusPill, FormField, Input, Textarea, Select, Checkbox, Modal, Spinner,
Skeleton, EmptyState, Table, Reveal } from '@/components/ui'`. Every file starts with a usage comment.

```tsx
<Button>{t('save')}</Button>                                         // primary (one per region)
<Button as={Link} href="/courses" variant="outline">{t('all')}</Button>  // outline pill + edelweiss motif
<Button variant="ghost" iconOnly icon={X} aria-label={t('close')} />
<Button variant="danger" icon={Trash2} size="sm">{t('delete')}</Button>
<Button type="submit" loading={isSubmitting} block size="lg">…</Button>
buttonClass({ variant: 'outline', size: 'sm' })                       // classes for a raw element

<Card className="p-5" /> <Card variant="ornate|paper|featured" hover />  <CardHeader title subtitle actions />
<OrnateFrame paper corners="all|diagonal|none" className="p-6" />
<Badge>{cat}</Badge> <Badge tone="accent|solid" />   <StatusPill status="pending">{t('new')}</StatusPill>

<form noValidate onSubmit={handleSubmit(onSubmit)}>
  <FormField label={t('email')} error={errors.email?.message} hint={t('hint')} required>
    <Input type="email" icon={Mail} {...register('email')} />          // wired to label + describedby
  </FormField>
</form>

<Modal open={open} onClose={close} title={t('enroll.title')} entity={course.title} footer={…}>…</Modal>
<EmptyState sketch="books" title={t('empty_title')} description={t('empty_desc')} action={…} />
<Table caption={t('caption')}><thead>…</thead><tbody>…</tbody></Table>
```

Cards for data: `CourseCard` (`featured`, `priority`), `TeacherCard` (arched portrait frame), `BlogCard` — whole card is
one stretched link. `CoverImage` frames any user photo and swaps placeholders for sketches.

Shell (`components/layout`): `Header` (sticky, lockup, SC nav with edelweiss separators, `LanguageSwitcher`,
`ThemeToggle`, CTA), `MobileMenu` (dialog drawer: focus trap, Escape, focus return, scroll lock), `Footer` (wine band
with wave + seal, logo, links, contact, `FooterNewsletter`), `ThemeScript`, `nav.ts` (links). Home sections:
`components/sections/*` (Hero, Stats, Features, LearningPath, CoursesPreview, TeachersPreview, Testimonials, CTA) —
Stats/Testimonials/CTA are reusable on other pages.

## 6. Page recipes

**Marketing list page** (courses, teachers, blog): a `theme-wine band-wine` head band (`relative overflow-hidden`,
`LaceCorner` tl/tr, centred `ScriptTitle size="page"` with eyebrow + lead, `WaveEdge fill="var(--page-base)"` at the
bottom) → filter row (`Input icon={Search}` + `Select`/pill buttons, wraps on mobile) → grid of cards in
`<Reveal as="ul" stagger>` (each card inside an `<li>`; first card may be `featured`) → `EmptyState` inside a
`card-paper` when nothing matches → pagination with ghost buttons + `.num`.

**Detail page** (course, teacher, post): back link (ghost `ArrowLeft`), then a two-column header — `CoverImage`
(priority) left, right: `Badge`s, entity name in serif `h1`, SC subtitle, key facts (`.num`, icons in `text-ornament`),
primary action (`EnrollButton`). Body in `Card variant="paper"` sections with `ScriptTitle size="section"` headings;
related items as a card grid. Teacher detail: portrait in `OrnateFrame` + `CoverImage rounded="arch"`.

**Form page** (contact): `ScriptTitle` + lead, form in `OrnateFrame paper` or `Card variant="paper"`,
`FormField`s 1 col → 2 cols at `md`, primary `block` submit with `loading`, `noValidate` + zod messages from
`messages`, success as icon + sentence (or `Modal`), side column with contact facts and one sketch.

**Legal / long text** (privacy, terms, blog body): `max-w-3xl` column, `ScriptTitle` + `time-italic` "last updated",
content in `prose prose-ornate` (typography plugin re-toned to the palette), `OrnamentDivider` between sections.

**Admin data page** (`/dashboard/*`): calm — no lace, no ribbons, no waves. `ScriptTitle size="page"` with SC
subtitle (counts) + one primary action; filter row; `Table` on ≥640px, `Card` list below; `StatusPill` for states;
row actions as ghost `iconOnly` buttons with `aria-label`; `Skeleton` rows while loading; `EmptyState` when empty.
Sidebar = a `.theme-wine band-wine` column; header = `site-header` with `ThemeToggle`.

**Admin modal form**: `Modal` (title = short script phrase like "Yeni kurs", `entity` = the item name when editing),
`<form id noValidate>` inside, `FormField` grid, footer: ghost Cancel + primary Save (`form="id"`, `loading`);
destructive confirm = `Modal` + `variant="danger"` (never `confirm()`).

## 7. Motion

Tokens: `--dur-1` 150ms (hover/press), `--dur-2` 250ms (menus, modal), `--dur-3` 400ms (entrances), `--dur-reveal`
700ms (scroll reveal), `--dur-draw` 900ms (one-shot stroke draw), `--ease-silk`, `--stagger` 60ms, `--rise` 8px,
`--rise-lg` 18px. Under `prefers-reduced-motion` all collapse to ~instant and rises to 0.

| need | use |
|---|---|
| scroll reveal | `<Reveal>` / `<Reveal as="ul" stagger>` / `<Reveal fade delay={80}>` |
| one-shot entrance on mount (above the fold) | `.orn-rise` / `.orn-reveal` / `.orn-pop` (CSS only) |
| dropdown, cookie notice | `.orn-pop` / `.orn-rise` |
| drawer | `.drawer` + `data-open` (transform only) |
| hover lift | `card-hover` / `<Card hover>` |
| continuous | `.orn-sway` (hero ribbon) — transform only, off with reduced motion |

**`Reveal` can never blank the page.** Markup is rendered visible (SSR, no JS, crawlers, print). After hydration
`RevealObserver` (mounted once in the locale layout) hides only elements that are still *below the viewport*
(`.is-pending`) and reveals them with IntersectionObserver; nothing on screen at load is ever hidden. Do not use
framer-motion `whileInView`/`initial={{opacity:0}}` for content (that was the blank-section bug). Do not put
`card-hover` on a direct child of a `stagger` list — wrap it in `<li>`.

Rules: animate only `transform`/`opacity`; no animated layout properties, `filter`, `box-shadow`, `backdrop-filter`
(avoid backdrop-filter entirely); `will-change` only while animating; staggers capped at 7 items; no framer-motion in
new code (it is still a dependency for pages not migrated yet).

## 8. Mobile (390px is the reference width)

Gutter 16px (`px-4`); **no horizontal page scroll** (clip decorative overhangs with `overflow-x-clip` on the section);
tap targets ≥ 40px (`btn` md = 44px, `btn-sm` 36px); primary CTAs `block` on phones; two-column card grids only for
compact cards (teachers); modals become bottom sheets; header shows lockup + language + theme toggle + menu.

## 9. Do / don't

Do: one ornament idea per region; centred compositions in heroes; generous air; real data from the API; every new
string in `messages/{az,en,ru}.json` (check each bundle); `<html lang>` = locale (layout does it); images through
`CoverImage`; icons `strokeWidth={1.6}` in `text-ornament` / `text-accent-text`.

Don't: script for data/buttons/nav; `text-*/NN` opacity on tokens; Tailwind palette colours; gold; glows/blur orbs;
`bg-black/60 backdrop-blur-sm`; `rounded-2xl shadow-2xl` generic cards; emoji decoration ("Made with ❤️");
invented facts (counts, ratings, "№1", phones, testimonials) — keep existing copy and list it as "Owner must confirm";
`alert()`/`confirm()`; native validation bubbles; hard-coded `/ornaments/*.webp` without the dark variant.

## 10. Verification

```bash
cd apps/web
npm run mock-api            # terminal 1: fixtures on :5101, no images (BULK=40 for long lists)
#   npm run mock-api:images  = with mock photos; needs next.config remotePatterns for http://localhost
#   (until then only <CoverImage> renders them — it serves non-Cloudinary images unoptimized)
NEXT_PUBLIC_API_URL=http://localhost:5101/api npx next dev -p <your port>   # terminal 2
#   (perf: next build && next start -p <port> with the same env)

# screenshots: light + dark × 1440 + 390 for every page you touch — then LOOK at them
node scripts/screenshots.mjs --base http://localhost:<port> --routes "/,/courses" --out C:/dev/landing-ornate/shots/<agent>
# colour audit (runtime) — must print 0 violations for your routes, both themes, both widths
node scripts/color-audit.mjs --base http://localhost:<port> --routes "/courses,admin:/dashboard/courses" --out C:/dev/landing-ornate/shots/<agent>/audit
# colour lint (static, also in CI): remove your files from scripts/color-lint-pending.txt, then
node scripts/color-lint.mjs
# perf (production server): 4x CPU throttle, mobile
node scripts/perf-probe.mjs --base http://localhost:<port> --routes "/" --out C:/dev/landing-ornate/shots/<agent>/perf
python scripts/font-coverage.py                                        # only if fonts change
# repo checks
npm run lint && npm run test --workspace=@academy/api && npm run build --workspace=@academy/web   # from the root
```

`screenshots.mjs` and `color-audit.mjs` force `.cv-auto` sections to render (otherwise off-screen
`content-visibility: auto` sections would be blank in full-page captures); `perf-probe.mjs` measures the real page.
On Git Bash prefix route arguments with `MSYS_NO_PATHCONV=1` (otherwise `/` becomes `C:/Program Files/Git`).
`admin:` routes log in to the mock API first (any email/password). Two `next dev` servers must not share one
`apps/web/.next` — run one per worktree. Also check interactive states the screenshots miss (drawer, language menu,
modal, form errors, cookie notice, empty state) in both themes and keyboard focus. Script flags and the local recipe:
`scripts/README.md`.
