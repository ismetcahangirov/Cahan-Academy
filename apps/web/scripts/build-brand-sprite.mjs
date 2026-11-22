#!/usr/bin/env node
// Builds public/brand/sprite.svg (symbols: mark, logo, lockup, edelweiss) from components/brand/brandPaths.ts.
// The brand components reference it with <use href="/brand/sprite.svg#…">, so the ~11 KB edelweiss path is
// downloaded once and cached instead of being inlined into every page (HTML + RSC payload) up to 17 times.
//   node scripts/build-brand-sprite.mjs        (re-run whenever brandPaths.ts changes)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, '../components/brand/brandPaths.ts'), 'utf8');

// strip the TypeScript bits so the module body can be evaluated as plain JS
const js = src
  .replace(/export interface[^\n]*\n/g, '')
  .replace(/: BrandGeometry/g, '')
  .replace(/const P: string\[\]/, 'const P')
  .replace(/export const /g, 'const ');
const geo = new Function(`${js}; return { MARK, STACKED, LOCKUP, EDELWEISS };`)();

// every distinct path once in <defs>; symbols reference them (keeps the sprite small)
const ids = new Map();
const pathId = (d) => {
  if (!ids.has(d)) ids.set(d, `p${ids.size}`);
  return ids.get(d);
};
const symbol = (id, g) =>
  `<symbol id="${id}" viewBox="${g.viewBox}">${g.paths
    .map((p) => `<use href="#${pathId(p.d)}"${p.transform ? ` transform="${p.transform}"` : ''}/>`)
    .join('')}</symbol>`;

const symbols = [
  symbol('mark', geo.MARK),
  symbol('logo', geo.STACKED),
  symbol('lockup', geo.LOCKUP),
  symbol('edelweiss', geo.EDELWEISS),
].join('');
const defs = `<defs>${[...ids].map(([d, id]) => `<path id="${id}" d="${d}"/>`).join('')}</defs>`;

// Small ornaments that repeat many times per page (corner flourish, divider flourish, edelweiss glyph).
// Same geometry as the inline versions in components/ornament/* (kept there for the one-shot draw mode);
// change both together.
const NS = 'vector-effect="non-scaling-stroke"';
const ornaments =
  `<symbol id="orn-corner" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round">` +
  `<path ${NS} d="M3 44V15C3 8.4 8.4 3 15 3H44"/>` +
  `<path ${NS} d="M44 3C51 3 54 7.5 51.2 10.2C49 12.3 45.6 10.6 47 8.3"/>` +
  `<path ${NS} d="M3 44C3 51 7.5 54 10.2 51.2C12.3 49 10.6 45.6 8.3 47"/>` +
  `<path ${NS} d="M10 10C15.5 15.5 17 21.5 13.8 24.4C11.6 26.4 8.6 24.4 10.2 22"/>` +
  `<path ${NS} d="M10 10C15.5 15.5 21.5 17 24.4 13.8C26.4 11.6 24.4 8.6 22 10.2"/>` +
  `<circle cx="9" cy="9" r="1.8" fill="currentColor" stroke="none"/>` +
  `<circle cx="28" cy="7.2" r="0.9" fill="currentColor" stroke="none"/>` +
  `<circle cx="7.2" cy="28" r="0.9" fill="currentColor" stroke="none"/></symbol>` +
  `<symbol id="orn-flourish" viewBox="0 0 120 16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" overflow="visible">` +
  `<path ${NS} d="M1 8C30 8 55 8 74 8"/>` +
  `<path ${NS} d="M74 8C86 8 90 2.5 97 2.8C103 3 104.5 9 100 10.2C96.5 11 94.5 7.2 97.5 6"/>` +
  `<path ${NS} d="M74 8C86 8 90 13.5 97 13.2C103 13 104.5 7 100 5.8C96.5 5 94.5 8.8 97.5 10"/>` +
  `<path ${NS} d="M105 8H117"/>` +
  `<circle cx="1.5" cy="8" r="1.1" fill="currentColor" stroke="none"/></symbol>` +
  `<symbol id="orn-glyph" viewBox="-12 -12 24 24" fill="currentColor">` +
  [0, 90, 180, 270].map((a) => `<path d="M0-2.6C1.6-4.8 2-8.1 0-11.6C-2-8.1-1.6-4.8 0-2.6Z" transform="rotate(${a})"/>`).join('') +
  [45, 135, 225, 315].map((a) => `<path d="M0-2.6C1.3-4.2 1.6-6.4 0-8.9C-1.6-6.4-1.3-4.2 0-2.6Z" transform="rotate(${a})"/>`).join('') +
  `<path fill-rule="evenodd" d="M0-2.9a2.9 2.9 0 1 1 0 5.8a2.9 2.9 0 1 1 0-5.8ZM0-1.8a1.8 1.8 0 1 0 0 3.6a1.8 1.8 0 1 0 0-3.6Z"/>` +
  `<circle r="0.9"/></symbol>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg">${defs}${symbols}${ornaments}</svg>\n`;

const out = join(here, '../public/brand/sprite.svg');
writeFileSync(out, svg);
console.log(`wrote ${out} (${(svg.length / 1024).toFixed(1)} KB)`);
