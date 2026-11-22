import { useTranslations } from 'next-intl';
import { Award, BookOpen, Shield, Target, Users, Zap } from 'lucide-react';
import ScriptTitle from '../ornament/ScriptTitle';
import SketchIllustration from '../ornament/SketchIllustration';
import Reveal from '../ui/Reveal';

/**
 * FeaturesSection — "Why us": parchment section, centred script title, six features in a ruled grid
 * (icon in a thin ring, serif title, muted text). Copy lives in messages `home.f1…f6`.
 * Two of the claims (1200+ students, 8 years) are listed under "Owner must confirm".
 */
const FEATURES = [
  { n: 1, icon: Shield },
  { n: 2, icon: Zap },
  { n: 3, icon: Target },
  { n: 4, icon: Users },
  { n: 5, icon: BookOpen },
  { n: 6, icon: Award },
] as const;

export default function FeaturesSection({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('home');

  return (
    <section id="academy" aria-labelledby="features-title" className="paper relative overflow-hidden pb-16 pt-20 sm:pt-24">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {children}

        <div className={children ? 'mt-20 sm:mt-24' : undefined}>
          <Reveal>
            <ScriptTitle
              id="features-title"
              align="center"
              size="section"
              eyebrow={t('features_eyebrow')}
              title={t('features_title')}
              lead={t('features_lead')}
            />
          </Reveal>

          <Reveal as="ul" stagger className="mt-12 grid gap-x-10 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ n, icon: Icon }) => (
              <li key={n} className="flex gap-4 border-t border-line py-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface text-accent-text">
                  <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-[1.2rem] font-semibold leading-snug text-ink">{t(`f${n}_title`)}</h3>
                  <p className="mt-1.5 text-[1.02rem] leading-relaxed text-ink-muted">{t(`f${n}_desc`)}</p>
                </div>
              </li>
            ))}
          </Reveal>
          <div className="mt-10 flex justify-center">
            <SketchIllustration name="cap" className="w-36 sm:w-44" />
          </div>
        </div>
      </div>
    </section>
  );
}
