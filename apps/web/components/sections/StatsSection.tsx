import { useTranslations } from 'next-intl';
import { Award, BookOpen, GraduationCap, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import CornerFlourish from '../ornament/CornerFlourish';
import Reveal from '../ui/Reveal';

/**
 * StatsSection — four framed figures (serif lining numerals, small-caps labels). Static numbers render
 * in the HTML (no count-up, nothing blank before JS). Used on the home and about pages.
 * The figures are the existing marketing copy — listed under "Owner must confirm" in the PR.
 * `bare` drops the section padding/background so the home page can lay it over the parchment join.
 */
const STATS = [
  { key: 'students', value: '1200+', icon: Users },
  { key: 'teachers', value: '45+', icon: GraduationCap },
  { key: 'courses', value: '30+', icon: BookOpen },
  { key: 'years', value: '8', icon: Award },
] as const;

export default function StatsSection({ bare = false, className }: { bare?: boolean; className?: string }) {
  const t = useTranslations('stats');
  const th = useTranslations('home');

  const grid = (
    <Reveal as="ul" stagger className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {STATS.map(({ key, value, icon: Icon }) => (
        <li key={key}>
          <div className="card-ornate relative flex h-full flex-col items-center px-3 py-6 text-center sm:py-8">
            <CornerFlourish corner="tl" className="absolute left-2.5 top-2.5 h-5 w-5" />
            <CornerFlourish corner="br" className="absolute bottom-2.5 right-2.5 h-5 w-5" />
            <Icon size={22} strokeWidth={1.4} className="text-ornament" aria-hidden="true" />
            <p className="num mt-3 text-[2.4rem] font-medium leading-none text-accent-text sm:text-[3rem]">{value}</p>
            <p className="sc mt-2 text-[0.82rem] text-ink-muted sm:text-[0.9rem]">{t(key)}</p>
          </div>
        </li>
      ))}
    </Reveal>
  );

  if (bare) {
    return (
      <div className={className}>
        <h2 className="sr-only">{th('stats_title')}</h2>
        {grid}
      </div>
    );
  }

  return (
    <section aria-labelledby="stats-title" className={cn('paper py-16 sm:py-20', className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 id="stats-title" className="sr-only">
          {th('stats_title')}
        </h2>
        {grid}
      </div>
    </section>
  );
}
