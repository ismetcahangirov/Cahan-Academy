'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

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

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isOpen = openId === item.id;
        const question = item.question[locale] || item.question['az'];
        const answer = item.answer[locale] || item.answer['az'];

        return (
          <div
            key={item.id}
            className={`group rounded-2xl border transition-all duration-300 ${
              isOpen 
                ? 'bg-card border-primary/20 shadow-lg shadow-primary/5' 
                : 'bg-background border-border hover:border-primary/30'
            }`}
          >
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex w-full items-center justify-between p-5 text-left transition-colors"
            >
              <span className={`font-heading text-lg font-bold transition-colors ${
                isOpen ? 'text-primary' : 'text-foreground group-hover:text-primary/80'
              }`}>
                {question}
              </span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={`p-1.5 rounded-full transition-colors ${
                  isOpen ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}
              >
                <ChevronDown size={20} />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="px-5 pb-5 pt-1 text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
