'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { GraduationCap, Pencil, Plus, Trash2 } from 'lucide-react';
import adminApi from '@/lib/adminApi';
import { Button } from '@/components/ui';
import TeacherModal from '@/components/admin/TeacherModal';
import { DataView, PageHead, RowAction, Thumb } from '@/components/admin/AdminUI';
import { useAdminFeedback } from '@/components/admin/feedback';
import { useAdminList } from '@/components/admin/useAdminList';
import { assertOk } from '@/components/admin/utils';

interface Teacher {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  positionAz: string | null;
}

export default function TeachersAdminPage() {
  const t = useTranslations('admin');
  const { confirm, ok } = useAdminFeedback();
  const { items, setItems, loading, error, reload } = useAdminList<Teacher>('/teachers/admin/list');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Teacher | null>(null);

  const openModal = (x: Teacher | null) => {
    setEditTarget(x);
    setModalOpen(true);
  };

  const askDelete = (x: Teacher) =>
    confirm({
      title: t('confirm.delete_title'),
      entity: x.name,
      message: t('confirm.delete_body'),
      confirmLabel: t('confirm.delete_action'),
      onConfirm: async () => {
        const { data } = await adminApi.delete(`/teachers/admin/${x.id}`);
        assertOk(data);
        setItems((prev) => prev.filter((y) => y.id !== x.id));
        ok(t('common.deleted'));
      },
    });

  const newBtn = (
    <Button icon={Plus} onClick={() => openModal(null)}>
      {t('teachers.new')}
    </Button>
  );

  return (
    <div>
      <PageHead
        title={t('teachers.title')}
        subtitle={t('teachers.subtitle', { count: items.length })}
        onRefresh={reload}
        loading={loading}
        actions={newBtn}
      />
      <DataView
        caption={t('teachers.title')}
        items={items}
        rowKey={(x) => x.id}
        loading={loading}
        error={error}
        onRetry={reload}
        empty={{ sketch: 'cap', title: t('teachers.empty_title'), description: t('teachers.empty_desc'), action: newBtn }}
        columns={[
          {
            key: 'name',
            header: t('teachers.col_teacher'),
            cell: (x) => (
              <span className="flex items-center gap-3">
                <Thumb src={x.image} alt="" icon={GraduationCap} />
                <span className="font-semibold">{x.name}</span>
              </span>
            ),
          },
          { key: 'slug', header: t('common.slug'), cell: (x) => <span className="text-ink-muted">{x.slug}</span> },
          { key: 'position', header: t('teachers.col_position'), cell: (x) => x.positionAz || '—' },
        ]}
        actions={(x) => (
          <>
            <RowAction icon={Pencil} label={`${t('common.edit')}: ${x.name}`} onClick={() => openModal(x)} />
            <RowAction icon={Trash2} label={`${t('common.delete')}: ${x.name}`} onClick={() => askDelete(x)} />
          </>
        )}
      />
      <TeacherModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={reload} teacherToEdit={editTarget} />
    </div>
  );
}
