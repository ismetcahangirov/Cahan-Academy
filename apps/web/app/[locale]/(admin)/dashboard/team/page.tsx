'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import adminApi from '@/lib/adminApi';
import { Button } from '@/components/ui';
import TeamMemberModal from '@/components/admin/TeamMemberModal';
import { DataView, PageHead, RowAction, Thumb } from '@/components/admin/AdminUI';
import { useAdminFeedback } from '@/components/admin/feedback';
import { useAdminList } from '@/components/admin/useAdminList';
import { assertOk } from '@/components/admin/utils';

interface Member {
  id: string;
  name: string;
  positionAz: string;
  positionEn: string;
  positionRu: string;
  image: string | null;
  order: number;
}

export default function TeamAdminPage() {
  const t = useTranslations('admin');
  const { confirm, ok } = useAdminFeedback();
  const { items, setItems, loading, error, reload } = useAdminList<Member>('/team');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Member | null>(null);
  const sorted = useMemo(() => [...items].sort((a, b) => a.order - b.order), [items]);

  const openModal = (x: Member | null) => {
    setEditTarget(x);
    setModalOpen(true);
  };

  const askDelete = (x: Member) =>
    confirm({
      title: t('confirm.delete_title'),
      entity: x.name,
      message: t('confirm.delete_body'),
      confirmLabel: t('confirm.delete_action'),
      onConfirm: async () => {
        const { data } = await adminApi.delete(`/team/admin/${x.id}`);
        assertOk(data);
        setItems((prev) => prev.filter((y) => y.id !== x.id));
        ok(t('common.deleted'));
      },
    });

  const newBtn = (
    <Button icon={Plus} onClick={() => openModal(null)}>
      {t('team.new')}
    </Button>
  );

  return (
    <div>
      <PageHead title={t('team.title')} subtitle={t('team.subtitle', { count: items.length })} onRefresh={reload} loading={loading} actions={newBtn} />
      <DataView
        caption={t('team.title')}
        items={sorted}
        rowKey={(x) => x.id}
        loading={loading}
        error={error}
        onRetry={reload}
        empty={{ sketch: 'globe', title: t('team.empty_title'), description: t('team.empty_desc'), action: newBtn }}
        columns={[
          {
            key: 'name',
            header: t('team.col_member'),
            cell: (x) => (
              <span className="flex items-center gap-3">
                <Thumb src={x.image} alt="" icon={Users} />
                <span className="font-semibold">{x.name}</span>
              </span>
            ),
          },
          { key: 'az', header: t('team.col_position_az'), cell: (x) => x.positionAz },
          { key: 'en', header: t('team.col_position_en'), cell: (x) => x.positionEn, wide: true },
          { key: 'order', header: t('common.order'), num: true, cell: (x) => <span className="num">{x.order}</span> },
        ]}
        actions={(x) => (
          <>
            <RowAction icon={Pencil} label={`${t('common.edit')}: ${x.name}`} onClick={() => openModal(x)} />
            <RowAction icon={Trash2} label={`${t('common.delete')}: ${x.name}`} onClick={() => askDelete(x)} />
          </>
        )}
      />
      <TeamMemberModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={reload} memberToEdit={editTarget} />
    </div>
  );
}
