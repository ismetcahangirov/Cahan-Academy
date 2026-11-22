'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { AlertCircle, Save } from 'lucide-react';
import adminApi from '@/lib/adminApi';
import { Button, Checkbox, FormField, Input, Modal, Textarea } from '@/components/ui';
import { LangTabs, type Lang } from './AdminUI';
import { useFeedback } from '@/components/ui/Feedback';
import { apiMessage } from './utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  faqToEdit?: { id: string; question: Record<Lang, string>; answer: Record<Lang, string>; order: number; isActive: boolean } | null;
}

/** FAQ create / edit: question + answer in az / en / ru, order, visibility. */
export default function FaqModal({ isOpen, onClose, onSuccess, faqToEdit }: Props) {
  const t = useTranslations('admin');
  const { ok } = useFeedback();
  const [tab, setTab] = useState<Lang>('az');
  const [serverError, setServerError] = useState('');

  const schema = useMemo(
    () =>
      z.object({
        qAz: z.string().trim().min(1, t('faq.err_question_az')),
        qEn: z.string().trim().min(1, t('faq.err_question_en')),
        qRu: z.string().trim().min(1, t('faq.err_question_ru')),
        aAz: z.string().trim().min(1, t('faq.err_answer_az')),
        aEn: z.string().trim().min(1, t('faq.err_answer_en')),
        aRu: z.string().trim().min(1, t('faq.err_answer_ru')),
        order: z.number({ invalid_type_error: t('faq.err_order') }).int(t('faq.err_order')),
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
    setTab('az');
    const f = faqToEdit;
    reset({
      qAz: f?.question.az ?? '',
      qEn: f?.question.en ?? '',
      qRu: f?.question.ru ?? '',
      aAz: f?.answer.az ?? '',
      aEn: f?.answer.en ?? '',
      aRu: f?.answer.ru ?? '',
      order: f?.order ?? 0,
      isActive: f?.isActive ?? true,
    });
  }, [isOpen, faqToEdit, reset]);

  const keys = { az: ['qAz', 'aAz'], en: ['qEn', 'aEn'], ru: ['qRu', 'aRu'] } as const;
  const errorLangs = (['az', 'en', 'ru'] as Lang[]).filter((l) => keys[l].some((k) => errors[k]));
  const qKey = ({ az: 'qAz', en: 'qEn', ru: 'qRu' } as const)[tab];
  const aKey = ({ az: 'aAz', en: 'aEn', ru: 'aRu' } as const)[tab];

  const onInvalid = (errs: typeof errors) => {
    const first = (['az', 'en', 'ru'] as Lang[]).find((l) => keys[l].some((k) => errs[k]));
    if (first) setTab(first);
  };

  const onSubmit = async (v: Values) => {
    setServerError('');
    const body = {
      question: { az: v.qAz, en: v.qEn, ru: v.qRu },
      answer: { az: v.aAz, en: v.aEn, ru: v.aRu },
      order: v.order,
      isActive: v.isActive,
    };
    try {
      const res = faqToEdit ? await adminApi.put(`/faqs/admin/${faqToEdit.id}`, body) : await adminApi.post('/faqs/admin', body);
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
      title={faqToEdit ? t('faq.modal_edit') : t('faq.modal_new')}
      entity={faqToEdit?.question.az}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="faq-form" icon={Save} loading={isSubmitting}>
            {isSubmitting ? t('common.saving') : t('common.save')}
          </Button>
        </>
      }
    >
      <form id="faq-form" noValidate onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5">
        <LangTabs value={tab} onChange={setTab} errorLangs={errorLangs} />
        <FormField label={t('faq.question')} error={errors[qKey]?.message} required>
          <Input key={qKey} {...register(qKey)} />
        </FormField>
        <FormField label={t('faq.answer')} error={errors[aKey]?.message} required>
          <Textarea key={aKey} rows={5} {...register(aKey)} />
        </FormField>
        <div className="grid items-end gap-4 sm:grid-cols-2">
          <FormField label={t('faq.order')} hint={t('faq.order_hint')} error={errors.order?.message}>
            <Input type="number" {...register('order', { valueAsNumber: true })} />
          </FormField>
          <Checkbox label={t('faq.active')} {...register('isActive')} className="pb-3" />
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
