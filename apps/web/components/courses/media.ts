import { isRealImage } from '@/components/cards/CoverImage';
import type { SketchName } from '@/components/ornament/SketchIllustration';

/**
 * Image helpers for the course / teacher pages.
 *
 * coverSrc(): a URL only when it is a real uploaded photo. Missing images, stock / placeholder hosts
 * (CoverImage's list) and the local mock API's generated stripes (`/api/mock-image/…`) become null, so
 * every placeholder renders as a palette sketch, never as a fake photo.
 * Promote to shared: add the `/mock-image/` rule to CoverImage.isRealImage.
 *
 * sketchFor(): a sketch that suits the course's category, so a long list is not forty identical stacks
 * of books (keyword match on the slug/name, else a stable hash).
 */
export function coverSrc(src?: string | null): string | null {
  if (!isRealImage(src)) return null;
  try {
    if (/\/mock-image\//.test(new URL(src, 'http://local').pathname)) return null;
  } catch {
    return null;
  }
  return src;
}

const RULES: [RegExp, SketchName][] = [
  [/dizayn|design|дизайн|\bui\b|\bux\b|qrafik|graphic/i, 'inkwell'],
  [/data|analit|\belm|science|данн|machine|\bml\b/i, 'lamp'],
  [/dil|lang|ingilis|english|язык|англ/i, 'globe'],
  [/proqram|program|veb|web|front|back|kod|code|прогр|разраб/i, 'notebook'],
  [/kiber|cyber|təhlük|secur|безопас/i, 'books'],
  [/marketinq|marketing|маркет/i, 'cap'],
];
const ORDER: SketchName[] = ['books', 'notebook', 'inkwell', 'lamp', 'globe', 'cap'];

export function sketchFor(...keys: (string | null | undefined)[]): SketchName {
  const text = keys.filter(Boolean).join(' ');
  for (const [rx, name] of RULES) if (rx.test(text)) return name;
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return ORDER[h % ORDER.length];
}
