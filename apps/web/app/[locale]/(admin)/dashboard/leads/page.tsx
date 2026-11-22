'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Download } from 'lucide-react';
import adminApi from '@/lib/adminApi';
import { Button, Select, StatusPill } from '@/components/ui';
import type { StatusName } from '@/components/ui/Badge';
import { DataView, PageHead, Toolbar } from '@/components/admin/AdminUI';
import { useAdminFeedback } from '@/components/admin/feedback';
import { useAdminList } from '@/components/admin/useAdminList';
import { apiMessage, assertOk, fmtDate } from '@/components/admin/utils';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  status: string;
  createdAt: string;
}

const STATUSES = ['new', 'contacted', 'enrolled', 'cancelled'] as const;
const PILL: Record<string, StatusName> = { new: 'pending', contacted: 'partial', enrolled: 'success', cancelled: 'absent' };

export default function LeadsPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const { ok, fail } = useAdminFeedback();
  const { items, setItems, loading, error, reload } = useAdminList<Lead>('/leads');
  const [q, setQ] = useState('');
  const [exporting, setExporting] = useState(false);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((l) => [l.name, l.email, l.course].some((v) => (v || '').toLowerCase().includes(s)));
  }, [items, q]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const res = await adminApi.get('/leads/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'leads-export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      fail(apiMessage(e, t('leads.export_error')));
    } finally {
      setExporting(false);
    }
  };

  const changeStatus = async (id: string, status: string) => {
    try {
      const { data } = await adminApi.patch(`/leads/${id}/status`, { status });
      assertOk(data);
      setItems((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      ok(t('common.saved'));
    } catch (e) {
      fail(apiMessage(e, t('common.status_error')));
    }
  };

  return (
    <div>
      <PageHead
        title={t('leads.title')}
        subtitle={t('leads.subtitle', { count: items.length })}
        onRefresh={reload}
        loading={loading}
        actions={
          <Button variant="outline" icon={Download} onClick={exportCsv} loading={exporting}>
            {t('leads.export')}
          </Button>
        }
      />
      <Toolbar value={q} onChange={setQ} placeholder={t('leads.search')} />
      <DataView
        caption={t('leads.title')}
        items={filtered}
        rowKey={(l) => l.id}
        loading={loading}
        error={error}
        onRetry={reload}
        empty={{
          sketch: 'notebook',
          title: q ? t('common.no_match_title') : t('leads.empty_title'),
          description: q ? t('common.no_match_desc') : t('leads.empty_desc'),
        }}
        columns={[
          {
            key: 'person',
            header: t('leads.col_person'),
            cell: (l) => (
              <span className="block">
                <span className="block font-semibold">{l.name}</span>
                <span className="block text-[0.92rem] font-normal text-ink-muted">{l.email}</span>
                <span className="num block text-[0.92rem] font-normal text-ink-muted">{l.phone}</span>
              </span>
            ),
          },
          { key: 'course', header: t('leads.col_course'), cell: (l) => l.course },
          { key: 'date', header: t('common.date'), cell: (l) => <span className="time-italic">{fmtDate(l.createdAt, locale)}</span> },
          {
            key: 'status',
            header: t('common.status'),
            cell: (l) => <StatusPill status={PILL[l.status] ?? 'neutral'}>{t(`leads.status_${l.status}`)}</StatusPill>,
          },
          {
            key: 'change',
            header: t('leads.col_change'),
            cell: (l) => (
              <Select
                value={l.status}
                onChange={(e) => changeStatus(l.id, e.target.value)}
                aria-label={`${t('leads.col_change')}: ${l.name}`}
                className="!min-h-10 !py-1.5 text-[0.95rem]"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t(`leads.status_${s}`)}
                  </option>
                ))}
              </Select>
            ),
          },
        ]}
      />
    </div>
  );
}
