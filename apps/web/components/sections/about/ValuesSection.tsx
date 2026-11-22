import { useTranslations } from 'next-intl';
import { GraduationCap, Lightbulb, Sprout } from 'lucide-react';
import { CornerFlourish, ScriptTitle } from '@/components/ornament';
import Reveal from '@/components/ui/Reveal';

/**
 * ValuesSection (about) — three values as framed cards: roman numeral, line icon in a hairline medallion,
 * serif title, muted text. No hover lift (they are not links).
 */
const VALUES = [
  { key: 'quality', mark: 'I', icon: GraduationCap },
  { key: 'innovation', mark: 'II', icon: Lightbulb },
  { key: 'student', mark: 'III', icon: Sprout },
] as const;

export default function ValuesSection() {
  const t = useTranslations('about');

  return (
    <section aria-labelledby="values-title" className="cv-auto py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <ScriptTitle id="values-title" align="center" size="section" eyebrow={t('values_eyebrow')} title={t('values_title')} />
        </Reveal>
        <Reveal as="ul" stagger className="mt-12 grid gap-5 md:grid-cols-3 md:gap-6">
          {VALUES.map(({ key, mark, icon: Icon }) => (
            <li key={key}>
              <article className="card-ornate relative flex h-full flex-col items-center px-6 pb-8 pt-7 text-center">
                <CornerFlourish corner="tl" className="absolute left-2.5 top-2.5 h-5 w-5" />
                <CornerFlourish corner="tr" className="absolute right-2.5 top-2.5 h-5 w-5" />
                <span className="time-italic text-[1.05rem] text-ink-muted">{mark}</span>
                <span className="mt-3 flex h-14 w-14 items-center justify-center rounded-full border border-line-strong bg-paper">
                  <Icon size={24} strokeWidth={1.4} className="text-ornament" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-[1.3rem] font-semibold leading-snug text-ink">{t(`value_${key}_title`)}</h3>
                <p className="mt-2 text-[1.05rem] leading-relaxed text-ink-muted">{t(`value_${key}_desc`)}</p>
              </article>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
