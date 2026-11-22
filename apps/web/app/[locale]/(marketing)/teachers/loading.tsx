import { getTranslations } from 'next-intl/server';
import CatalogSkeleton from '@/components/courses/CatalogSkeleton';

/** Shown while the server renders this route (client navigation): palette skeleton, same layout. */
export default async function Loading() {
  const t = await getTranslations('courses');
  return <CatalogSkeleton variant="teachers" label={t('loading')} />;
}
