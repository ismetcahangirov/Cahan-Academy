import { useTranslations } from 'next-intl';
import { OrnateFrame, ScriptTitle, SketchIllustration, Timeline, TimelineItem } from '@/components/ornament';
import Reveal from '@/components/ui/Reveal';

/**
 * HistorySection (about) — the academy's path as a timeline in a parchment frame: beginning → today →
 * tomorrow. Only the existing copy is used (history_desc_1/2, vision_desc); nothing new is claimed.
 * The "2020" and "hundreds of graduates" statements are existing copy listed under "Owner must confirm".
 */
const STEPS = [
  { mark: 'I', title: 'history_step1', text: 'history_desc_1', state: 'done' },
  { mark: 'II', title: 'history_step2', text: 'history_desc_2', state: 'current' },
  { mark: 'III', title: 'history_step3', text: 'vision_desc', state: 'upcoming' },
] as const;

export default function HistorySection() {
  const t = useTranslations('about');

  return (
    <section aria-labelledby="history-title" id="history" className="theme-light bg-page relative py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:px-8">
        <Reveal className="order-2 lg:order-1">
          <OrnateFrame paper className="px-4 pb-3 pt-9 sm:px-8 sm:pt-10">
            <Timeline>
              {STEPS.map((s) => (
                <TimelineItem key={s.mark} time={s.mark} state={s.state} title={t(s.title)} meta={t(s.text)} />
              ))}
            </Timeline>
          </OrnateFrame>
        </Reveal>

        <Reveal delay={80} className="order-1 flex flex-col items-center text-center lg:order-2">
          <ScriptTitle
            id="history-title"
            align="center"
            size="section"
            eyebrow={t('history_eyebrow')}
            title={t('history_title')}
            className="w-full"
          />
          <SketchIllustration name="books" className="mt-8 w-28 sm:w-36 lg:w-48" />
        </Reveal>
      </div>
    </section>
  );
}
