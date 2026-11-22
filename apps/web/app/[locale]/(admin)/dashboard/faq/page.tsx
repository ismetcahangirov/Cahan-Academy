'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, Eye, EyeOff, HelpCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import adminApi from '@/lib/adminApi';
import { Button, Card, EmptyState, Skeleton, StatusPill } from '@/components/ui';
import FaqModal from '@/components/admin/FaqModal';
import { PageHead, RowAction } from '@/components/admin/AdminUI';
import { useFeedback } from '@/components/ui/Feedback';
import { useAdminList } from '@/components/admin/useAdminList';
import { apiMessage, assertOk } from '@/components/admin/utils';
import { cn } from '@/lib/utils';

type L3 = { az: string; en: string; ru: string };
interface Faq {
  id: string;
  question: L3;
  answer: L3;
  order: number;
  isActive: boolean;
}

export default function FAQAdminPage() {
  const t = useTranslations('admin');
  const { confirm, ok, fail } = useFeedback();
  const { items, setItems, loading, error, reload } = useAdminList<Faq>('/faqs/admin/all');
  const [open, setOpen] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Faq | null>(null);
  const sorted = useMemo(() => [...items].sort((a, b) => a.order - b.order), [items]);

  const openModal = (f: Faq | null) => {
    setEditTarget(f);
    setModalOpen(true);
  };

  const toggle = async (f: Faq) => {
    try {
      const { data } = await adminApi.put(`/faqs/admin/${f.id}/status`, { isActive: !f.isActive });
      assertOk(data);
      setItems((prev) => prev.map((x) => (x.id === f.id ? { ...x, isActive: !f.isActive } : x)));
      ok(t('common.saved'));
    } catch (e) {
      fail(apiMessage(e, t('common.status_error')));
    }
  };

  const askDelete = (f: Faq) =>
    confirm({
      title: t('confirm.delete_title'),
      entity: f.question.az,
      message: t('confirm.delete_body'),
      confirmLabel: t('confirm.delete_action'),
      onConfirm: async () => {
        const { data } = await adminApi.delete(`/faqs/admin/${f.id}`);
        assertOk(data);
        setItems((prev) => prev.filter((x) => x.id !== f.id));
        ok(t('common.deleted'));
      },
    });

  const newBtn = (
    <Button icon={Plus} onClick={() => openModal(null)}>
      {t('faq.new')}
    </Button>
  );

  return (
    <div>
      <PageHead title={t('faq.title')} subtitle={t('faq.subtitle', { count: items.length })} onRefresh={reload} loading={loading} actions={newBtn} />

      {loading && items.length === 0 ? (
        <Card className="space-y-4 p-5" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </Card>
      ) : error && items.length === 0 ? (
        <Card className="p-2">
          <EmptyState
            sketch="inkwell"
            title={t('common.load_error_title')}
            description={error}
            action={
              <Button variant="outline" onClick={reload}>
                {t('common.retry')}
              </Button>
            }
          />
        </Card>
      ) : sorted.length === 0 ? (
        <Card className="p-2">
          <EmptyState sketch="lamp" title={t('faq.empty_title')} description={t('faq.empty_desc')} action={newBtn} />
        </Card>
      ) : (
        <ul className="space-y-3">
          {sorted.map((f) => {
            const expanded = open === f.id;
            return (
              <li key={f.id}>
                <Card className={cn('overflow-hidden', expanded && 'border-line-strong')}>
                  <div className="flex items-center gap-2 p-2 pl-4">
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={`faq-${f.id}`}
                      onClick={() => setOpen(expanded ? null : f.id)}
                      className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-md text-left"
                    >
                      <HelpCircle size={18} strokeWidth={1.6} aria-hidden="true" className="shrink-0 text-ornament" />
                      <span className="min-w-0">
                        <span className="block font-semibold">{f.question.az}</span>
                        <span className="num block text-[0.9rem] text-ink-muted">
                          {t('faq.order')}: {f.order}
                        </span>
                      </span>
                      <ChevronDown size={18} strokeWidth={1.6} aria-hidden="true" className={cn('ml-auto shrink-0 transition-transform', expanded && 'rotate-180')} />
                    </button>
                    <span className="hidden sm:block">
                      {f.isActive ? <StatusPill status="success">{t('faq.visible')}</StatusPill> : <StatusPill status="neutral">{t('faq.hidden')}</StatusPill>}
                    </span>
                    <div className="flex shrink-0 items-center">
                      <RowAction icon={f.isActive ? EyeOff : Eye} label={`${f.isActive ? t('faq.hide') : t('faq.show')}: ${f.question.az}`} onClick={() => toggle(f)} />
                      <RowAction icon={Pencil} label={`${t('common.edit')}: ${f.question.az}`} onClick={() => openModal(f)} />
                      <RowAction icon={Trash2} label={`${t('common.delete')}: ${f.question.az}`} onClick={() => askDelete(f)} />
                    </div>
                  </div>
                  {expanded && (
                    <div id={`faq-${f.id}`} className="grid gap-5 border-t border-line-hair bg-surface-2 p-5 md:grid-cols-3">
                      {(['az', 'en', 'ru'] as const).map((l) => (
                        <div key={l} lang={l}>
                          <h4 className="sc text-[0.85rem] tracking-[0.12em] text-ink-muted">{t(`common.lang_${l}`)}</h4>
                          <p className="mt-1 font-semibold">{f.question[l]}</p>
                          <p className="mt-1 text-ink-muted">{f.answer[l]}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <FaqModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={reload} faqToEdit={editTarget} />
    </div>
  );
}
