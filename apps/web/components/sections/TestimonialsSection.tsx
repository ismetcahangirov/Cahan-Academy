import { useTranslations } from 'next-intl';
import { LaceCorner, LaceEdge } from '../ornament/Lace';
import ScriptTitle from '../ornament/ScriptTitle';
import WaveEdge from '../ornament/WaveEdge';
import Reveal from '../ui/Reveal';
import TestimonialSlider, { type Testimonial } from './TestimonialSlider';

/**
 * TestimonialsSection — deep wine band (same in both themes) with lace trim and wavy joins, centred
 * script title, quote slider. Used on the home and about pages.
 * The quotes below are the existing hard-coded copy (Azerbaijani originals, shown as quoted) and are
 * listed under "Owner must confirm" — replace with real, consented reviews (or an API source).
 */
const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Aysel Məmmədova',
    role: 'Front-end Developer @ Kapital Bank',
    initials: 'AM',
    text: 'Cahan Academy-dən əvvəl proqramlaşdırma haqqında heç bir bilgim yox idi. Yalnız 6 ayda ilk işimi tapdım. Müəllimlər həmişə əlçatan idi, praktiki tapşırıqlar isə real işdə lazım olan hər şeyi öyrətdi.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Rauf Hüseynov',
    role: 'UI/UX Designer @ Pashabank',
    initials: 'RH',
    text: 'Dizayn kursunu bitirdikdən sonra portfolio hazırladım və 2 ay içərisində tam zamanlı dizayner kimi işə başladım. Müəllim Nicat müəllim hər dərsi çox peşəkar aparırdı.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Leyla Əliyeva',
    role: 'Digital Marketing Specialist',
    initials: 'LƏ',
    text: 'Rəqəmsal marketinq kursunda öyrəndiklərimi dərhal öz biznesimə tətbiq etdim. 3 ay ərzində sosial media hesablarım 10 dəfə böyüdü. Çox tövsiyyə edirəm!',
    rating: 5,
  },
  {
    id: 4,
    name: 'Orxan Quliyev',
    role: 'Back-end Developer @ ABB',
    initials: 'OQ',
    text: 'Kurs materialları çox strukturlaşdırılmış idi. Hər mövzu üzrə praktiki layihə var idi. İndi tam zamanlı developer kimi işləyirəm. Cahan Academy həyatımı dəyişdi.',
    rating: 5,
  },
];

export default function TestimonialsSection({
  topFill = 'var(--page-base)',
  bottomFill = 'var(--page-base)',
}: {
  /** background of the section above / below, so the waves blend in */
  topFill?: string;
  bottomFill?: string;
}) {
  const t = useTranslations('home');

  return (
    <section aria-labelledby="testimonials-title" className="theme-wine band-wine relative overflow-hidden py-28 sm:py-32">
      <WaveEdge invert fill={topFill} className="absolute inset-x-0 -top-px" />
      <LaceEdge size={24} className="absolute inset-x-0 top-9 md:top-12" />
      <LaceCorner corner="bl" className="absolute bottom-10 left-0 w-28 sm:w-40" />
      <LaceCorner corner="br" className="absolute bottom-10 right-0 w-28 sm:w-40" />

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
          <TestimonialSlider items={TESTIMONIALS} />
        </Reveal>
      </div>
      <WaveEdge fill={bottomFill} className="absolute inset-x-0 -bottom-px" />
    </section>
  );
}
