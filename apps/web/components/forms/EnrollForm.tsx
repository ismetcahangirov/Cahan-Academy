'use client';

import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle, Mail, Phone, Send, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ApiError, submitEnrollForm } from '@/lib/api';
import { Button, FormField, Input } from '@/components/ui';
import OrnamentDivider from '@/components/ornament/OrnamentDivider';
import WaxSeal from '@/components/ornament/WaxSeal';

/**
 * EnrollForm — course enrolment request (POST /api/leads). Used inline on the course page and inside
 * <EnrollButton>'s modal.
 * - `noValidate` + zod messages from `messages/*.json` (enroll.err_*), shown inline under each field
 *   (FormField: border + icon + bold text, no red); focus goes to the first invalid field.
 * - API errors are shown as an icon + sentence: the API's own message for validation (400), a
 *   localized rate-limit sentence (429), otherwise a generic localized error.
 * - Success = wax seal + short script line + sentence; "send another" resets the form.
 * The course is not an editable field: the title shown above the form is what is sent.
 * Props (unchanged): courseTitle, courseId, onSuccess (called right after a successful submit).
 */
interface EnrollFormProps {
  courseTitle: string;
  courseId: string;
  onSuccess?: () => void;
}

export default function EnrollForm({ courseTitle, courseId, onSuccess }: EnrollFormProps) {
  const t = useTranslations('enroll');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [apiMessage, setApiMessage] = useState('');
  const successRef = useRef<HTMLDivElement>(null);

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, t('err_name')).max(255, t('err_name')),
        email: z.string().trim().email(t('err_email')).max(255, t('err_email')),
        phone: z
          .string()
          .trim()
          .min(7, t('err_phone'))
          .max(50, t('err_phone'))
          .regex(/^[+()\d\s-]+$/, t('err_phone')),
      }),
    [t]
  );
  type Values = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: '', email: '', phone: '' } });

  const onSubmit = async (data: Values) => {
    setStatus('idle');
    setApiMessage('');
    try {
      await submitEnrollForm({ ...data, course: courseTitle });
      setStatus('success');
      reset();
      onSuccess?.();
      requestAnimationFrame(() => successRef.current?.focus());
    } catch (error: unknown) {
      setStatus('error');
      if (error instanceof ApiError && error.status === 429) setApiMessage(t('error_rate'));
      else if (error instanceof ApiError && error.status === 400 && error.message) setApiMessage(error.message);
      else setApiMessage(t('error'));
    }
  };

  if (status === 'success') {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="orn-pop flex flex-col items-center px-2 py-6 text-center outline-none"
        data-course-id={courseId}
      >
        <WaxSeal size={92} />
        <p className="font-script mt-4 text-[2.4rem] leading-none text-accent-text dark:text-ink">{t('success_title')}</p>
        <OrnamentDivider className="mt-3" />
        <p className="mt-4 max-w-sm text-[1.08rem] leading-relaxed text-ink">{t('success')}</p>
        <Button variant="outline" size="sm" className="mt-6" onClick={() => setStatus('idle')}>
          {t('success_again')}
        </Button>
      </div>
    );
  }

  const invalidCount = Object.keys(errors).length;

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5" aria-describedby={status === 'error' ? 'enroll-api-error' : undefined}>
      <FormField label={t('name')} error={errors.name?.message} required>
        <Input icon={User} autoComplete="name" placeholder={t('name_placeholder')} {...register('name')} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label={t('email')} error={errors.email?.message} required>
          <Input
            icon={Mail}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={t('email_placeholder')}
            {...register('email')}
          />
        </FormField>
        <FormField label={t('phone')} error={errors.phone?.message} hint={t('phone_hint')} required>
          <Input
            icon={Phone}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={t('phone_placeholder')}
            {...register('phone')}
          />
        </FormField>
      </div>

      {status === 'error' && apiMessage && (
        <div
          id="enroll-api-error"
          role="alert"
          className="orn-rise flex items-start gap-2.5 rounded-[var(--radius-md)] border-[1.5px] border-accent-text bg-accent-soft px-4 py-3 text-[1rem] font-semibold leading-snug text-ink"
        >
          <AlertCircle aria-hidden="true" size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-accent-text" />
          <span>{apiMessage}</span>
        </div>
      )}

      {isSubmitted && invalidCount > 0 && (
        <p className="flex items-center gap-2 text-[0.95rem] text-ink-muted">
          <AlertCircle aria-hidden="true" size={16} strokeWidth={1.8} className="shrink-0 text-accent-text" />
          {t('errors_summary')}
        </p>
      )}

      <Button type="submit" size="lg" block loading={isSubmitting} iconAfter={Send}>
        {t('submit')}
      </Button>
    </form>
  );
}
