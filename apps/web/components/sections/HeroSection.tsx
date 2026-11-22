import { useTranslations } from 'next-intl';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { LaceCorner, LaceEdge } from '../ornament/Lace';
import { DrapedRibbon } from '../ornament/Ribbons';
import OrnamentDivider from '../ornament/OrnamentDivider';
import SketchIllustration from '../ornament/SketchIllustration';
import WaveEdge from '../ornament/WaveEdge';
import WaxSeal from '../ornament/WaxSeal';
import { EdelweissGlyph } from '../ornament/Edelweiss';
import Button from '../ui/Button';

/**
 * Home hero — the full reference composition: deep wine band (same in both themes) with lace corners,
 * a satin ribbon draped over the top-right corner, a centred script title, small-caps eyebrow, serif lead,
 * two CTAs, engraved sketches at the sides (desktop), then lace + a wave into the parchment section with
 * the wax seal pressed on the join. Server component; entrance = one-shot CSS (no JS, no blank state).
 */
export default function HeroSection() {
  const t = useTranslations('hero');
  const th = useTranslations('home');

  return (
    <section aria-labelledby="hero-title" className="theme-wine hero-wine relative isolate overflow-hidden">
      <LaceCorner corner="tl" priority className="absolute left-0 top-0 w-32 sm:w-48 lg:w-64" />
      <LaceCorner corner="tr" priority className="absolute right-0 top-0 hidden w-48 sm:block lg:w-64" />
      <div className="pointer-events-none absolute -right-10 -top-6 w-56 sm:-right-6 sm:w-80 lg:right-4 lg:w-[26rem]">
        <DrapedRibbon priority className="orn-sway w-full" />
      </div>
      <SketchIllustration name="books" className="absolute bottom-24 left-[4%] hidden w-40 xl:block" />
      <SketchIllustration name="globe" className="absolute bottom-28 right-[5%] hidden w-32 xl:block" />

      <div className="relative mx-auto flex min-h-[min(46rem,calc(100svh-var(--header-h)))] max-w-4xl flex-col items-center justify-center px-5 pb-36 pt-28 text-center sm:px-8 sm:pt-32">
        <p className="sc orn-rise flex items-center gap-2 text-[0.82rem] text-ink-muted sm:text-[0.9rem]">
          <EdelweissGlyph className="h-3.5 w-3.5 text-ornament" />
          {t('badge')}
          <EdelweissGlyph className="h-3.5 w-3.5 text-ornament" />
        </p>
        <h1 id="hero-title" className="script-title orn-rise mt-5 text-[3.3rem] leading-[1.04] sm:text-[4.6rem] lg:text-[5.6rem]">
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
          className="sc mt-12 hidden flex-col items-center gap-1 text-[0.78rem] text-ink-subtle transition-colors hover:text-ink sm:flex"
        >
          {th('hero_scroll')}
          <ChevronDown size={18} strokeWidth={1.4} aria-hidden="true" />
        </a>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0">
        <LaceEdge direction="up" size={26} className="relative -mb-9 md:-mb-12" />
        <WaveEdge fill="var(--paper-base)" className="relative -mb-px" />
      </div>
      <WaxSeal size={88} priority className="absolute bottom-1 left-1/2 z-[2] -translate-x-1/2 md:bottom-3" />
    </section>
  );
}
