'use client';

import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { AlertCircle, Save } from 'lucide-react';
import adminApi from '@/lib/adminApi';
import { Button, FormField, Input, Modal } from '@/components/ui';
import ImageUpload from './ImageUpload';
import { LangTabs, type Lang } from './AdminUI';
import { useFeedback } from '@/components/ui/Feedback';
import { apiMessage } from './utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  memberToEdit?: {
    id: string;
    name: string;
    positionAz: string;
    positionEn: string;
    positionRu: string;
    image: string | null;
    order: number;
  } | null;
}

const POS = { az: 'positionAz', en: 'positionEn', ru: 'positionRu' } as const;

/** Team member create / edit. */
export default function TeamMemberModal({ isOpen, onClose, onSuccess, memberToEdit }: Props) {
  const t = useTranslations('admin');
  const { ok } = useFeedback();
  const [tab, setTab] = useState<Lang>('az');
  const [serverError, setServerError] = useState('');

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, t('common.err_name')),
        positionAz: z.string().trim().min(1, t('team.err_position_az')),
        positionEn: z.string().trim().min(1, t('team.err_position_en')),
        positionRu: z.string().trim().min(1, t('team.err_position_ru')),
        image: z.string().optional(),
        order: z.number({ invalid_type_error: t('common.err_number') }).int(t('common.err_number')),
      }),
    [t]
  );
  type Values = z.infer<typeof schema>;
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!isOpen) return;
    setServerError('');
    setTab('az');
    reset({
      name: memberToEdit?.name ?? '',
      positionAz: memberToEdit?.positionAz ?? '',
      positionEn: memberToEdit?.positionEn ?? '',
      positionRu: memberToEdit?.positionRu ?? '',
      image: memberToEdit?.image ?? '',
      order: memberToEdit?.order ?? 0,
    });
  }, [isOpen, memberToEdit, reset]);

  const errorLangs = (['az', 'en', 'ru'] as Lang[]).filter((l) => errors[POS[l]]);

  const onSubmit = async (v: Values) => {
    setServerError('');
    try {
      const res = memberToEdit ? await adminApi.put(`/team/admin/${memberToEdit.id}`, v) : await adminApi.post('/team/admin', v);
      if (!res.data.success) throw { response: { data: res.data } };
      ok(t('common.saved'));
      onSuccess();
      onClose();
    } catch (e) {
      setServerError(apiMessage(e, t('common.save_error')));
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="md"
      title={memberToEdit ? t('team.modal_edit') : t('team.modal_new')}
      entity={memberToEdit?.name}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="team-form" icon={Save} loading={isSubmitting}>
            {isSubmitting ? t('common.saving') : t('common.save')}
          </Button>
        </>
      }
    >
      <form
        id="team-form"
        noValidate
        onSubmit={handleSubmit(onSubmit, (errs) => {
          const first = (['az', 'en', 'ru'] as Lang[]).find((l) => errs[POS[l]]);
          if (first) setTab(first);
        })}
        className="space-y-5"
      >
        <FormField label={t('common.name')} error={errors.name?.message} required>
          <Input {...register('name')} />
        </FormField>
        <LangTabs value={tab} onChange={setTab} errorLangs={errorLangs} />
        <FormField label={t('team.position')} error={errors[POS[tab]]?.message} required>
          <Input key={tab} {...register(POS[tab])} />
        </FormField>
        <FormField label={t('team.order')} hint={t('team.order_hint')} error={errors.order?.message}>
          <Input type="number" {...register('order', { valueAsNumber: true })} />
        </FormField>
        <FormField label={t('common.image')}>
          {(id) => <Controller name="image" control={control} render={({ field }) => <ImageUpload id={id} value={field.value || ''} onChange={field.onChange} />} />}
        </FormField>
        {serverError && (
          <p role="alert" className="field-error">
            <AlertCircle aria-hidden="true" strokeWidth={2} />
            {serverError}
          </p>
        )}
      </form>
    </Modal>
  );
}
