'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { AlertCircle, Save } from 'lucide-react';
import adminApi from '@/lib/adminApi';
import { Button, FormField, Input, Modal } from '@/components/ui';
import { LangTabs, type Lang } from './AdminUI';
import { useAdminFeedback } from './feedback';
import { apiMessage, slugify } from './utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryToEdit?: { id: string; nameAz: string; nameEn: string; nameRu: string; slug: string } | null;
}

/** Category create / edit: name in az / en / ru + slug (auto from the az name for new items). */
export default function CategoryModal({ isOpen, onClose, onSuccess, categoryToEdit }: Props) {
  const t = useTranslations('admin');
  const { ok } = useAdminFeedback();
  const [tab, setTab] = useState<Lang>('az');
  const [serverError, setServerError] = useState('');

  const schema = useMemo(
    () =>
      z.object({
        nameAz: z.string().trim().min(1, t('categories.err_name_az')),
        nameEn: z.string().trim().min(1, t('categories.err_name_en')),
        nameRu: z.string().trim().min(1, t('categories.err_name_ru')),
        slug: z.string().trim().min(1, t('common.err_slug')),
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
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!isOpen) return;
    setServerError('');
    setTab('az');
    reset({
      nameAz: categoryToEdit?.nameAz ?? '',
      nameEn: categoryToEdit?.nameEn ?? '',
      nameRu: categoryToEdit?.nameRu ?? '',
      slug: categoryToEdit?.slug ?? '',
    });
  }, [isOpen, categoryToEdit, reset]);

  const nameAz = watch('nameAz');
  useEffect(() => {
    if (!categoryToEdit && nameAz) setValue('slug', slugify(nameAz), { shouldValidate: true });
  }, [nameAz, categoryToEdit, setValue]);

  const nameKey = ({ az: 'nameAz', en: 'nameEn', ru: 'nameRu' } as const)[tab];
  const errorLangs = (['az', 'en', 'ru'] as Lang[]).filter((l) => errors[({ az: 'nameAz', en: 'nameEn', ru: 'nameRu' } as const)[l]]);

  const onSubmit = async (v: Values) => {
    setServerError('');
    try {
      const res = categoryToEdit ? await adminApi.put(`/categories/admin/${categoryToEdit.id}`, v) : await adminApi.post('/categories/admin', v);
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
      title={categoryToEdit ? t('categories.modal_edit') : t('categories.modal_new')}
      entity={categoryToEdit?.nameAz}
      subtitle={t('common.three_langs')}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="category-form" icon={Save} loading={isSubmitting}>
            {isSubmitting ? t('common.saving') : t('common.save')}
          </Button>
        </>
      }
    >
      <form
        id="category-form"
        noValidate
        onSubmit={handleSubmit(onSubmit, (errs) => {
          const first = (['az', 'en', 'ru'] as Lang[]).find((l) => errs[({ az: 'nameAz', en: 'nameEn', ru: 'nameRu' } as const)[l]]);
          if (first) setTab(first);
        })}
        className="space-y-5"
      >
        <LangTabs value={tab} onChange={setTab} errorLangs={errorLangs} />
        <FormField label={t('categories.name')} error={errors[nameKey]?.message} required>
          <Input key={nameKey} {...register(nameKey)} />
        </FormField>
        <FormField label={t('common.slug')} error={errors.slug?.message} required>
          <Input {...register('slug')} />
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
