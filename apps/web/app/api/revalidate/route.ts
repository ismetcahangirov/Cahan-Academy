import { revalidateTag } from 'next/cache';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

/** Cache tags the admin panel may refresh right after a save (site details, testimonials). */
const ALLOWED = new Set(['site-settings', 'testimonials']);

/**
 * POST /api/revalidate { tags: string[] } with the admin's bearer token: drops those tags from the Next data cache
 * so the change shows on the next page view instead of after the 5-minute window. The token is checked against
 * the API (an admin-only endpoint) before anything is revalidated.
 */
export async function POST(req: Request) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return Response.json({ success: false }, { status: 401 });

  const check = await fetch(`${API_URL}/admin/stats`, { headers: { Authorization: auth }, cache: 'no-store' }).catch(() => null);
  if (!check?.ok) return Response.json({ success: false }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { tags?: unknown };
  const tags = Array.isArray(body.tags) ? body.tags.filter((t): t is string => typeof t === 'string' && ALLOWED.has(t)) : [];
  for (const tag of tags) revalidateTag(tag);
  return Response.json({ success: true, revalidated: tags });
}
