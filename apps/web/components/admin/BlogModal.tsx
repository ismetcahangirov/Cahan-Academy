'use client';

import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { AlertCircle, Save } from 'lucide-react';
import adminApi from '@/lib/adminApi';
import { Button, FormField, Input, Modal, Select, Textarea } from '@/components/ui';
import ImageUpload from './ImageUpload';
import { LangTabs, type Lang } from './AdminUI';
import { useAdminFeedback } from './feedback';
import { apiMessage, slugify } from './utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  postToEdit?: Record<string, any> | null; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const TITLE = { az: 'titleAz', en: 'titleEn', ru: 'titleRu' } as const;
const CONTENT = { az: 'contentAz', en: 'contentEn', ru: 'contentRu' } as const;
const EXCERPT = { az: 'excerptAz', en: 'excerptEn', ru: 'excerptRu' } as const;

/** Blog post create / edit: title, excerpt, content (HTML) in az / en / ru + slug, cover, reading time, status. */
export default function BlogModal({ isOpen, onClose, onSuccess, postToEdit }: Props) {
  const t = useTranslations('admin');
  const { ok } = useAdminFeedback();
  const [tab, setTab] = useState<Lang>('az');
  const [serverError, setServerError] = useState('');

  const schema = useMemo(
    () =>
      z.object({
        titleAz: z.string().trim().min(1, t('blog.err_title_az')),
        titleEn: z.string().trim().min(1, t('blog.err_title_en')),
        titleRu: z.string().trim().min(1, t('blog.err_title_ru')),
        slug: z.string().trim().min(1, t('common.err_slug')),
        contentAz: z.string().trim().min(1, t('blog.err_content_az')),
        contentEn: z.string().trim().min(1, t('blog.err_content_en')),
        contentRu: z.string().trim().min(1, t('blog.err_content_ru')),
        excerptAz: z.string().optional(),
        excerptEn: z.string().optional(),
        excerptRu: z.string().optional(),
        image: z.string().optional(),
        readingTime: z.string().optional(),
        isPublished: z.enum(['true', 'false']),
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
    const p = postToEdit;
    reset({
      titleAz: p?.titleAz ?? '',
      titleEn: p?.titleEn ?? '',
      titleRu: p?.titleRu ?? '',
      slug: p?.slug ?? '',
      contentAz: p?.contentAz ?? '',
      contentEn: p?.contentEn ?? '',
      contentRu: p?.contentRu ?? '',
      excerptAz: p?.excerptAz ?? '',
      excerptEn: p?.excerptEn ?? '',
      excerptRu: p?.excerptRu ?? '',
      image: p?.image ?? '',
      readingTime: p?.readingTime ?? '',
      isPublished: p?.isPublished === 'false' || p?.isPublished === false ? 'false' : 'true',
    });
  }, [isOpen, postToEdit, reset]);

  const titleAz = watch('titleAz');
  useEffect(() => {
    if (!postToEdit && titleAz) setValue('slug', slugify(titleAz), { shouldValidate: true });
  }, [titleAz, postToEdit, setValue]);

  const hasErr = (l: Lang) => !!(errors[TITLE[l]] || errors[CONTENT[l]]);
  const errorLangs = (['az', 'en', 'ru'] as Lang[]).filter(hasErr);

  const onSubmit = async (v: Values) => {
    setServerError('');
    try {
      const res = postToEdit ? await adminApi.put(`/blog/${postToEdit.id}`, v) : await adminApi.post('/blog', v);
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
      size="xl"
      title={postToEdit ? t('blog.modal_edit') : t('blog.modal_new')}
      entity={postToEdit?.titleAz}
      footer={
        <>
          {errorLangs.length > 0 && <p className="field-error mr-auto mt-0">{t('common.required_langs')}</p>}
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="blog-form" icon={Save} loading={isSubmitting}>
            {isSubmitting ? t('common.saving') : t('common.save')}
          </Button>
        </>
      }
    >
      <form
        id="blog-form"
        noValidate
        onSubmit={handleSubmit(onSubmit, (errs) => {
          const first = (['az', 'en', 'ru'] as Lang[]).find((l) => errs[TITLE[l]] || errs[CONTENT[l]]);
          if (first) setTab(first);
        })}
        className="space-y-5"
      >
        <LangTabs value={tab} onChange={setTab} errorLangs={errorLangs} />
        <FormField label={t('blog.field_title')} error={errors[TITLE[tab]]?.message} required>
          <Input key={`t${tab}`} {...register(TITLE[tab])} />
        </FormField>
        <FormField label={t('blog.field_excerpt')}>
          <Textarea key={`e${tab}`} rows={2} {...register(EXCERPT[tab])} />
        </FormField>
        <FormField label={t('blog.field_content')} hint={t('common.html_hint')} error={errors[CONTENT[tab]]?.message} required>
          <Textarea key={`c${tab}`} rows={9} {...register(CONTENT[tab])} />
        </FormField>

        <div className="grid gap-4 border-t border-line-hair pt-5 sm:grid-cols-2">
          <FormField label={t('common.slug')} error={errors.slug?.message} required>
            <Input {...register('slug')} />
          </FormField>
          <FormField label={t('blog.reading_time')} hint={t('blog.reading_time_hint')}>
            <Input {...register('readingTime')} />
          </FormField>
          <FormField label={t('common.status')}>
            <Select {...register('isPublished')}>
              <option value="true">{t('blog.status_published')}</option>
              <option value="false">{t('blog.status_draft')}</option>
            </Select>
          </FormField>
          <FormField label={t('common.image')} className="sm:col-span-2">
            {(id) => <Controller name="image" control={control} render={({ field }) => <ImageUpload id={id} value={field.value || ''} onChange={field.onChange} />} />}
          </FormField>
        </div>
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
