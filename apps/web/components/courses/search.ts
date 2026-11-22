/**
 * Search folding for the list pages: locale-aware lower case (az "İ" → "i"), diacritics removed and the
 * Azerbaijani letters a Latin keyboard lacks mapped to their usual stand-ins (ə→e, ı→i), so "proqramlasdirma"
 * finds "Proqramlaşdırma" and "ilkin" finds "İlkin".
 */
export function fold(value: string | null | undefined, locale = 'az'): string {
  if (!value) return '';
  let lower: string;
  try {
    lower = value.toLocaleLowerCase(locale);
  } catch {
    lower = value.toLowerCase();
  }
  return lower
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/ə/g, 'e')
    .replace(/ı/g, 'i')
    .replace(/\s+/g, ' ')
    .trim();
}

/** True when every word of the query occurs in at least one of the fields. */
export function matches(query: string, fields: (string | null | undefined)[], locale = 'az'): boolean {
  const words = fold(query, locale).split(' ').filter(Boolean);
  if (!words.length) return true;
  const haystack = fields.map((f) => fold(f, locale)).join(' \u0000 ');
  return words.every((w) => haystack.includes(w));
}
