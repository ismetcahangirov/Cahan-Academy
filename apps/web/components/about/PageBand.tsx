import type { ReactNode } from 'react';
import { LaceCorner, ScriptTitle, WaveEdge, WaxSeal } from '@/components/ornament';
import { cn } from '@/lib/utils';

/**
 * PageBand — the head of a content page (about, contact, FAQ, blog, legal): deep wine band in both
 * themes, lace in the two top corners, centred script title with small-caps eyebrow and lead, a wave
 * into the page below and (optionally) a wax seal pressed on the join.
 *
 * <PageBand id="contact-title" eyebrow={t('eyebrow')} title={t('title')} lead={t('lead')} />
 * <PageBand … seal waveFill="var(--paper-base)">{children under the lead, e.g. a date line}</PageBand>
 * Props: id (for aria-labelledby), eyebrow, title (SHORT fixed phrase — script), lead, children,
 *        waveFill (colour of the section below), seal, className.
 * Promote-to-shared candidate: every list/content page uses the same band.
 */
export default function PageBand({
  id,
  eyebrow,
  title,
  lead,
  children,
  waveFill = 'var(--page-base)',
  seal = false,
  className,
}: {
  id: string;
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  waveFill?: string;
  seal?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <section aria-labelledby={id} className="theme-wine band-wine relative overflow-hidden">
        <LaceCorner corner="tl" className="absolute left-0 top-0 w-20 sm:w-28 lg:w-36" />
        <LaceCorner corner="tr" className="absolute right-0 top-0 w-20 sm:w-28 lg:w-36" />
        <div
          className={cn(
            'relative mx-auto max-w-3xl px-4 pt-14 sm:px-6 sm:pt-20 lg:px-8',
            seal ? 'pb-24 sm:pb-28' : 'pb-20 sm:pb-24'
          )}
        >
          <ScriptTitle id={id} align="center" size="page" eyebrow={eyebrow} title={title} lead={lead} className="orn-rise" />
          {children}
        </div>
        <WaveEdge fill={waveFill} className="absolute inset-x-0 -bottom-px" />
      </section>
      {seal && (
        <WaxSeal size={60} className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-[38%]" />
      )}
    </div>
  );
}
