import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { FOOTER_LINKS } from './nav';
import EdelweissCorner from '@/components/ornament/EdelweissCorner';
import ScriptTitle from '@/components/ornament/ScriptTitle';
import WaveEdge from '@/components/ornament/WaveEdge';
import { EdelweissGlyph } from '@/components/ornament/Edelweiss';
import { cn } from '@/lib/utils';

/**
 * PageBand — the ONE head band of every marketing list / content page (courses, teachers, blog, about,
 * contact, FAQ, legal): deep wine panel (same in both themes) with edelweiss clusters opening in the two top corners, optional
 * breadcrumbs (Home › … + schema.org BreadcrumbList), centred script title with a small-caps eyebrow between edelweiss glyphs and a serif lead,
 * then a wave into the page.
 * Background = `.hero-wine` (gradient only): it is the first screen, and a full-bleed raster would become
 * the LCP element (DESIGN.md §4). Server component; nothing is hidden before hydration.
 *
 * <PageBand id="courses-title" trail={{ locale, items: [{ path: '/courses' }] }} eyebrow={…} title={…} lead={…} />
 * <PageBand id="about-title" waveFill="var(--paper-base)" …>{children under the lead}</PageBand>
 * Props: id (heading id for aria-labelledby), trail (crumbs after Home, locale-less paths; name defaults to the nav label), eyebrow, title (SHORT fixed phrase — script),
 *        lead, children, waveFill (colour of the section below), className.
 */
export default async function PageBand({
  id,
  trail,
  eyebrow,
  title,
  lead,
  children,
  waveFill = 'var(--page-base)',
  className,
}: {
  id: string;
  /** crumbs after Home; `name` defaults to the nav label of `path` (e.g. '/about' → nav.about) */
  trail?: { locale: string; items: { name?: string; path: string }[] };
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  waveFill?: string;
  className?: string;
}) {
  const [tc, tn] = trail
    ? await Promise.all([
        getTranslations({ locale: trail.locale, namespace: 'common' }),
        getTranslations({ locale: trail.locale, namespace: 'nav' }),
      ])
    : [null, null];
  const navName = (path: string) => {
    const link = FOOTER_LINKS.find((l) => l.href === path);
    return link && tn ? tn(link.key) : path;
  };
  return (
    <div className={cn('relative', className)}>
      <section aria-labelledby={id} className="theme-wine hero-wine relative isolate overflow-hidden">
        <EdelweissCorner corner="tl" priority onWine className="absolute left-0 top-0 w-20 sm:w-32 lg:w-40" />
        <EdelweissCorner corner="tr" priority onWine delay={260} className="absolute right-0 top-0 w-20 sm:w-32 lg:w-40" />
        <div className="relative mx-auto max-w-3xl px-4 pb-20 pt-8 text-center sm:px-6 sm:pb-24 sm:pt-12 lg:px-8">
          {trail && tc && (
            <div className="orn-reveal flex justify-center px-10 sm:px-0">
              <Breadcrumbs
                locale={trail.locale}
                label={tc('breadcrumb_label')}
                align="center"
                items={[{ name: tc('home'), path: '' }, ...trail.items.map((c) => ({ path: c.path, name: c.name ?? navName(c.path) }))]}
              />
            </div>
          )}
          <ScriptTitle
            id={id}
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
        <WaveEdge fill={waveFill} className="absolute inset-x-0 -bottom-px" />
      </section>
    </div>
  );
}
