#!/usr/bin/env node
// Colour-law static check (fast, no browser, runs in CI). Brief §1: only #5C000E, #FFFFFF, #000000
// (+ tones on the RGB polyline white -> #5C000E -> black, ±4 per channel) may appear.
//
// Scans apps/web/{app,components,lib,context}/**/*.{ts,tsx,css} (node_modules/.next skipped) for:
//   hex        #rgb/#rgba/#rrggbb/#rrggbbaa off the polyline; alpha hex must be #5C000E-based
//   rgb        rgb()/rgba() off the polyline; alpha must be wine — rgba(0,0,0,a)/rgba(255,255,255,a) only in app/globals.css
//   color-fn   hsl()/hsla()/oklch()/oklab()/lab()/lch()/hwb() literals (write tokens instead)
//   named      CSS named colours other than white/black/transparent/currentColor/inherit
//   tw-palette Tailwind palette families (bg-gray-500, text-amber-400, ring-blue-300/50 …)
//   tw-alpha   opacity modifier on a token / white / black (text-ink-muted/70, bg-black/60, text-white/70 …);
//              only wine/<n> and bordo/<n> are allowed (they stay on the line over white)
//   legacy     the old gold `secondary` token (text-secondary, bg-secondary, var(--secondary) …)
// A line containing `color-lint-ignore` is skipped (put the reason in the same comment; reviewed).
// Whole-line comments (//, /*, *) are skipped.
//
// Pending migration: scripts/color-lint-pending.txt — one path per line relative to apps/web, # comments.
// Violations in pending files are summarised (count per file) and never fail; anything else exits 1.
//
//   node apps/web/scripts/color-lint.mjs            (from any cwd)
//   node scripts/color-lint.mjs --all               list every violation, pending files included
//   node scripts/color-lint.mjs --write-pending     rewrite the pending file = every currently violating file
// Output: <file>:<line>:<col>  <rule>  <snippet>   (paths relative to apps/web). In GitHub Actions, failing
// lines are also emitted as ::error annotations.
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { join, relative, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..'); // apps/web
const DIRS = ['app', 'components', 'lib', 'context'];
const PENDING_FILE = join(ROOT, 'scripts', 'color-lint-pending.txt');
const BW_ALPHA_OK = new Set(['app/globals.css']);
const TOL = 4;
const argv = process.argv.slice(2);
const showAll = argv.includes('--all');
const writePending = argv.includes('--write-pending');
const inCI = process.env.GITHUB_ACTIONS === 'true';
const REPO_PREFIX = relative(join(ROOT, '..', '..'), ROOT).split(sep).join('/'); // "apps/web"

const rel = (p) => relative(ROOT, p).split(sep).join('/');

const pendingText = existsSync(PENDING_FILE) ? readFileSync(PENDING_FILE, 'utf8') : '';
const pending = new Set(
  pendingText
    .split(/\r?\n/)
    .map((l) => l.replace(/#.*/, '').trim())
    .filter(Boolean)
);

const walk = (dir) =>
  !existsSync(dir)
    ? []
    : readdirSync(dir).flatMap((name) => {
        if (name === 'node_modules' || name === '.next') return [];
        const p = join(dir, name);
        if (statSync(p).isDirectory()) return walk(p);
        return /\.(tsx?|css)$/.test(name) && !name.endsWith('.d.ts') ? [p] : [];
      });

/* ---------------------------------------------------------------- polyline math (same as color-audit) */
const WINE = [92, 0, 14];
function polyDist(c) {
  let best = Infinity;
  for (const [p0, p1] of [[[255, 255, 255], WINE], [WINE, [0, 0, 0]]]) {
    for (let i = 0; i <= 512; i += 1) {
      const t = i / 512;
      best = Math.min(best, Math.max(...[0, 1, 2].map((k) => Math.abs(c[k] - (p0[k] + (p1[k] - p0[k]) * t)))));
    }
  }
  return best;
}
const isWine = (c) => Math.max(...[0, 1, 2].map((k) => Math.abs(c[k] - WINE[k]))) <= TOL;
const isBW = (c) => c.every((v) => v <= TOL) || c.every((v) => v >= 255 - TOL);
function hexToRgba(h) {
  let s = h.slice(1);
  if (s.length === 3 || s.length === 4) s = s.split('').map((x) => x + x).join('');
  if (s.length !== 6 && s.length !== 8) return null;
  const n = s.match(/../g).map((x) => parseInt(x, 16));
  return { rgb: n.slice(0, 3), a: n.length === 4 ? n[3] / 255 : 1 };
}

/* ---------------------------------------------------------------- patterns */
const PALETTE = 'gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const UTIL = 'bg|text|border(?:-[trblxyse])?|ring(?:-offset)?|from|via|to|fill|stroke|outline|decoration|shadow|divide|placeholder|accent|caret';
const SIZE_TOKEN = /^(?:xs|sm|base|md|lg|xl|\dxl|\[[\d.]+(?:px|rem|em)\])$/; // text-sm/6 = font-size / line-height
const ALPHA_OK = /^(?:wine|bordo|\[var\(--(?:wine|bordo)\)\]|\(--(?:wine|bordo)\))$/;
const NAMED = 'aliceblue antiquewhite aqua aquamarine azure beige bisque blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat whitesmoke yellow yellowgreen';
const NAMED_RX = `(?:${NAMED.split(' ').join('|')})`;
const RX = {
  hex: /(?<![\w&%])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g,
  rgb: /rgba?\(\s*([\d.]+%?)[\s,]+([\d.]+%?)[\s,]+([\d.]+%?)(?:\s*[,/]\s*([\d.]+%?))?\s*\)/g,
  colorFn: /\b(?:hsla?|oklch|oklab|lab|lch|hwb)\(/g,
  palette: new RegExp(`(?<![\\w-])(?:${UTIL})-(?:${PALETTE})-\\d{2,3}(?:/(?:\\d+|\\[[^\\]]+\\]))?(?![\\w-])`, 'g'),
  alpha: new RegExp(`(?<![\\w-])(${UTIL})-(\\[[^\\]\\s]+\\]|\\(--[\\w-]+\\)|[a-z][\\w-]*)/(\\d+|\\[[^\\]]+\\]|\\(--[\\w-]+\\))(?![\\w-])`, 'g'),
  legacy: new RegExp(`(?<![\\w-])(?:${UTIL})-secondary(?:-[\\w-]+)?(?:/\\d+)?(?![\\w-])|var\\(--(?:color-)?secondary[\\w-]*\\)`, 'g'),
  // CSS: colour-bearing declarations
  cssDecl: /(?:^|[;{\s])((?:--[\w-]+|[a-z-]*(?:color|background|border|outline|fill|stroke|shadow|decoration|caret|accent|column-rule)[a-z-]*))\s*:\s*([^;{}]+)/gi,
  // TS/TSX: style props / SVG attributes with a named colour string
  jsNamed: new RegExp(`\\b(?:fill|stroke|color|stopColor|floodColor|lightingColor|backgroundColor|borderColor|borderTopColor|borderBottomColor|outlineColor|textDecorationColor|caretColor|accentColor|background|stop-color)\\s*[:=]\\s*\\{?\\s*["'\`](${NAMED_RX})["'\`]`, 'gi'),
};
const namedInValue = new RegExp(`(?<![-\\w#.])(${NAMED_RX})(?![-\\w(])`, 'gi');

/* ---------------------------------------------------------------- scan */
const problems = [];
const files = DIRS.flatMap((d) => walk(join(ROOT, d))).sort();

for (const file of files) {
  const r = rel(file);
  const isCss = file.endsWith('.css');
  const bwOk = BW_ALPHA_OK.has(r);
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  let inBlockComment = false;
  lines.forEach((line, i) => {
    const t = line.trim();
    if (inBlockComment) {
      if (t.includes('*/')) inBlockComment = false;
      return;
    }
    if (t.startsWith('/*') && !t.includes('*/')) {
      inBlockComment = true;
      return;
    }
    if (line.includes('color-lint-ignore') || t.startsWith('//') || t.startsWith('*') || (t.startsWith('/*') && t.endsWith('*/')) || t.startsWith('{/*')) return;
    const add = (rule, m, msg) => problems.push({ file: r, line: i + 1, col: m.index + 1, rule, snippet: m[0].trim().slice(0, 70), msg });

    for (const m of line.matchAll(RX.hex)) {
      const c = hexToRgba(m[0]);
      if (!c) continue;
      if (c.a < 1) {
        if (!isWine(c.rgb) && !(bwOk && isBW(c.rgb))) add('hex', m, 'alpha colour must be #5C000E-based');
      } else if (polyDist(c.rgb) > TOL) add('hex', m, `off the white→#5C000E→black line by ${Math.round(polyDist(c.rgb))}`);
    }
    for (const m of line.matchAll(RX.rgb)) {
      const ch = [m[1], m[2], m[3]].map((v) => (v.endsWith('%') ? (parseFloat(v) * 255) / 100 : Number(v)));
      let a = m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : Number(m[4]);
      if (Number.isNaN(a)) a = 1;
      if (a < 1) {
        if (!isWine(ch) && !(bwOk && isBW(ch))) add('rgb', m, 'alpha colour must be rgba(92, 0, 14, a) (black/white alpha only in app/globals.css)');
      } else if (polyDist(ch) > TOL) add('rgb', m, `off the line by ${Math.round(polyDist(ch))}`);
    }
    for (const m of line.matchAll(RX.colorFn)) add('color-fn', m, 'hsl()/oklch()/lab() colour literal — use tokens');
    for (const m of line.matchAll(RX.palette)) add('tw-palette', m, 'Tailwind palette colour — use palette tokens');
    for (const m of line.matchAll(RX.alpha)) {
      const [, util, tok] = m;
      if (ALPHA_OK.test(tok)) continue;
      if (new RegExp(`^(?:${PALETTE})-\\d`).test(tok)) continue; // already reported as tw-palette
      if (util === 'text' && SIZE_TOKEN.test(tok)) continue;
      if (/^secondary/.test(tok)) continue; // already reported as legacy
      if (/^\d/.test(tok)) continue;
      add('tw-alpha', m, 'opacity modifier composites off the tone line — use a tint token (only wine/<n>, bordo/<n> allowed)');
    }
    for (const m of line.matchAll(RX.legacy)) add('legacy', m, 'legacy gold `secondary` token');
    if (isCss) {
      for (const d of line.matchAll(RX.cssDecl)) {
        for (const n of d[2].matchAll(namedInValue)) add('named', { 0: n[0], index: d.index + d[0].indexOf(d[2]) + n.index }, 'named CSS colour — use tokens');
      }
    } else {
      for (const m of line.matchAll(RX.jsNamed)) add('named', m, 'named CSS colour — use tokens');
    }
  });
}

/* ---------------------------------------------------------------- report */
const byFile = new Map();
for (const p of problems) byFile.set(p.file, [...(byFile.get(p.file) || []), p]);
const violatingFiles = [...byFile.keys()].sort();

if (writePending) {
  const header = pendingText.split(/\r?\n/).filter((l) => l.trim().startsWith('#'));
  const body = [...(header.length ? header : ['# Files still to be migrated to the ornate colour law (scripts/color-lint.mjs skips failing on them).', '# When you migrate a file, DELETE its line here in the same PR. Paths are relative to apps/web.']), ...violatingFiles];
  writeFileSync(PENDING_FILE, `${body.join('\n')}\n`);
  console.log(`color-lint: wrote ${violatingFiles.length} file(s) to ${rel(PENDING_FILE)}`);
  process.exit(0);
}

const active = problems.filter((p) => !pending.has(p.file));
const pendingProblems = problems.filter((p) => pending.has(p.file));
const fmt = (p) => `${p.file}:${p.line}:${p.col}  ${p.rule}  ${p.snippet}${showAll ? `  — ${p.msg}` : ''}`;

for (const p of showAll ? problems : active) console.log(`${fmt(p)}${pending.has(p.file) ? '  (pending)' : ''}`);
if (!showAll && pendingProblems.length) {
  console.log(`\npending migration (not failing; --all lists them):`);
  for (const f of violatingFiles.filter((f) => pending.has(f))) console.log(`  ${f}  ${byFile.get(f).length}`);
}
if (inCI) for (const p of active) console.log(`::error file=${REPO_PREFIX}/${p.file},line=${p.line},col=${p.col}::color-lint ${p.rule}: ${p.msg} (${p.snippet})`);

const cleanPending = [...pending].filter((f) => existsSync(join(ROOT, f)) && !byFile.has(f));
const missingPending = [...pending].filter((f) => !existsSync(join(ROOT, f)));
if (cleanPending.length) console.log(`\nwarning: now clean — remove from color-lint-pending.txt:\n${cleanPending.map((f) => `  ${f}`).join('\n')}`);
if (missingPending.length) console.log(`\nwarning: listed in color-lint-pending.txt but missing:\n${missingPending.map((f) => `  ${f}`).join('\n')}`);

const rules = {};
for (const p of active) rules[p.rule] = (rules[p.rule] || 0) + 1;
console.log(
  `\ncolor-lint: ${files.length} files scanned, ${pending.size} pending, ${active.length} violation(s) in ${new Set(active.map((p) => p.file)).size} file(s)` +
    `${active.length ? ` [${Object.entries(rules).map(([k, v]) => `${k} ${v}`).join(', ')}]` : ''}, ${pendingProblems.length} in pending files`
);
process.exit(active.length ? 1 : 0);
