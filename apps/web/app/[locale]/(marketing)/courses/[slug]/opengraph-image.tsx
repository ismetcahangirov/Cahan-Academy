import { apiFetch } from '@/lib/api';
import { OG_SIZE, ogCard } from '@/components/courses/ogCard';

export const runtime = 'edge';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Cahan Academy';

const LABELS: Record<string, { eyebrow: string; duration: string; price: string }> = {
  az: { eyebrow: 'Kurs', duration: 'Müddət', price: 'Qiymət' },
  en: { eyebrow: 'Course', duration: 'Duration', price: 'Price' },
  ru: { eyebrow: 'Курс', duration: 'Длительность', price: 'Стоимость' },
};

interface OgCourse {
  title: string;
  description?: string | null;
  duration?: string | null;
  price?: string | null;
  category?: { name?: string } | null;
}

type Params = { locale: string; slug: string };

export default async function Image({ params }: { params: Params | Promise<Params> }) {
  const { locale, slug } = await params;
  const l = LABELS[locale] ?? LABELS.az;
  // an image must always render: any API failure falls back to the generic card
  const course = await apiFetch<{ data: OgCourse }>(`/courses/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`, {
    revalidate: 3600,
  })
    .then((res) => res.data)
    .catch(() => null);

  if (!course) return ogCard({ title: 'Cahan Academy' });

  const facts: [string, string][] = [];
  if (course.duration) facts.push([l.duration, course.duration]);
  if (course.price) facts.push([l.price, course.price]);
  return ogCard({
    eyebrow: course.category?.name ? `${l.eyebrow} · ${course.category.name}` : l.eyebrow,
    title: course.title,
    text: course.description,
    facts,
  });
}
