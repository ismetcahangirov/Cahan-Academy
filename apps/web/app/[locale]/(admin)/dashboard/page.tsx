'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, BookOpen, FileText, Mail, MessageSquare, RefreshCcw, Users } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import adminApi from '@/lib/adminApi';
import { useAuth } from '@/context/AuthContext';
import { Link } from '@/i18n/routing';
import { Button, Card, CardHeader, EmptyState, Skeleton } from '@/components/ui';
import { OrnateFrame, ScriptTitle } from '@/components/ornament';
import { StatCard } from '@/components/admin/AdminUI';
import { apiMessage, fmtDate } from '@/components/admin/utils';

interface Stats {
  counts: { leads: number; subscribers: number; posts: number; messages: number };
  chartData: { date: string; count: number }[];
}

/* recharts, recoloured to the palette: one wine series, hairline grid, palette tooltip (no default hues) */
const AXIS = { fill: 'var(--ink-muted)', fontSize: 13, fontFamily: 'var(--font-serif)' } as const;
const TOOLTIP = {
  contentStyle: {
    background: 'var(--surface)',
    border: '1px solid var(--line-strong)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-md)',
    color: 'var(--ink)',
    fontFamily: 'var(--font-serif)',
  },
  labelStyle: { color: 'var(--ink-muted)', fontWeight: 600 },
  itemStyle: { color: 'var(--accent-text)', fontWeight: 600 },
  cursor: { stroke: 'var(--line-strong)', fill: 'var(--accent-soft)' },
} as const;

export default function DashboardPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await adminApi.get('/admin/stats');
      if (data.success) setStats(data.data);
      else setError(data.message || t('common.load_error'));
    } catch (e) {
      setError(apiMessage(e, t('common.load_error')));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = stats?.counts;
  const cards = [
    { key: 'leads', label: t('dashboard.stat_leads'), value: counts?.leads ?? 0, icon: Users },
    { key: 'subscribers', label: t('dashboard.stat_subscribers'), value: counts?.subscribers ?? 0, icon: Mail },
    { key: 'posts', label: t('dashboard.stat_posts'), value: counts?.posts ?? 0, icon: FileText },
    { key: 'messages', label: t('dashboard.stat_messages'), value: counts?.messages ?? 0, icon: MessageSquare },
  ];
  const bars = cards.map((c) => ({ name: c.label, value: c.value }));
  const chart = (stats?.chartData ?? []).map((d) => ({ ...d, label: fmtDate(d.date, locale) }));
  const shortDate = (v: string) => fmtDate(v, locale).replace(/\s?\d{4}.*$/, '');

  const links = [
    { href: '/dashboard/leads', label: t('nav.leads'), icon: Users },
    { href: '/dashboard/contacts', label: t('nav.contacts'), icon: MessageSquare },
    { href: '/dashboard/courses', label: t('nav.courses'), icon: BookOpen },
    { href: '/dashboard/blog', label: t('nav.blog'), icon: FileText },
  ] as const;

  return (
    <div>
      <ScriptTitle
        className="mb-6"
        title={t('dashboard.title')}
        subtitle={user ? t('dashboard.greeting', { name: user.name }) : t('dashboard.subtitle')}
        actions={
          <Button variant="ghost" iconOnly icon={RefreshCcw} onClick={load} disabled={loading} aria-label={t('common.refresh')} title={t('common.refresh')} />
        }
      />

      {error && !stats ? (
        <Card className="p-2">
          <EmptyState
            sketch="inkwell"
            title={t('common.load_error_title')}
            description={error}
            action={
              <Button variant="outline" icon={RefreshCcw} onClick={load}>
                {t('common.retry')}
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4" aria-label={t('dashboard.stats_label')}>
            {loading && !stats
              ? [0, 1, 2, 3].map((i) => (
                  <li key={i}>
                    <Card className="p-5" aria-hidden="true">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="mt-4 h-9 w-16" />
                    </Card>
                  </li>
                ))
              : cards.map((c) => (
                  <li key={c.key}>
                    <StatCard label={c.label} value={c.value} icon={c.icon} />
                  </li>
                ))}
          </ul>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card variant="ornate" className="p-5 sm:p-6 lg:col-span-2">
              <CardHeader title={t('dashboard.chart_title')} subtitle={t('dashboard.chart_subtitle')} />
              {loading && !stats ? (
                <Skeleton className="mt-4 h-64 w-full" />
              ) : chart.length === 0 ? (
                <EmptyState compact sketch="lamp" title={t('dashboard.chart_empty')} />
              ) : (
                <div className="mt-4 h-64 w-full" role="img" aria-label={t('dashboard.chart_title')}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chart} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
                      <CartesianGrid stroke="var(--line-hair)" vertical={false} />
                      <XAxis dataKey="date" tick={AXIS} tickLine={false} axisLine={{ stroke: 'var(--line)' }} tickFormatter={shortDate} />
                      <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip {...TOOLTIP} labelFormatter={(v) => fmtDate(String(v), locale)} formatter={(v) => [v, t('dashboard.series_leads')]} />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="var(--accent-text)"
                        strokeWidth={2.5}
                        fill="var(--accent-soft)"
                        fillOpacity={1}
                        dot={{ r: 3.5, stroke: 'var(--accent-text)', strokeWidth: 1.5, fill: 'var(--surface)' }}
                        activeDot={{ r: 5, stroke: 'var(--accent-text)', strokeWidth: 2, fill: 'var(--accent-text)' }}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
              {chart.length > 0 && (
                <table className="sr-only">
                  <caption>{t('dashboard.chart_title')}</caption>
                  <tbody>
                    {chart.map((d) => (
                      <tr key={d.date}>
                        <th scope="row">{d.label}</th>
                        <td>{d.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>

            <OrnateFrame paper corners="diagonal" className="p-5 sm:p-6">
              <h2 className="sc text-[0.95rem] tracking-[0.14em] text-ink-muted">{t('dashboard.quick_title')}</h2>
              <ul className="mt-3 divide-y divide-[var(--line-hair)]">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="menu-item group min-h-12 justify-between rounded-none px-1">
                      <span className="flex items-center gap-3">
                        <l.icon size={18} strokeWidth={1.6} aria-hidden="true" className="text-ornament" />
                        {l.label}
                      </span>
                      <ArrowRight size={16} strokeWidth={1.6} aria-hidden="true" className="text-ink-subtle" />
                    </Link>
                  </li>
                ))}
              </ul>
            </OrnateFrame>
          </div>

          <Card className="mt-6 p-5 sm:p-6">
            <CardHeader title={t('dashboard.totals_title')} subtitle={t('dashboard.totals_subtitle')} />
            {loading && !stats ? (
              <Skeleton className="mt-4 h-48 w-full" />
            ) : (
              <div className="mt-4 h-52 w-full" role="img" aria-label={t('dashboard.totals_title')}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bars} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                    <CartesianGrid stroke="var(--line-hair)" horizontal={false} />
                    <XAxis type="number" tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={AXIS} tickLine={false} axisLine={{ stroke: 'var(--line)' }} width={104} />
                    <Tooltip {...TOOLTIP} />
                    <Bar dataKey="value" fill="var(--accent-text)" radius={[0, 4, 4, 0]} maxBarSize={28} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
