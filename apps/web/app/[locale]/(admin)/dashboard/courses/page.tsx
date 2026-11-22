'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { BookOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import adminApi from '@/lib/adminApi';
import { Badge, Button } from '@/components/ui';
import CourseModal from '@/components/admin/CourseModal';
import { DataView, PageHead, RowAction, Thumb } from '@/components/admin/AdminUI';
import { useAdminFeedback } from '@/components/admin/feedback';
import { useAdminList } from '@/components/admin/useAdminList';
import { asBool, assertOk } from '@/components/admin/utils';

interface Course {
  id: string;
  slug: string;
  title_az: string;
  category_az: string;
  teacher_name: string;
  price: string;
  image?: string | null;
  is_popular: string | boolean;
}

export default function CoursesAdminPage() {
  const t = useTranslations('admin');
  const { confirm, ok } = useAdminFeedback();
  const { items, setItems, loading, error, reload } = useAdminList<Course>('/courses/admin/list');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Course | null>(null);

  const openModal = (c: Course | null) => {
    setEditTarget(c);
    setModalOpen(true);
  };

  const askDelete = (c: Course) =>
    confirm({
      title: t('confirm.delete_title'),
      entity: c.title_az,
      message: t('confirm.delete_body'),
      confirmLabel: t('confirm.delete_action'),
      onConfirm: async () => {
        const { data } = await adminApi.delete(`/courses/admin/${c.id}`);
        assertOk(data);
        setItems((prev) => prev.filter((x) => x.id !== c.id));
        ok(t('common.deleted'));
      },
    });

  const newBtn = (
    <Button icon={Plus} onClick={() => openModal(null)}>
      {t('courses.new')}
    </Button>
  );

  return (
    <div>
      <PageHead
        title={t('courses.title')}
        subtitle={t('courses.subtitle', { count: items.length })}
        onRefresh={reload}
        loading={loading}
        actions={newBtn}
      />

      <DataView
        caption={t('courses.title')}
        items={items}
        rowKey={(c) => c.id}
        loading={loading}
        error={error}
        onRetry={reload}
        empty={{ sketch: 'books', title: t('courses.empty_title'), description: t('courses.empty_desc'), action: newBtn }}
        columns={[
          {
            key: 'title',
            header: t('courses.col_course'),
            cell: (c) => (
              <span className="flex items-center gap-3">
                <Thumb src={c.image} alt="" icon={BookOpen} />
                <span className="min-w-0">
                  <span className="block font-semibold">{c.title_az}</span>
                  <span className="block text-[0.92rem] font-normal text-ink-muted">/{c.slug}</span>
                </span>
              </span>
            ),
          },
          {
            key: 'meta',
            header: t('courses.col_meta'),
            cell: (c) => (
              <span className="block">
                <span className="block">{c.category_az || t('common.not_set')}</span>
                <span className="block text-[0.92rem] text-ink-muted">{c.teacher_name || t('common.not_set')}</span>
              </span>
            ),
          },
          { key: 'price', header: t('courses.col_price'), cell: (c) => <span className="num">{c.price || t('courses.free')}</span> },
          {
            key: 'status',
            header: t('common.status'),
            cell: (c) => (asBool(c.is_popular) ? <Badge tone="solid">{t('courses.popular')}</Badge> : <Badge>{t('courses.normal')}</Badge>),
          },
        ]}
        actions={(c) => (
          <>
            <RowAction icon={Pencil} label={`${t('common.edit')}: ${c.title_az}`} onClick={() => openModal(c)} />
            <RowAction icon={Trash2} label={`${t('common.delete')}: ${c.title_az}`} onClick={() => askDelete(c)} />
          </>
        )}
      />

      <CourseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={reload}
        courseToEdit={editTarget}
      />
    </div>
  );
}
