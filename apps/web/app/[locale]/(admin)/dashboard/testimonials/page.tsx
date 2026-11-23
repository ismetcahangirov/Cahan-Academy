'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, Pencil, Plus, Quote, Star, Trash2 } from 'lucide-react';
import adminApi, { refreshSite } from '@/lib/adminApi';
import { Button, Card, EmptyState, Skeleton, StatusPill } from '@/components/ui';
import TestimonialModal, { type AdminTestimonial } from '@/components/admin/TestimonialModal';
import { PageHead, RowAction } from '@/components/admin/AdminUI';
import { useFeedback } from '@/components/ui/Feedback';
import { useAdminList } from '@/components/admin/useAdminList';
import { apiMessage, assertOk } from '@/components/admin/utils';

/** Testimonials shown in the wine band on the home and about pages (hidden ones stay here only). */
export default function TestimonialsAdminPage() {
  const t = useTranslations('admin');
  const { confirm, ok, fail } = useFeedback();
  const { items, setItems, loading, error, reload } = useAdminList<AdminTestimonial>('/testimonials/admin/all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminTestimonial | null>(null);
  const sorted = useMemo(() => [...items].sort((a, b) => a.order - b.order), [items]);

  const openModal = (item: AdminTestimonial | null) => {
    setEditTarget(item);
    setModalOpen(true);
  };

  const toggle = async (item: AdminTestimonial) => {
    try {
      const { data } = await adminApi.put(`/testimonials/admin/${item.id}/status`, { isActive: !item.isActive });
      assertOk(data);
      setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, isActive: !item.isActive } : x)));
      refreshSite(['testimonials']);
      ok(t('common.saved'));
    } catch (e) {
      fail(apiMessage(e, t('common.status_error')));
    }
  };

  const askDelete = (item: AdminTestimonial) =>
    confirm({
      title: t('confirm.delete_title'),
      entity: item.name,
      message: t('confirm.delete_body'),
      confirmLabel: t('confirm.delete_action'),
      onConfirm: async () => {
        const { data } = await adminApi.delete(`/testimonials/admin/${item.id}`);
        assertOk(data);
        setItems((prev) => prev.filter((x) => x.id !== item.id));
        refreshSite(['testimonials']);
        ok(t('common.deleted'));
      },
    });

  const newBtn = (
    <Button icon={Plus} onClick={() => openModal(null)}>
      {t('testimonials.new')}
    </Button>
  );

  return (
    <div>
      <PageHead
        title={t('testimonials.title')}
        subtitle={t('testimonials.subtitle', { count: items.length })}
        onRefresh={reload}
        loading={loading}
        actions={newBtn}
      />

      {loading && items.length === 0 ? (
        <Card className="space-y-4 p-5" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
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
          <EmptyState sketch="notebook" title={t('testimonials.empty_title')} description={t('testimonials.empty_desc')} action={newBtn} />
        </Card>
      ) : (
        <ul className="space-y-3">
          {sorted.map((item) => (
            <li key={item.id}>
              <Card className="flex items-start gap-3 p-4">
                <Quote size={18} strokeWidth={1.6} aria-hidden="true" className="mt-1 shrink-0 text-ornament" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {item.name}
                    {item.role && <span className="font-normal text-ink-muted"> · {item.role}</span>}
                  </p>
                  <p className="mt-1 line-clamp-2 text-ink-muted">{item.text}</p>
                  <p className="num mt-1 flex items-center gap-3 text-[0.9rem] text-ink-muted">
                    <span className="inline-flex items-center gap-1" aria-label={t('testimonials.rating_label', { n: item.rating })}>
                      <Star size={14} strokeWidth={1.6} aria-hidden="true" className="fill-current text-ornament" />
                      {item.rating}/5
                    </span>
                    <span>
                      {t('common.order')}: {item.order}
                    </span>
                  </p>
                </div>
                <span className="hidden sm:block">
                  {item.isActive ? <StatusPill status="success">{t('faq.visible')}</StatusPill> : <StatusPill status="neutral">{t('faq.hidden')}</StatusPill>}
                </span>
                <div className="flex shrink-0 items-center">
                  <RowAction icon={item.isActive ? EyeOff : Eye} label={`${item.isActive ? t('faq.hide') : t('faq.show')}: ${item.name}`} onClick={() => toggle(item)} />
                  <RowAction icon={Pencil} label={`${t('common.edit')}: ${item.name}`} onClick={() => openModal(item)} />
                  <RowAction icon={Trash2} label={`${t('common.delete')}: ${item.name}`} onClick={() => askDelete(item)} />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <TestimonialModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          reload();
          refreshSite(['testimonials']);
        }}
        item={editTarget}
      />
    </div>
  );
}
