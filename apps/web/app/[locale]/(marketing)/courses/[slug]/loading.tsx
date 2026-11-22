'use client';

import { useTranslations } from 'next-intl';
import CatalogSkeleton from '@/components/courses/CatalogSkeleton';

/**
 * Shown while the server renders this route (client navigation): palette skeleton, same layout.
 * Client component: a server loading.tsx calling getTranslations() without a locale reads headers()
 * and made the whole route dynamic.
 */
export default function Loading() {
  const t = useTranslations('courses');
  return <CatalogSkeleton variant="detail" label={t('loading')} />;
}
