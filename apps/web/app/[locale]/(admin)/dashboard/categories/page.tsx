'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import adminApi from '@/lib/adminApi';
import { Button } from '@/components/ui';
import CategoryModal from '@/components/admin/CategoryModal';
import { DataView, PageHead, RowAction, Thumb } from '@/components/admin/AdminUI';
import { useAdminFeedback } from '@/components/admin/feedback';
import { useAdminList } from '@/components/admin/useAdminList';
import { assertOk } from '@/components/admin/utils';

interface Category {
  id: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  slug: string;
}

export default function CategoriesAdminPage() {
  const t = useTranslations('admin');
  const { confirm, ok } = useAdminFeedback();
  const { items, setItems, loading, error, reload } = useAdminList<Category>('/categories');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);

  const openModal = (c: Category | null) => {
    setEditTarget(c);
    setModalOpen(true);
  };

  const askDelete = (c: Category) =>
    confirm({
      title: t('confirm.delete_title'),
      entity: c.nameAz,
      message: t('confirm.delete_body'),
      confirmLabel: t('confirm.delete_action'),
      onConfirm: async () => {
        const { data } = await adminApi.delete(`/categories/admin/${c.id}`);
        assertOk(data);
        setItems((prev) => prev.filter((x) => x.id !== c.id));
        ok(t('common.deleted'));
      },
    });

  const newBtn = (
    <Button icon={Plus} onClick={() => openModal(null)}>
      {t('categories.new')}
    </Button>
  );

  return (
    <div>
      <PageHead
        title={t('categories.title')}
        subtitle={t('categories.subtitle', { count: items.length })}
        onRefresh={reload}
        loading={loading}
        actions={newBtn}
      />
      <DataView
        caption={t('categories.title')}
        items={items}
        rowKey={(c) => c.id}
        loading={loading}
        error={error}
        onRetry={reload}
        empty={{ sketch: 'notebook', title: t('categories.empty_title'), description: t('categories.empty_desc'), action: newBtn }}
        columns={[
          {
            key: 'name',
            header: t('categories.col_name'),
            cell: (c) => (
              <span className="flex items-center gap-3">
                <Thumb alt="" icon={Tags} />
                <span className="font-semibold">{c.nameAz}</span>
              </span>
            ),
          },
          { key: 'slug', header: t('common.slug'), cell: (c) => <span className="text-ink-muted">{c.slug}</span> },
          { key: 'en', header: t('categories.col_en'), cell: (c) => c.nameEn },
          { key: 'ru', header: t('categories.col_ru'), cell: (c) => c.nameRu },
        ]}
        actions={(c) => (
          <>
            <RowAction icon={Pencil} label={`${t('common.edit')}: ${c.nameAz}`} onClick={() => openModal(c)} />
            <RowAction icon={Trash2} label={`${t('common.delete')}: ${c.nameAz}`} onClick={() => askDelete(c)} />
          </>
        )}
      />
      <CategoryModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={reload} categoryToEdit={editTarget} />
    </div>
  );
}
