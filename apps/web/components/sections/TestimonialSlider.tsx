'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import OrnamentDivider from '../ornament/OrnamentDivider';

import type { Testimonial } from '@/lib/site';

/** "Aysel Məmmədova" → "AM" (first letters of the first two words). */
const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toLocaleUpperCase('az'))
    .join('');

/**
 * TestimonialSlider — one quote at a time (serif italic), stars in the ornament tone (never gold),
 * initials medallion, prev / next + numbered dots (real buttons, aria-current). The quote fades in on
 * change (opacity only); a polite live region announces the new quote. Lives inside a `.theme-wine` band.
 */
export default function TestimonialSlider({ items }: { items: Testimonial[] }) {
  const t = useTranslations('home');
  const [current, setCurrent] = useState(0);
  const item = items[current];
  if (!item) return null;

  const go = (i: number) => setCurrent((i + items.length) % items.length);

  return (
    <div className="mx-auto max-w-3xl text-center">
      <div aria-live="polite">
      <figure key={item.id} className="orn-reveal">
        <span aria-hidden="true" className="font-script block text-[4rem] leading-[0.55] text-ornament">
          “
        </span>
        <blockquote className="mt-4 text-[1.2rem] italic leading-relaxed text-ink sm:text-[1.4rem]">
          {item.text}
        </blockquote>
        <div className="mt-6 flex justify-center gap-1" role="img" aria-label={t('testimonials_rating', { n: item.rating })}>
          {Array.from({ length: Math.max(1, Math.min(5, item.rating)) }, (_, i) => (
            <Star key={i} size={16} strokeWidth={1.4} className="fill-current text-ornament" aria-hidden="true" />
          ))}
        </div>
        <figcaption className="mt-6 flex items-center justify-center gap-4">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface font-semibold text-ink"
          >
            {initialsOf(item.name)}
          </span>
          <span className="text-left">
            <span className="block text-[1.1rem] font-semibold text-ink">{item.name}</span>
            {item.role && <span className="sc block text-[0.8rem] text-ink-muted">{item.role}</span>}
          </span>
        </figcaption>
      </figure>
      </div>

      <OrnamentDivider draw={false} className="mt-10" />

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => go(current - 1)}
          aria-label={t('testimonials_prev')}
          className="btn btn-outline btn-icon btn-sm"
        >
          <ChevronLeft size={18} strokeWidth={1.6} aria-hidden="true" />
        </button>
        <ul className="flex items-center gap-1">
          {items.map((it, i) => (
            <li key={it.id}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-label={t('testimonials_goto', { n: i + 1 })}
                aria-current={i === current ? 'true' : undefined}
                className="flex h-8 w-8 items-center justify-center rounded-full"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'block h-2 w-2 rotate-45 border border-ornament transition-transform',
                    i === current ? 'scale-125 bg-ornament' : 'bg-transparent'
                  )}
                />
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => go(current + 1)}
          aria-label={t('testimonials_next')}
          className="btn btn-outline btn-icon btn-sm"
        >
          <ChevronRight size={18} strokeWidth={1.6} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
