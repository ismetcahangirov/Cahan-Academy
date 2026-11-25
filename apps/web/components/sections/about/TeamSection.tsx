import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { getTeam } from '@/lib/api';
import CoverImage from '@/components/cards/CoverImage';
import { sketchFor } from '@/lib/media';
import { EdelweissGlyph, ScriptTitle } from '@/components/ornament';
import { Button, EmptyState, Reveal } from '@/components/ui';

/**
 * TeamSection (about) — team members from GET /api/team in arched, matted portrait frames (photo or
 * notebook sketch), name in serif, role in small caps. The endpoint is flaky in production (500), so a
 * failure and an empty list both degrade to a framed empty state that points to the teachers page.
 */
export default async function TeamSection() {
  const t = await getTranslations('about');
  const locale = await getLocale();
  const { items: members, failed } = await getTeam(locale);

  return (
    <section aria-labelledby="team-title" className="cv-auto theme-light bg-page pb-24 pt-8 sm:pb-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <ScriptTitle
            id="team-title"
            align="center"
            size="section"
            eyebrow={t('team_eyebrow')}
            title={t('team_title')}
            lead={t('team_subtitle')}
          />
        </Reveal>

        {members.length > 0 ? (
          <Reveal as="ul" stagger className="mt-12 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
            {members.map((m) => (
              <li key={m.id}>
                <article className="card-ornate flex h-full flex-col items-center p-3 pb-5 text-center sm:p-5 sm:pb-6">
                  <CoverImage
                    src={m.image}
                    alt={m.name}
                    sketch={sketchFor(m.position, m.name)}
                    rounded="arch"
                    sizes="(min-width: 1024px) 18rem, (min-width: 640px) 40vw, 45vw"
                    className="aspect-[4/5] w-full max-w-[14rem]"
                  />
                  <EdelweissGlyph className="mt-4 h-4 w-4" />
                  <h3 className="mt-2 text-[1.08rem] font-semibold leading-snug text-ink sm:text-[1.25rem]">{m.name}</h3>
                  {m.position && <p className="sc mt-1 text-[0.78rem] text-ink-muted sm:text-[0.85rem]">{m.position}</p>}
                </article>
              </li>
            ))}
          </Reveal>
        ) : (
          <div className="card-paper mx-auto mt-12 max-w-2xl">
            <EmptyState
              sketch="notebook"
              title={failed ? t('team_error_title') : t('team_empty_title')}
              description={failed ? t('team_error_desc') : t('team_empty_desc')}
            />
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Button as={Link} href="/teachers" variant="outline" iconAfter={ArrowRight}>
            {t('all_teachers')}
          </Button>
        </div>
      </div>
    </section>
  );
}
