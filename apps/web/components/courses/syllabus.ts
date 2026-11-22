/**
 * The course `syllabus` column has no fixed format: the schema comment says "JSON string" (fixtures store
 * `[{ week, title, description? }]`), the admin form says "HTML supported" (`<ul><li>…</li></ul>`), and
 * older rows may be plain lines. parseSyllabus() turns any of these into plain-text modules for the
 * <Timeline>. HTML is never injected: tags are stripped and only the text of each item is kept.
 */
export interface SyllabusItem {
  title: string;
  description?: string;
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };

function stripTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(#?\w+);/g, (m, e: string) => ENTITIES[e] ?? m)
    .replace(/\s+/g, ' ')
    .trim();
}

function fromJson(value: unknown): SyllabusItem[] | null {
  if (!Array.isArray(value)) return null;
  const items = value
    .map((entry): SyllabusItem | null => {
      if (typeof entry === 'string') return { title: stripTags(entry) };
      if (entry && typeof entry === 'object') {
        const e = entry as Record<string, unknown>;
        const title = [e.title, e.name, e.topic].find((v) => typeof v === 'string') as string | undefined;
        const description = [e.description, e.content, e.summary].find((v) => typeof v === 'string') as string | undefined;
        if (!title) return null;
        return { title: stripTags(title), description: description ? stripTags(description) || undefined : undefined };
      }
      return null;
    })
    .filter((x): x is SyllabusItem => !!x && !!x.title);
  return items;
}

export function parseSyllabus(raw?: string | null): SyllabusItem[] {
  const text = raw?.trim();
  if (!text) return [];

  if (text.startsWith('[') || text.startsWith('{')) {
    try {
      const parsed = JSON.parse(text);
      const items = fromJson(Array.isArray(parsed) ? parsed : (parsed?.modules ?? parsed?.items));
      if (items) return items;
    } catch {
      // not JSON after all: fall through
    }
  }

  if (/<li[\s>]/i.test(text)) {
    return [...text.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
      .map((m) => stripTags(m[1]))
      .filter(Boolean)
      .map((title) => ({ title }));
  }

  // plain lines (or paragraphs): one module per line, list markers ("-", "1.", "•") removed
  return text
    .replace(/<\/(p|h\d|div)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .split(/\r?\n/)
    .map((line) => stripTags(line).replace(/^(?:[-*•]|\d+[.)])\s*/, '').trim())
    .filter(Boolean)
    .map((title) => ({ title }));
}

const ROMAN: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
  [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

/** 1 → "I", 14 → "XIV" (timeline marks read like chapter numbers in a manuscript). */
export function toRoman(n: number): string {
  let rest = Math.max(1, Math.floor(n));
  let out = '';
  for (const [value, sym] of ROMAN) {
    while (rest >= value) {
      out += sym;
      rest -= value;
    }
  }
  return out;
}
