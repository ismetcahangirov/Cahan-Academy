import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import ScriptTitle from '../ornament/ScriptTitle';
import SketchIllustration from '../ornament/SketchIllustration';
import OrnateFrame from '../ornament/OrnateFrame';
import { Timeline, TimelineItem } from '../ornament/Timeline';
import Button from '../ui/Button';
import Reveal from '../ui/Reveal';

/**
 * LearningPath — "how it works": the site's real flow (choose a course → apply via the form → the team
 * gets in touch → lessons) as a timeline in an ornate frame, with the inkwell sketch. Roman numerals as marks.
 */
const STEPS = ['I', 'II', 'III', 'IV'] as const;

export default function LearningPath() {
  const t = useTranslations('home');
  const th = useTranslations('hero');

  return (
    <section aria-labelledby="path-title" className="relative py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.15fr] lg:gap-16 lg:px-8">
        <Reveal className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <ScriptTitle
            id="path-title"
            size="section"
            eyebrow={t('path_eyebrow')}
            title={t('path_title')}
            lead={t('path_lead')}
            className="w-full"
          />
          <SketchIllustration name="inkwell" className="mt-8 w-32 sm:w-40" />
          <Button as={Link} href="/courses" variant="outline" className="mt-8" iconAfter={ArrowRight}>
            {th('cta_primary')}
          </Button>
        </Reveal>

        <Reveal delay={80}>
          <OrnateFrame paper className="px-4 pb-3 pt-9 sm:px-8 sm:pt-10">
            <Timeline>
              {STEPS.map((mark, i) => (
                <TimelineItem
                  key={mark}
                  time={mark}
                  state={i === 0 ? 'current' : 'upcoming'}
                  title={t(`step${i + 1}_title`)}
                  meta={t(`step${i + 1}_desc`)}
                />
              ))}
            </Timeline>
          </OrnateFrame>
        </Reveal>
      </div>
    </section>
  );
}
