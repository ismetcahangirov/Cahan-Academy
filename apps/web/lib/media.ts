import type { SketchName } from '@/components/ornament/SketchIllustration';

/**
 * The ONE "is this a real photo?" rule (used by <CoverImage>, JSON-LD `image` fields, layout choices).
 * Not real → the caller shows a palette sketch (`sketchFor`), never a fake photo or a striped box:
 *  - missing / empty / unparsable URL,
 *  - stock or placeholder services (unsplash, example.com, placehold.co, via.placeholder, picsum),
 *  - the local mock API's generated images (`/api/mock-image/…`, wine stripes that read as "broken").
 */
const PLACEHOLDER_HOSTS = /(^|\.)(unsplash\.com|example\.com|placehold\.co|via\.placeholder\.com|picsum\.photos)$/i;

export function isRealImage(src?: string | null): src is string {
  if (!src) return false;
  try {
    const u = new URL(src, 'http://local');
    return !PLACEHOLDER_HOSTS.test(u.hostname) && !/\/mock-image\//.test(u.pathname);
  } catch {
    return false;
  }
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

/**
 * A sketch that suits the subject (category slug/name, position, title…), so a long list of items
 * without photos is not one repeated drawing: keyword match first, else a stable hash of the text.
 * sketchFor(course.category?.slug, course.category?.name, course.title) → 'notebook'
 */
export function sketchFor(...keys: (string | null | undefined)[]): SketchName {
  const text = keys.filter(Boolean).join(' ');
  for (const [rx, name] of RULES) if (rx.test(text)) return name;
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return ORDER[h % ORDER.length];
}
