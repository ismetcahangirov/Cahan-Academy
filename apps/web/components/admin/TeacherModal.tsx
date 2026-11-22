'use client';

import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { AlertCircle, Save } from 'lucide-react';
import adminApi from '@/lib/adminApi';
import { Button, FormField, Input, Modal, Textarea } from '@/components/ui';
import ImageUpload from './ImageUpload';
import { LangTabs, type Lang } from './AdminUI';
import { useAdminFeedback } from './feedback';
import { apiMessage, slugify } from './utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  teacherToEdit?: ({ id: string } & Record<string, any>) | null; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const BIO = { az: 'bioAz', en: 'bioEn', ru: 'bioRu' } as const;
const POS = { az: 'positionAz', en: 'positionEn', ru: 'positionRu' } as const;

/** Teacher create / edit: name, slug, photo, bio + position in az / en / ru. */
export default function TeacherModal({ isOpen, onClose, onSuccess, teacherToEdit }: Props) {
  const t = useTranslations('admin');
  const { ok } = useAdminFeedback();
  const [tab, setTab] = useState<Lang>('az');
  const [serverError, setServerError] = useState('');

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, t('common.err_name')),
        slug: z.string().trim().min(1, t('common.err_slug')),
        image: z.string().optional(),
        bioAz: z.string().optional(),
        bioEn: z.string().optional(),
        bioRu: z.string().optional(),
        positionAz: z.string().optional(),
        positionEn: z.string().optional(),
        positionRu: z.string().optional(),
      }),
    [t]
  );
  type Values = z.infer<typeof schema>;
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!isOpen) return;
    setServerError('');
    setTab('az');
    const e = teacherToEdit;
    reset({
      name: e?.name ?? '',
      slug: e?.slug ?? '',
      image: e?.image ?? '',
      bioAz: e?.bioAz ?? '',
      bioEn: e?.bioEn ?? '',
      bioRu: e?.bioRu ?? '',
      positionAz: e?.positionAz ?? '',
      positionEn: e?.positionEn ?? '',
      positionRu: e?.positionRu ?? '',
    });
  }, [isOpen, teacherToEdit, reset]);

  const name = watch('name');
  useEffect(() => {
    if (!teacherToEdit && name) setValue('slug', slugify(name), { shouldValidate: true });
  }, [name, teacherToEdit, setValue]);

  const onSubmit = async (v: Values) => {
    setServerError('');
    try {
      const res = teacherToEdit ? await adminApi.put(`/teachers/admin/${teacherToEdit.id}`, v) : await adminApi.post('/teachers/admin', v);
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
      size="lg"
      title={teacherToEdit ? t('teachers.modal_edit') : t('teachers.modal_new')}
      entity={teacherToEdit?.name ?? undefined}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="teacher-form" icon={Save} loading={isSubmitting}>
            {isSubmitting ? t('common.saving') : t('common.save')}
          </Button>
        </>
      }
    >
      <form id="teacher-form" noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={t('common.name')} error={errors.name?.message} required>
            <Input {...register('name')} />
          </FormField>
          <FormField label={t('common.slug')} error={errors.slug?.message} required>
            <Input {...register('slug')} />
          </FormField>
        </div>
        <LangTabs value={tab} onChange={setTab} />
        <FormField label={t('teachers.position')}>
          <Input key={`p${tab}`} {...register(POS[tab])} />
        </FormField>
        <FormField label={t('teachers.bio')}>
          <Textarea key={`b${tab}`} rows={5} {...register(BIO[tab])} />
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
