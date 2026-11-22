/**
 * Small helpers shared by the admin CMS (no hooks, safe anywhere).
 */

/** Message from an axios error / API envelope, else the fallback (already translated by the caller). */
export function apiMessage(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { message?: unknown } }; message?: unknown } | null;
  const m = e?.response?.data?.message;
  if (typeof m === 'string' && m.trim()) return m;
  return fallback;
}

/** URL slug from a title: Azerbaijani letters folded to ASCII. */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/ə/g, 'e')
    .replace(/ö/g, 'o')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ü/g, 'u')
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** The API stores booleans as 'true' / 'false' strings in some tables. */
export const asBool = (v: unknown): boolean => v === true || v === 'true';

const INTL_LOCALE: Record<string, string> = { az: 'az-AZ', en: 'en-GB', ru: 'ru-RU' };

export function fmtDate(iso: string | undefined | null, locale: string, withTime = false): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(INTL_LOCALE[locale] ?? 'az-AZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : null),
  }).format(d);
}
