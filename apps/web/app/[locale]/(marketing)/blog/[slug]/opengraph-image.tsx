import { getBlogPost } from '@/lib/api';
import { OG_SIZE, ogCard } from '@/components/seo/ogCard';

export const runtime = 'edge';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Cahan Academy';

const LABELS: Record<string, { eyebrow: string; author: string; reading: string }> = {
  az: { eyebrow: 'Bloq', author: 'Müəllif', reading: 'Oxuma vaxtı' },
  en: { eyebrow: 'Blog', author: 'Author', reading: 'Reading time' },
  ru: { eyebrow: 'Блог', author: 'Автор', reading: 'Время чтения' },
};

type Params = { locale: string; slug: string };

export default async function Image({ params }: { params: Params | Promise<Params> }) {
  const { locale, slug } = await params;
  const l = LABELS[locale] ?? LABELS.az;
  // an image must always render: any API failure falls back to the generic card
  const post = await getBlogPost(slug, locale).catch(() => null);
  if (!post) return ogCard({ eyebrow: l.eyebrow, title: 'Cahan Academy' });

  const facts: [string, string][] = [];
  if (post.author?.name) facts.push([l.author, post.author.name]);
  if (post.readingTime) facts.push([l.reading, post.readingTime]);
  return ogCard({ eyebrow: l.eyebrow, title: post.title, text: post.excerpt, facts });
}
