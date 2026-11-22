'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Mail, PenLine, RotateCcw, Send, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ApiError, submitContactForm } from '@/lib/api';
import { Button, FormField, Input, Textarea } from '@/components/ui';
import { OrnamentDivider, WaxSeal } from '@/components/ornament';

/**
 * ContactForm — `noValidate` + zod (messages from `contact.err_*`), inline errors under each field,
 * the API's own message in an icon + sentence banner when the request fails, and a sealed "thank you"
 * when it succeeds (focus moves to it). Limits mirror apps/api ContactSchema.
 */
export default function ContactForm() {
  const t = useTranslations('contact');
  const [sent, setSent] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, t('err_name')).max(255, t('err_too_long')),
        email: z.string().trim().min(1, t('err_email')).email(t('err_email')).max(255, t('err_too_long')),
        subject: z.string().trim().min(3, t('err_subject')).max(500, t('err_too_long')),
        message: z.string().trim().min(10, t('err_message')).max(5000, t('err_too_long')),
      }),
    [t]
  );
  type Values = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { name: '', email: '', subject: '', message: '' },
  });

  useEffect(() => {
    if (sent) doneRef.current?.focus();
  }, [sent]);

  const onSubmit = async (data: Values) => {
    setApiError(null);
    try {
      await submitContactForm(data);
      reset();
      setSent(true);
    } catch (error) {
      // 4xx carries a readable, localised API message (validation, rate limit); anything else is generic.
      const readable = error instanceof ApiError && error.status >= 400 && error.status < 500 && error.message;
      setApiError(readable || t('error'));
    }
  };

  if (sent) {
    return (
      <div role="status" className="orn-pop flex flex-col items-center px-2 py-8 text-center sm:py-12">
        <WaxSeal size={84} />
        <h3
          ref={doneRef}
          tabIndex={-1}
          className="script-title mt-5 text-[2.4rem] outline-none sm:text-[2.8rem]"
        >
          {t('success_title')}
        </h3>
        <OrnamentDivider className="mt-2" />
        <p className="mt-4 max-w-md text-[1.12rem] leading-relaxed text-ink">{t('success')}</p>
        <Button variant="outline" icon={RotateCcw} motif={false} className="mt-8" onClick={() => setSent(false)}>
          {t('send_another')}
        </Button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5" aria-describedby="contact-form-hint">
      <p id="contact-form-hint" className="sr-only">
        {t('form_hint')}
      </p>
      <div className="grid gap-5 md:grid-cols-2">
        <FormField label={t('name')} error={errors.name?.message} required>
          <Input icon={User} autoComplete="name" placeholder={t('ph_name')} {...register('name')} />
        </FormField>
        <FormField label={t('email')} error={errors.email?.message} required>
          <Input
            icon={Mail}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={t('ph_email')}
            {...register('email')}
          />
        </FormField>
      </div>
      <FormField label={t('subject')} error={errors.subject?.message} required>
        <Input icon={PenLine} placeholder={t('ph_subject')} {...register('subject')} />
      </FormField>
      <FormField label={t('message')} error={errors.message?.message} required>
        <Textarea rows={6} className="resize-y" placeholder={t('ph_message')} {...register('message')} />
      </FormField>

      {apiError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-[var(--radius-md)] border-[1.5px] border-accent-text bg-accent-soft px-4 py-3"
        >
          <AlertCircle size={20} strokeWidth={2} className="mt-0.5 shrink-0 text-accent-text" aria-hidden="true" />
          <p className="text-[1.02rem] leading-snug text-ink">
            <strong className="font-semibold">{t('error_title')}.</strong> {apiError}
          </p>
        </div>
      )}

      <Button type="submit" size="lg" block loading={isSubmitting} icon={Send}>
        {t('send')}
      </Button>
    </form>
  );
}
