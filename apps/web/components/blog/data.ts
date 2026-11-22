// The /blog list loader lives in lib/api (loadBlogPosts).

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Post bodies come from a plain textarea in the CMS: either HTML (from an editor / pasted) or plain
 * text with blank lines between paragraphs. Plain text becomes escaped <p> paragraphs (single line
 * breaks → <br>) so both read as proper long-form text; HTML is passed through unchanged.
 */
export function toArticleHtml(content?: string | null): string {
  const text = (content ?? '').trim();
  if (!text) return '';
  if (/<\/?(p|h[1-6]|ul|ol|li|blockquote|pre|table|img|figure|div|br|strong|em|a)\b/i.test(text)) return text;
  return text
    .split(/\r?\n\s*\r?\n/)
    .map((para) => `<p>${escapeHtml(para.trim()).replace(/\r?\n/g, '<br />')}</p>`)
    .join('');
}
