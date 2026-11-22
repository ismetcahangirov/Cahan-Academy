'use client';

import { useEffect, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonClass } from '@/components/ui/Button';

/**
 * StickyEnroll — phone/tablet bar (below lg) with the price and the enrol action, shown only while
 * the reader is between the hero CTA and the enrolment form. Slides with transform only; hidden from
 * assistive tech while off screen. `watch` = [hero CTA id, form section id].
 */
export default function StickyEnroll({
  label,
  price,
  priceLabel,
  href = '#enroll',
  watch,
}: {
  label: string;
  price?: string | null;
  priceLabel: string;
  href?: string;
  watch: string[];
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined;
    const targets = watch.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!targets.length) return undefined;
    // shown between "hero CTA scrolled past" (first target) and "form reached" (last target)
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const heroAbove = targets[0].getBoundingClientRect().bottom < 0;
        const formAhead = targets[targets.length - 1].getBoundingClientRect().top > window.innerHeight;
        setShow(heroAbove && formAhead);
      });
    };
    const io = new IntersectionObserver(update, { threshold: [0, 1] });
    targets.forEach((el) => io.observe(el));
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      window.removeEventListener('scroll', update);
    };
  }, [watch]);

  return (
    <div
      aria-hidden={!show}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:hidden',
        !show && 'pointer-events-none'
      )}
      style={{
        boxShadow: 'var(--shadow-md)',
        // off screen = translated below the viewport AND invisible (after the slide), so it never shows in
        // a full-page capture or to the tab order
        transform: show ? 'translate3d(0,0,0)' : 'translate3d(0,100%,0)',
        visibility: show ? 'visible' : 'hidden',
        transition: show
          ? 'transform var(--dur-3) var(--ease-silk), visibility 0s'
          : 'transform var(--dur-3) var(--ease-silk), visibility 0s linear var(--dur-3)',
      }}
    >
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="sc text-[0.72rem] text-ink-muted">{priceLabel}</p>
          <p className="num truncate text-[1.15rem] font-semibold text-accent-text">{price}</p>
        </div>
        <a href={href} tabIndex={show ? undefined : -1} className={buttonClass({ size: 'md' })}>
          {label}
          <ArrowDown size={16} strokeWidth={1.6} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
