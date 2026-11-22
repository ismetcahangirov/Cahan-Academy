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
import { useFeedback } from '@/components/ui/Feedback';
import { apiMessage, asBool, slugify } from './utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  courseToEdit?: Record<string, any> | null; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const TITLE = { az: 'titleAz', en: 'titleEn', ru: 'titleRu' } as const;
const DESC = { az: 'descriptionAz', en: 'descriptionEn', ru: 'descriptionRu' } as const;
const SYL = { az: 'syllabusAz', en: 'syllabusEn', ru: 'syllabusRu' } as const;

/** Course create / edit: title, description, syllabus in az / en / ru + slug, category, teacher, price, level… */
export default function CourseModal({ isOpen, onClose, onSuccess, courseToEdit }: Props) {
  const t = useTranslations('admin');
  const { ok } = useFeedback();
  const [tab, setTab] = useState<Lang>('az');
  const [serverError, setServerError] = useState('');
  const [categories, setCategories] = useState<{ id: string; nameAz: string }[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [optionsError, setOptionsError] = useState('');

  const schema = useMemo(
    () =>
      z.object({
        titleAz: z.string().trim().min(1, t('courses.err_title_az')),
        titleEn: z.string().trim().min(1, t('courses.err_title_en')),
        titleRu: z.string().trim().min(1, t('courses.err_title_ru')),
        slug: z.string().trim().min(1, t('common.err_slug')),
        descriptionAz: z.string().trim().min(1, t('courses.err_desc_az')),
        descriptionEn: z.string().trim().min(1, t('courses.err_desc_en')),
        descriptionRu: z.string().trim().min(1, t('courses.err_desc_ru')),
        categoryId: z.string().min(1, t('courses.err_category')),
        teacherId: z.string().min(1, t('courses.err_teacher')),
        price: z.string().optional(),
        duration: z.string().optional(),
        level: z.enum(['beginner', 'intermediate', 'advanced', 'all']),
        image: z.string().optional(),
        isPopular: z.enum(['true', 'false']),
        rating: z.string().optional(),
        studentsCount: z.string().optional(),
        syllabusAz: z.string().optional(),
        syllabusEn: z.string().optional(),
        syllabusRu: z.string().optional(),
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
    setOptionsError('');
    setTab('az');
    Promise.all([adminApi.get('/courses/categories'), adminApi.get('/teachers')])
      .then(([c, tr]) => {
        setCategories(c.data.data || []);
        setTeachers(tr.data.data || []);
      })
      .catch((e) => setOptionsError(apiMessage(e, t('courses.options_error'))));
    const c = courseToEdit;
    reset({
      titleAz: c?.title_az ?? '',
      titleEn: c?.title_en ?? '',
      titleRu: c?.title_ru ?? '',
      slug: c?.slug ?? '',
      descriptionAz: c?.description_az ?? '',
      descriptionEn: c?.description_en ?? '',
      descriptionRu: c?.description_ru ?? '',
      categoryId: c?.category_id ?? '',
      teacherId: c?.teacher_id ?? '',
      price: c?.price ?? '',
      duration: c?.duration ?? '',
      level: c?.level ?? 'beginner',
      image: c?.image ?? '',
      isPopular: asBool(c?.is_popular) ? 'true' : 'false',
      rating: c?.rating ?? '',
      studentsCount: c?.students_count ?? '',
      syllabusAz: c?.syllabus_az ?? '',
      syllabusEn: c?.syllabus_en ?? '',
      syllabusRu: c?.syllabus_ru ?? '',
    });
  }, [isOpen, courseToEdit, reset, t]);

  const titleAz = watch('titleAz');
  useEffect(() => {
    if (!courseToEdit && titleAz) setValue('slug', slugify(titleAz), { shouldValidate: true });
  }, [titleAz, courseToEdit, setValue]);

  const hasErr = (l: Lang) => !!(errors[TITLE[l]] || errors[DESC[l]]);
  const errorLangs = (['az', 'en', 'ru'] as Lang[]).filter(hasErr);

  const onSubmit = async (v: Values) => {
    setServerError('');
    try {
      const res = courseToEdit ? await adminApi.put(`/courses/admin/${courseToEdit.id}`, v) : await adminApi.post('/courses/admin', v);
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
      title={courseToEdit ? t('courses.modal_edit') : t('courses.modal_new')}
      entity={courseToEdit?.title_az}
      footer={
        <>
          {errorLangs.length > 0 && <p className="field-error mr-auto mt-0">{t('common.required_langs')}</p>}
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="course-form" icon={Save} loading={isSubmitting}>
            {isSubmitting ? t('common.saving') : t('common.save')}
          </Button>
        </>
      }
    >
      <form
        id="course-form"
        noValidate
        onSubmit={handleSubmit(onSubmit, (errs) => {
          const first = (['az', 'en', 'ru'] as Lang[]).find((l) => errs[TITLE[l]] || errs[DESC[l]]);
          if (first) setTab(first);
        })}
        className="space-y-5"
      >
        <LangTabs value={tab} onChange={setTab} errorLangs={errorLangs} />
        <FormField label={t('courses.field_title')} error={errors[TITLE[tab]]?.message} required>
          <Input key={`t${tab}`} {...register(TITLE[tab])} />
        </FormField>
        <FormField label={t('courses.field_description')} error={errors[DESC[tab]]?.message} required>
          <Textarea key={`d${tab}`} rows={3} {...register(DESC[tab])} />
        </FormField>
        <FormField label={t('courses.field_syllabus')} hint={t('common.html_hint')}>
          <Textarea key={`s${tab}`} rows={4} {...register(SYL[tab])} />
        </FormField>

        <div className="grid gap-4 border-t border-line-hair pt-5 sm:grid-cols-2">
          <FormField label={t('common.slug')} error={errors.slug?.message} required>
            <Input {...register('slug')} />
          </FormField>
          <FormField label={t('courses.field_category')} error={errors.categoryId?.message} required>
            <Select {...register('categoryId')}>
              <option value="">{t('common.select')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameAz}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label={t('courses.field_teacher')} error={errors.teacherId?.message} required>
            <Select {...register('teacherId')}>
              <option value="">{t('common.select')}</option>
              {teachers.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label={t('courses.field_level')}>
            <Select {...register('level')}>
              <option value="beginner">{t('courses.level_beginner')}</option>
              <option value="intermediate">{t('courses.level_intermediate')}</option>
              <option value="advanced">{t('courses.level_advanced')}</option>
              <option value="all">{t('courses.level_all')}</option>
            </Select>
          </FormField>
          <FormField label={t('courses.col_price')} hint={t('courses.price_hint')}>
            <Input {...register('price')} />
          </FormField>
          <FormField label={t('courses.field_duration')} hint={t('courses.duration_hint')}>
            <Input {...register('duration')} />
          </FormField>
          <FormField label={t('courses.field_popular')}>
            <Select {...register('isPopular')}>
              <option value="false">{t('common.no')}</option>
              <option value="true">{t('common.yes')}</option>
            </Select>
          </FormField>
          <FormField label={t('courses.field_rating')} hint={t('courses.rating_hint')}>
            <Input inputMode="decimal" {...register('rating')} />
          </FormField>
          <FormField label={t('courses.field_students')} hint={t('courses.students_hint')}>
            <Input inputMode="numeric" {...register('studentsCount')} />
          </FormField>
          <FormField label={t('common.image')} className="sm:col-span-2">
            {(id) => <Controller name="image" control={control} render={({ field }) => <ImageUpload id={id} value={field.value || ''} onChange={field.onChange} />} />}
          </FormField>
        </div>
        {(serverError || optionsError) && (
          <p role="alert" className="field-error">
            <AlertCircle aria-hidden="true" strokeWidth={2} />
            {serverError || optionsError}
          </p>
        )}
      </form>
    </Modal>
  );
}
