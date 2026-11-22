import type { ReactNode } from 'react';
import { LaceCorner } from '@/components/ornament/Lace';
import ScriptTitle from '@/components/ornament/ScriptTitle';
import WaveEdge from '@/components/ornament/WaveEdge';
import { EdelweissGlyph } from '@/components/ornament/Edelweiss';

/**
 * CatalogHead — head band of a marketing list page (courses, teachers): deep wine panel (same in both
 * themes) with lace in the two top corners, breadcrumbs, centred script title with small-caps eyebrow and
 * serif lead, then a wave into the page. Uses `.hero-wine` (gradient only), not `.band-wine`: it is the
 * first screen and a full-bleed raster would become the LCP element (DESIGN.md §4).
 * Server component; nothing is hidden before hydration.
 *
 * <CatalogHead breadcrumbs={<Breadcrumbs …/>} eyebrow={t('eyebrow')} title={t('page_title')} lead={t('page_subtitle')} />
 */
export default function CatalogHead({
  breadcrumbs,
  eyebrow,
  title,
  lead,
  children,
}: {
  breadcrumbs?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="theme-wine hero-wine relative isolate overflow-hidden">
      <LaceCorner corner="tl" priority className="absolute left-0 top-0 w-20 sm:w-36 lg:w-48" />
      <LaceCorner corner="tr" priority className="absolute right-0 top-0 w-20 sm:w-36 lg:w-48" />

      <div className="relative mx-auto max-w-3xl px-4 pb-20 pt-8 text-center sm:px-6 sm:pb-24 sm:pt-12">
        {breadcrumbs && <div className="orn-reveal flex justify-center px-10 sm:px-0">{breadcrumbs}</div>}
        <ScriptTitle
          align="center"
          size="page"
          className="orn-rise mt-6 sm:mt-8"
          eyebrow={
            eyebrow ? (
              <span className="inline-flex items-center gap-2">
                <EdelweissGlyph className="h-3 w-3 text-ornament" />
                {eyebrow}
                <EdelweissGlyph className="h-3 w-3 text-ornament" />
              </span>
            ) : undefined
          }
          title={title}
          lead={lead}
        />
        {children}
      </div>

      <WaveEdge fill="var(--page-base)" className="absolute inset-x-0 -bottom-px" />
    </section>
  );
}
