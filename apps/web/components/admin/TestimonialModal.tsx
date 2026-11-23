'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { AlertCircle, Save } from 'lucide-react';
import adminApi from '@/lib/adminApi';
import { Button, Checkbox, FormField, Input, Modal, Textarea } from '@/components/ui';
import { useFeedback } from '@/components/ui/Feedback';
import { apiMessage } from './utils';

export interface AdminTestimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  order: number;
  isActive: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item?: AdminTestimonial | null;
}

/** Testimonial create / edit: the student's name, what they do now, the quote (as they wrote it), stars, order. */
export default function TestimonialModal({ isOpen, onClose, onSuccess, item }: Props) {
  const t = useTranslations('admin');
  const { ok } = useFeedback();
  const [serverError, setServerError] = useState('');

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, t('common.err_name')),
        role: z.string().trim().max(255),
        text: z.string().trim().min(10, t('testimonials.err_text')),
        rating: z.number({ invalid_type_error: t('testimonials.err_rating') }).int().min(1, t('testimonials.err_rating')).max(5, t('testimonials.err_rating')),
        order: z.number({ invalid_type_error: t('common.err_number') }).int(t('common.err_number')),
        isActive: z.boolean(),
      }),
    [t]
  );
  type Values = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!isOpen) return;
    setServerError('');
    reset({
      name: item?.name ?? '',
      role: item?.role ?? '',
      text: item?.text ?? '',
      rating: item?.rating ?? 5,
      order: item?.order ?? 0,
      isActive: item?.isActive ?? true,
    });
  }, [isOpen, item, reset]);

  const onSubmit = async (v: Values) => {
    setServerError('');
    try {
      const res = item ? await adminApi.put(`/testimonials/admin/${item.id}`, v) : await adminApi.post('/testimonials/admin', v);
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
      title={item ? t('testimonials.modal_edit') : t('testimonials.modal_new')}
      entity={item?.name}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="testimonial-form" icon={Save} loading={isSubmitting}>
            {isSubmitting ? t('common.saving') : t('common.save')}
          </Button>
        </>
      }
    >
      <form id="testimonial-form" noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={t('common.name')} error={errors.name?.message} required>
            <Input autoComplete="off" {...register('name')} />
          </FormField>
          <FormField label={t('testimonials.role')} hint={t('testimonials.role_hint')} error={errors.role?.message}>
            <Input autoComplete="off" {...register('role')} />
          </FormField>
        </div>
        <FormField label={t('testimonials.text')} hint={t('testimonials.text_hint')} error={errors.text?.message} required>
          <Textarea rows={5} {...register('text')} />
        </FormField>
        <div className="grid items-start gap-4 sm:grid-cols-3">
          <FormField label={t('testimonials.rating')} error={errors.rating?.message}>
            <Input type="number" min={1} max={5} {...register('rating', { valueAsNumber: true })} />
          </FormField>
          <FormField label={t('common.order')} hint={t('faq.order_hint')} error={errors.order?.message}>
            <Input type="number" {...register('order', { valueAsNumber: true })} />
          </FormField>
          <Checkbox label={t('faq.active')} {...register('isActive')} className="sm:pt-10" />
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
