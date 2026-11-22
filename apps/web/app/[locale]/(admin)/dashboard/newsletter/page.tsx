'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Mail } from 'lucide-react';
import { StatusPill } from '@/components/ui';
import { DataView, PageHead, Thumb, Toolbar } from '@/components/admin/AdminUI';
import { useAdminList } from '@/components/admin/useAdminList';
import { fmtDate } from '@/components/admin/utils';

interface Sub {
  id: string;
  email: string;
  status: string;
  createdAt: string;
}

export default function NewsletterPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const { items, loading, error, reload } = useAdminList<Sub>('/newsletter');
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? items.filter((x) => x.email.toLowerCase().includes(s)) : items;
  }, [items, q]);

  return (
    <div>
      <PageHead title={t('newsletter.title')} subtitle={t('newsletter.subtitle', { count: items.length })} onRefresh={reload} loading={loading} />
      <Toolbar value={q} onChange={setQ} placeholder={t('newsletter.search')} />
      <DataView
        caption={t('newsletter.title')}
        items={filtered}
        rowKey={(x) => x.id}
        loading={loading}
        error={error}
        onRetry={reload}
        empty={{
          sketch: 'inkwell',
          title: q ? t('common.no_match_title') : t('newsletter.empty_title'),
          description: q ? t('common.no_match_desc') : t('newsletter.empty_desc'),
        }}
        columns={[
          {
            key: 'email',
            header: t('common.email'),
            cell: (x) => (
              <span className="flex items-center gap-3">
                <Thumb alt="" icon={Mail} />
                <span className="min-w-0 break-all font-semibold">{x.email}</span>
              </span>
            ),
          },
          { key: 'date', header: t('newsletter.col_date'), cell: (x) => <span className="time-italic">{fmtDate(x.createdAt, locale)}</span> },
          {
            key: 'status',
            header: t('common.status'),
            cell: (x) =>
              x.status === 'active' ? (
                <StatusPill status="success">{t('newsletter.active')}</StatusPill>
              ) : (
                <StatusPill status="neutral">{t('newsletter.inactive')}</StatusPill>
              ),
          },
        ]}
      />
    </div>
  );
}
