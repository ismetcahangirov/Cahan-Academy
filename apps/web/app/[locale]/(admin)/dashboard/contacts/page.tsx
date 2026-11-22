'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Eye, MailOpen } from 'lucide-react';
import adminApi from '@/lib/adminApi';
import { Button, Modal, StatusPill } from '@/components/ui';
import { DataView, PageHead, RowAction, Toolbar } from '@/components/admin/AdminUI';
import { useAdminFeedback } from '@/components/admin/feedback';
import { useAdminList } from '@/components/admin/useAdminList';
import { apiMessage, asBool, assertOk, fmtDate } from '@/components/admin/utils';

interface Msg {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  isRead: string | boolean;
  createdAt: string;
}

export default function ContactsPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const { fail } = useAdminFeedback();
  const { items, setItems, loading, error, reload } = useAdminList<Msg>('/contacts');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<Msg | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((m) => [m.name, m.email, m.subject].some((v) => (v || '').toLowerCase().includes(s)));
  }, [items, q]);

  const markRead = async (id: string) => {
    try {
      const { data } = await adminApi.patch(`/contacts/${id}/read`);
      assertOk(data);
      setItems((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: 'true' } : m)));
      setSelected((s) => (s && s.id === id ? { ...s, isRead: 'true' } : s));
    } catch (e) {
      fail(apiMessage(e, t('common.status_error')));
    }
  };

  const view = (m: Msg) => {
    setSelected(m);
    if (!asBool(m.isRead)) void markRead(m.id);
  };

  const pill = (m: Msg) =>
    asBool(m.isRead) ? <StatusPill status="neutral">{t('contacts.read')}</StatusPill> : <StatusPill status="pending">{t('contacts.unread')}</StatusPill>;

  return (
    <div>
      <PageHead title={t('contacts.title')} subtitle={t('contacts.subtitle', { count: items.length })} onRefresh={reload} loading={loading} />
      <Toolbar value={q} onChange={setQ} placeholder={t('contacts.search')} />
      <DataView
        caption={t('contacts.title')}
        items={filtered}
        rowKey={(m) => m.id}
        loading={loading}
        error={error}
        onRetry={reload}
        empty={{
          sketch: 'inkwell',
          title: q ? t('common.no_match_title') : t('contacts.empty_title'),
          description: q ? t('common.no_match_desc') : t('contacts.empty_desc'),
        }}
        rowClassName={(m) => (asBool(m.isRead) ? undefined : 'bg-accent-soft')}
        columns={[
          {
            key: 'person',
            header: t('contacts.col_person'),
            cell: (m) => (
              <span className="block">
                <span className={asBool(m.isRead) ? 'block font-medium' : 'block font-bold'}>{m.name}</span>
                <span className="block text-[0.92rem] font-normal text-ink-muted">{m.email}</span>
              </span>
            ),
          },
          {
            key: 'msg',
            header: t('contacts.col_message'),
            cell: (m) => (
              <span className="block max-w-xs">
                <span className="block truncate font-medium">{m.subject}</span>
                <span className="block truncate text-[0.92rem] text-ink-muted" title={m.message}>
                  {m.message}
                </span>
              </span>
            ),
          },
          { key: 'date', header: t('common.date'), cell: (m) => <span className="time-italic">{fmtDate(m.createdAt, locale)}</span> },
          { key: 'status', header: t('common.status'), cell: pill },
        ]}
        actions={(m) => (
          <>
            <RowAction icon={Eye} label={`${t('contacts.view')}: ${m.name}`} onClick={() => view(m)} />
            {!asBool(m.isRead) && <RowAction icon={MailOpen} label={`${t('contacts.mark_read')}: ${m.name}`} onClick={() => markRead(m.id)} />}
          </>
        )}
      />

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={t('contacts.detail_title')}
        size="md"
        footer={
          <Button variant="outline" onClick={() => setSelected(null)}>
            {t('common.close')}
          </Button>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {pill(selected)}
              <span className="time-italic text-ink-muted">{fmtDate(selected.createdAt, locale, true)}</span>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ['common.name', selected.name],
                  ['common.email', selected.email],
                  ...(selected.phone ? [['common.phone', selected.phone]] : []),
                ] as [string, string][]
              ).map(([k, v]) => (
                <div key={k}>
                  <dt className="field-label">{t(k)}</dt>
                  <dd className="break-words">{v}</dd>
                </div>
              ))}
            </dl>
            <div>
              <p className="field-label">{t('contacts.subject')}</p>
              <p className="font-semibold">{selected.subject}</p>
            </div>
            <div>
              <p className="field-label">{t('contacts.message')}</p>
              <p className="whitespace-pre-wrap rounded-[var(--radius-md)] border border-line-hair bg-surface-2 p-4">{selected.message}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
