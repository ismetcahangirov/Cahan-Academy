import { useTranslations } from 'next-intl';
import { ArrowRight, PhoneCall } from 'lucide-react';
import { Link } from '@/i18n/routing';
import OrnateFrame from '../ornament/OrnateFrame';
import ScriptTitle from '../ornament/ScriptTitle';
import SketchIllustration from '../ornament/SketchIllustration';
import WaxSeal from '../ornament/WaxSeal';
import { DrapedRibbon } from '../ornament/Ribbons';
import Button from '../ui/Button';
import Reveal from '../ui/Reveal';

/**
 * CTASection — closing invitation: a parchment panel in an ornate frame, ribbon draped over its corner,
 * wax seal, script title, two actions (contact page + phone). Used on the home and about pages.
 * The phone number is the existing placeholder-looking copy ("Owner must confirm").
 */
export default function CTASection() {
  const t = useTranslations('home');
  const th = useTranslations('hero');

  return (
    <section aria-labelledby="cta-title" className="overflow-x-clip px-4 pb-28 pt-20 sm:px-6 sm:pt-24 lg:px-8">
      <Reveal className="relative mx-auto max-w-4xl">
        <DrapedRibbon className="absolute -right-5 -top-8 z-[3] w-44 sm:-right-10 sm:-top-10 sm:w-64" />
        <OrnateFrame paper className="relative overflow-hidden px-6 pb-12 pt-14 text-center sm:px-14">
          <SketchIllustration name="lamp" className="absolute -bottom-4 -left-6 hidden w-36 md:block" />
          <WaxSeal size={64} className="mx-auto" />
          <ScriptTitle
            id="cta-title"
            align="center"
            size="section"
            eyebrow={t('cta_eyebrow')}
            title={t('cta_title')}
            lead={t('cta_text')}
            className="mt-4"
          />
          <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button as={Link} href="/contact" size="lg" iconAfter={ArrowRight}>
              {th('cta_secondary')}
            </Button>
            <Button as="a" href="tel:+994501234567" variant="outline" size="lg" icon={PhoneCall} motif={false}>
              <span className="sr-only">{t('cta_call')}: </span>
              <span className="num">+994 50 123 45 67</span>
            </Button>
          </div>
        </OrnateFrame>
      </Reveal>
    </section>
  );
}
