'use client';

import { useId, useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EdelweissGlyph } from '../ornament/Edelweiss';

/**
 * FAQAccordion — framed question rows; the open answer fades in (opacity only, no height animation).
 * Real buttons with aria-expanded / aria-controls; first item open by default.
 * Props unchanged: items [{ id, question: {az,en,ru}, answer: {az,en,ru} }], locale.
 */
interface FAQItem {
  id: string;
  question: Record<string, string>;
  answer: Record<string, string>;
}

interface FAQAccordionProps {
  items: FAQItem[];
  locale: string;
}

export default function FAQAccordion({ items, locale }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null);
  const base = useId();

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openId === item.id;
        const question = item.question[locale] || item.question['az'];
        const answer = item.answer[locale] || item.answer['az'];
        const btnId = `${base}-q-${item.id}`;
        const panelId = `${base}-a-${item.id}`;

        return (
          <div
            key={item.id}
            className={cn('card transition-[border-color] duration-200', isOpen ? 'border-line-strong' : 'hover:border-line-strong')}
          >
            <h3>
              <button
                id={btnId}
                type="button"
                onClick={() => setOpenId(isOpen ? null : item.id)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-center gap-3 rounded-[var(--radius-lg)] px-5 py-4 text-left"
              >
                <EdelweissGlyph className={cn('h-4 w-4 shrink-0', isOpen ? 'text-accent-text' : 'text-ornament-soft')} />
                <span className={cn('flex-1 text-[1.15rem] font-semibold leading-snug', isOpen ? 'text-accent-text' : 'text-ink')}>
                  {question}
                </span>
                <Plus
                  size={18}
                  strokeWidth={1.6}
                  aria-hidden="true"
                  className={cn('shrink-0 text-accent-text transition-transform duration-300', isOpen && 'rotate-45')}
                />
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={btnId} hidden={!isOpen}>
              <div className="orn-reveal whitespace-pre-wrap px-5 pb-5 pl-12 text-[1.05rem] leading-relaxed text-ink-muted">
                {answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
