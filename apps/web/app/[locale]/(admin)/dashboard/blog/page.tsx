'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Eye, EyeOff, FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import adminApi from '@/lib/adminApi';
import { Button, StatusPill } from '@/components/ui';
import BlogModal from '@/components/admin/BlogModal';
import { DataView, PageHead, RowAction, Thumb } from '@/components/admin/AdminUI';
import { useAdminFeedback } from '@/components/admin/feedback';
import { useAdminList } from '@/components/admin/useAdminList';
import { apiMessage, asBool, assertOk, fmtDate } from '@/components/admin/utils';

interface Row {
  post: { id: string; slug: string; titleAz: string; isPublished: string | boolean; createdAt: string; image?: string | null };
  author: { name: string } | null;
}

export default function BlogAdminPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const { confirm, ok, fail } = useAdminFeedback();
  const { items, setItems, loading, error, reload } = useAdminList<Row>('/blog/admin/list');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Record<string, unknown> | null>(null);

  const openNew = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEdit = async (row: Row) => {
    try {
      const { data } = await adminApi.get(`/blog/admin/${row.post.slug}`);
      assertOk(data);
      setEditTarget(data.data);
      setModalOpen(true);
    } catch (e) {
      fail(apiMessage(e, t('blog.load_one_error')));
    }
  };

  const togglePublish = async (row: Row) => {
    const next = asBool(row.post.isPublished) ? 'false' : 'true';
    try {
      const { data } = await adminApi.put(`/blog/${row.post.id}`, { isPublished: next });
      assertOk(data);
      setItems((prev) => prev.map((r) => (r.post.id === row.post.id ? { ...r, post: { ...r.post, isPublished: next } } : r)));
      ok(t('common.saved'));
    } catch (e) {
      fail(apiMessage(e, t('common.status_error')));
    }
  };

  const askDelete = (row: Row) =>
    confirm({
      title: t('confirm.delete_title'),
      entity: row.post.titleAz,
      message: t('confirm.delete_body'),
      confirmLabel: t('confirm.delete_action'),
      onConfirm: async () => {
        const { data } = await adminApi.delete(`/blog/${row.post.id}`);
        assertOk(data);
        setItems((prev) => prev.filter((r) => r.post.id !== row.post.id));
        ok(t('common.deleted'));
      },
    });

  const newBtn = (
    <Button icon={Plus} onClick={openNew}>
      {t('blog.new')}
    </Button>
  );

  return (
    <div>
      <PageHead title={t('blog.title')} subtitle={t('blog.subtitle', { count: items.length })} onRefresh={reload} loading={loading} actions={newBtn} />
      <DataView
        caption={t('blog.title')}
        items={items}
        rowKey={(r) => r.post.id}
        loading={loading}
        error={error}
        onRetry={reload}
        empty={{ sketch: 'inkwell', title: t('blog.empty_title'), description: t('blog.empty_desc'), action: newBtn }}
        columns={[
          {
            key: 'title',
            header: t('blog.col_post'),
            cell: (r) => (
              <span className="flex items-center gap-3">
                <Thumb src={r.post.image} alt="" icon={FileText} />
                <span className="min-w-0">
                  <span className="block font-semibold">{r.post.titleAz}</span>
                  <span className="block text-[0.92rem] font-normal text-ink-muted">/{r.post.slug}</span>
                </span>
              </span>
            ),
          },
          { key: 'author', header: t('blog.col_author'), cell: (r) => r.author?.name || '—', wide: true },
          { key: 'date', header: t('common.date'), cell: (r) => <span className="time-italic">{fmtDate(r.post.createdAt, locale)}</span> },
          {
            key: 'status',
            header: t('common.status'),
            cell: (r) =>
              asBool(r.post.isPublished) ? (
                <StatusPill status="success">{t('blog.published')}</StatusPill>
              ) : (
                <StatusPill status="pending">{t('blog.draft')}</StatusPill>
              ),
          },
        ]}
        actions={(r) => {
          const pub = asBool(r.post.isPublished);
          return (
            <>
              <RowAction
                icon={pub ? EyeOff : Eye}
                label={`${pub ? t('blog.unpublish') : t('blog.publish')}: ${r.post.titleAz}`}
                onClick={() => togglePublish(r)}
              />
              <RowAction icon={Pencil} label={`${t('common.edit')}: ${r.post.titleAz}`} onClick={() => openEdit(r)} />
              <RowAction icon={Trash2} label={`${t('common.delete')}: ${r.post.titleAz}`} onClick={() => askDelete(r)} />
            </>
          );
        }}
      />
      <BlogModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={reload} postToEdit={editTarget} />
    </div>
  );
}
