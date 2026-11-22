import { OG_SIZE, ogCard } from '@/components/seo/ogCard';

export const runtime = 'edge';
export const alt = 'Cahan Academy';
export const size = OG_SIZE;
export const contentType = 'image/png';

// Inline copy (edge runtime, no message bundle): the same card as course / teacher / blog pages.
const COPY: Record<string, { eyebrow: string; text: string }> = {
  az: { eyebrow: 'Akademiya', text: 'Peşəkar texnologiya təhsili' },
  en: { eyebrow: 'Academy', text: 'Professional tech education' },
  ru: { eyebrow: 'Академия', text: 'Профессиональное ИТ-образование' },
};

type Params = { locale: string };

export default async function Image({ params }: { params: Params | Promise<Params> }) {
  const { locale } = await params;
  const c = COPY[locale] ?? COPY.az;
  return ogCard({ eyebrow: c.eyebrow, title: 'Cahan Academy', text: c.text });
}
