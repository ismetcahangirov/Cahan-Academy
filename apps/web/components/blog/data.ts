import { apiFetch, type BlogPost } from '@/lib/api';

/**
 * Blog list for the /blog page. Unlike `getBlogPosts` (which turns any failure into []), this keeps
 * "the API failed" apart from "there are no posts", so the page can say which one happened (A-23).
 */
export async function loadPosts(locale: string): Promise<{ posts: BlogPost[]; failed: boolean }> {
  try {
    const res = await apiFetch<{ data?: BlogPost[] }>(`/blog?locale=${encodeURIComponent(locale)}`, {
      tags: ['blog'],
      revalidate: 60,
    });
    return { posts: Array.isArray(res.data) ? res.data : [], failed: false };
  } catch (error) {
    console.error('[blog] list fetch failed:', error instanceof Error ? error.message : error);
    return { posts: [], failed: true };
  }
}

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
