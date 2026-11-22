import { apiFetch } from '@/lib/api';
import { OG_SIZE, ogCard } from '@/components/seo/ogCard';

export const runtime = 'edge';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Cahan Academy';

const EYEBROW: Record<string, string> = { az: 'Müəllim', en: 'Teacher', ru: 'Преподаватель' };

interface OgTeacher {
  name: string;
  position?: string | null;
  bio?: string | null;
}

type Params = { locale: string; slug: string };

export default async function Image({ params }: { params: Params | Promise<Params> }) {
  const { locale, slug } = await params;
  const teacher = await apiFetch<{ data: OgTeacher }>(`/teachers/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`, {
    revalidate: 86400,
  })
    .then((res) => res.data)
    .catch(() => null);

  if (!teacher) return ogCard({ title: 'Cahan Academy' });

  return ogCard({
    eyebrow: teacher.position ? `${EYEBROW[locale] ?? EYEBROW.az} · ${teacher.position}` : EYEBROW[locale] ?? EYEBROW.az,
    title: teacher.name,
    text: teacher.bio,
  });
}
