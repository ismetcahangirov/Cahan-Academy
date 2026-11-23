import { useTranslations } from 'next-intl';
import EdelweissCorner from '../ornament/EdelweissCorner';
import ScriptTitle from '../ornament/ScriptTitle';
import WaveEdge from '../ornament/WaveEdge';
import Reveal from '../ui/Reveal';
import TestimonialSlider from './TestimonialSlider';
import type { Testimonial } from '@/lib/site';

/**
 * TestimonialsSection — deep wine band (same in both themes) with edelweiss corners and wavy joins, centred
 * script title, quote slider. Used on the home and about pages. The quotes come from the admin panel
 * (Testimonials); with none visible the section is left out.
 */
export default function TestimonialsSection({
  items,
  topFill = 'var(--page-base)',
  bottomFill = 'var(--page-base)',
}: {
  items: Testimonial[];
  /** background of the section above / below, so the waves blend in */
  topFill?: string;
  bottomFill?: string;
}) {
  const t = useTranslations('home');
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="testimonials-title" className="cv-auto theme-wine band-wine relative overflow-hidden py-28 sm:py-32">
      <WaveEdge invert fill={topFill} className="absolute inset-x-0 -top-px" />
      <EdelweissCorner corner="bl" onWine className="absolute bottom-10 left-0 w-24 sm:w-36" />
      <EdelweissCorner corner="br" onWine className="absolute bottom-10 right-0 w-24 sm:w-36" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <ScriptTitle
            id="testimonials-title"
            align="center"
            size="section"
            eyebrow={t('testimonials_eyebrow')}
            title={t('testimonials_title')}
          />
        </Reveal>
        <Reveal className="mt-10" delay={80}>
          <TestimonialSlider items={items} />
        </Reveal>
      </div>
      <WaveEdge fill={bottomFill} className="absolute inset-x-0 -bottom-px" />
    </section>
  );
}
