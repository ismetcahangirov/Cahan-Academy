'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, Mail, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { subscribeNewsletter } from '@/lib/api';
import { FormField, Input } from '../ui/Field';
import Button from '../ui/Button';

/**
 * Footer newsletter: inline field + icon button, zod messages (noValidate, no browser bubbles),
 * success / error as icon + text (no green/red). Sits inside the wine footer (.theme-wine tokens).
 */
export default function FooterNewsletter() {
  const t = useTranslations('newsletter');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const schema = z.object({ email: z.string().trim().email(t('invalid_email')) });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }: z.infer<typeof schema>) => {
    setStatus('loading');
    try {
      await subscribeNewsletter(email);
      setStatus('success');
      reset();
    } catch {
      setStatus('error');
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm">
      <FormField label={<span className="sr-only">{t('placeholder')}</span>} error={errors.email?.message}>
        {(id, describedBy, invalid) => (
          <div className="relative">
            <Input
              id={id}
              type="email"
              autoComplete="email"
              icon={Mail}
              invalid={invalid}
              aria-describedby={describedBy}
              placeholder={t('placeholder')}
              className="pr-14"
              {...register('email')}
            />
            <Button
              type="submit"
              size="sm"
              iconOnly
              icon={Send}
              loading={status === 'loading'}
              aria-label={t('button')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2"
            />
          </div>
        )}
      </FormField>
      <p aria-live="polite" className="mt-2 min-h-[1.5rem] text-[0.95rem] text-ink-muted">
        {status === 'success' && (
          <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
            <Check size={15} strokeWidth={2} aria-hidden="true" />
            {t('success')}
          </span>
        )}
        {status === 'error' && <span className="font-semibold text-accent-text">{t('error')}</span>}
      </p>
    </form>
  );
}
