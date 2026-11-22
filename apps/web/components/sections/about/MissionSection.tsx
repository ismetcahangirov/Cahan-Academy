import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { EdelweissGlyph, OrnateFrame, ScriptTitle, SketchIllustration, WaveEdge, type SketchName } from '@/components/ornament';
import Reveal from '@/components/ui/Reveal';

/**
 * MissionSection (about) — parchment band with wavy joins: script title, mission + vision side by side in
 * ornate frames, each with its own sketch (lamp = guiding light, globe = horizon). `children` goes under
 * the two panels (the about page puts the stats there, so one parchment band carries both).
 */
function Panel({ sketch, label, text }: { sketch: SketchName; label: string; text: string }) {
  return (
    <OrnateFrame corners="diagonal" className="flex h-full flex-col items-center px-6 pb-9 pt-8 text-center sm:px-10">
      <SketchIllustration name={sketch} className="w-24 sm:w-28" />
      <h3 className="sc mt-5 text-[1rem] text-accent-text">{label}</h3>
      <EdelweissGlyph className="mt-2 h-4 w-4 text-ornament-soft" />
      <p className="mt-3 max-w-md text-[1.12rem] leading-relaxed text-ink">{text}</p>
    </OrnateFrame>
  );
}

export default function MissionSection({ children }: { children?: ReactNode }) {
  const t = useTranslations('about');

  return (
    <section aria-labelledby="mission-title" id="mission" className="cv-auto paper relative py-24 sm:py-28">
      <WaveEdge invert fill="var(--page-base)" className="absolute inset-x-0 -top-px" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <ScriptTitle
            id="mission-title"
            align="center"
            size="section"
            eyebrow={t('mission_eyebrow')}
            title={t('mission_title')}
          />
        </Reveal>
        <Reveal as="ul" stagger className="mt-12 grid gap-5 md:grid-cols-2 md:gap-8">
          <li>
            <Panel sketch="lamp" label={t('mission_badge')} text={t('mission_desc')} />
          </li>
          <li>
            <Panel sketch="globe" label={t('vision_badge')} text={t('vision_desc')} />
          </li>
        </Reveal>
        {children && <div className="mt-14">{children}</div>}
      </div>
      <WaveEdge fill="var(--page-base)" className="absolute inset-x-0 -bottom-px" />
    </section>
  );
}
