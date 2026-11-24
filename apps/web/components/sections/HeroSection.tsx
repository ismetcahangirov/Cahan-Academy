import { useTranslations } from 'next-intl';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from '@/i18n/routing';
import EdelweissCorner from '../ornament/EdelweissCorner';
import OrnamentDivider from '../ornament/OrnamentDivider';
import SketchIllustration from '../ornament/SketchIllustration';
import WaveEdge from '../ornament/WaveEdge';
import { EdelweissGlyph } from '../ornament/Edelweiss';
import Button from '../ui/Button';

/**
 * Home hero — deep wine band (same in both themes) with edelweiss clusters opening in the two top corners,
 * a centred script title, small-caps eyebrow, serif lead, two CTAs, engraved sketches at the sides (desktop),
 * then a wave into the parchment section. Server component; entrance = one-shot CSS (no JS, no blank state).
 */
export default function HeroSection() {
  const t = useTranslations('hero');
  const th = useTranslations('home');

  return (
    <section aria-labelledby="hero-title" className="theme-wine hero-wine relative isolate overflow-hidden">
      <EdelweissCorner corner="tl" priority onWine className="absolute left-0 top-0 w-28 sm:w-40 lg:w-56" />
      <EdelweissCorner corner="tr" priority onWine delay={260} className="absolute right-0 top-0 w-28 sm:w-40 lg:w-56" />
      <SketchIllustration name="books" className="absolute bottom-24 left-[4%] hidden w-40 xl:block" />
      <SketchIllustration name="globe" className="absolute bottom-28 right-[5%] hidden w-32 xl:block" />

      <div className="relative mx-auto flex min-h-[min(46rem,calc(100svh-var(--header-h)))] max-w-4xl flex-col items-center justify-center px-5 pb-36 pt-28 text-center sm:px-8 sm:pt-32">
        <p className="sc orn-rise flex items-center gap-2 text-[0.82rem] text-ink-muted sm:text-[0.9rem]">
          <EdelweissGlyph className="hidden h-3.5 w-3.5 text-ornament sm:block" />
          {t('badge')}
          <EdelweissGlyph className="hidden h-3.5 w-3.5 text-ornament sm:block" />
        </p>
        <h1 id="hero-title" className="script-title orn-rise mt-5 text-balance text-[2.4rem] leading-[1.08] sm:text-[3.3rem] lg:text-[4rem]">
          {t('title')}
        </h1>
        <OrnamentDivider className="mt-5" />
        <p className="orn-rise mt-6 max-w-2xl text-[1.15rem] leading-relaxed text-ink-muted sm:text-[1.25rem]">
          {t('subtitle')}
        </p>
        <div className="orn-rise mt-9 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Button as={Link} href="/courses" size="lg" iconAfter={ArrowRight}>
            {t('cta_primary')}
          </Button>
          <Button as={Link} href="/contact" variant="outline" size="lg">
            {t('cta_secondary')}
          </Button>
        </div>
        <a
          href="#academy"
          className="sc mt-12 hidden flex-col items-center gap-1 text-[0.78rem] text-ink-muted transition-colors hover:text-ink sm:flex"
        >
          {th('hero_scroll')}
          <ChevronDown size={18} strokeWidth={1.4} aria-hidden="true" />
        </a>
      </div>

      <WaveEdge fill="var(--paper-light)" className="absolute inset-x-0 -bottom-px" />
    </section>
  );
}
