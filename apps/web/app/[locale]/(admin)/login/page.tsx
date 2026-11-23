'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { AlertCircle, ArrowLeft, Eye, EyeOff, KeyRound, Mail } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { useAuth } from '@/context/AuthContext';
import adminApi from '@/lib/adminApi';
import { BrandLogo, BrandLockup } from '@/components/brand';
import { EdelweissCorner, OrnamentDivider, ScriptTitle } from '@/components/ornament';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import ThemeToggle from '@/components/layout/ThemeToggle';
import { Button, FormField, Input } from '@/components/ui';
import { apiMessage } from '@/components/admin/utils';

/**
 * Admin login — the reference composition at admin scale: a wine panel (edelweiss corners,
 * the brand) beside a parchment form. Below lg the panel collapses into a short band above the form.
 * Inline zod errors (noValidate), the API message shown in the form, no native validation bubbles.
 */
export default function LoginPage() {
  const t = useTranslations('admin');
  const router = useRouter();
  const { login, user, isLoading: authLoading } = useAuth();
  const [serverError, setServerError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().trim().min(1, t('login.err_email_required')).email(t('login.err_email_invalid')),
        password: z.string().min(1, t('login.err_password_required')),
      }),
    [t]
  );
  type Values = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

  useEffect(() => {
    if (!authLoading && user) router.replace('/dashboard');
  }, [user, authLoading, router]);

  const onSubmit = async (values: Values) => {
    setServerError('');
    try {
      const { data } = await adminApi.post('/auth/login', values);
      if (data.success) {
        login(data.data.accessToken, data.data.user);
        router.push('/dashboard');
      } else {
        setServerError(data.message || t('login.err_failed'));
      }
    } catch (err) {
      setServerError(apiMessage(err, t('login.err_generic')));
    }
  };

  return (
    <div className="grid min-h-screen bg-page lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      {/* wine panel = banner landmark; the form side is <main> (axe landmark-one-main / region) */}
      <header className="theme-wine hero-wine relative flex flex-col items-center justify-center overflow-hidden px-6 py-10 text-center lg:min-h-screen lg:py-16">
        <EdelweissCorner corner="tl" priority onWine className="absolute left-0 top-0 w-24 sm:w-32 lg:w-40" />
        <EdelweissCorner corner="br" priority onWine delay={260} className="absolute bottom-0 right-0 hidden w-32 lg:block lg:w-40" />

        <div className="relative z-[1] flex flex-col items-center">
          <BrandLogo title="Cahan Academy" className="hidden h-36 w-auto text-accent-text lg:block xl:h-44" />
          <BrandLockup title="Cahan Academy" className="h-9 w-auto text-accent-text lg:hidden" />
          <p className="font-script mt-4 text-[2.4rem] leading-none text-ink lg:mt-8 lg:text-[3.2rem]">{t('login.panel_title')}</p>
          <OrnamentDivider draw={false} className="mt-1" />
          <p className="mt-2 hidden max-w-xs text-[1.05rem] text-ink-muted lg:block">{t('login.panel_text')}</p>
        </div>
      </header>

      {/* parchment form */}
      <main id="main" className="paper relative flex flex-col px-4 py-8 sm:px-8">
        <div className="flex items-center justify-between gap-2">
          <Link href="/" className="btn btn-ghost btn-sm gap-1.5 text-accent-text">
            <ArrowLeft size={16} strokeWidth={1.6} aria-hidden="true" />
            {t('login.back')}
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-8">
          <ScriptTitle as="h1" size="page" align="center" title={t('login.title')} subtitle={t('login.subtitle')} />

          <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" aria-describedby={serverError ? 'login-error' : undefined}>
            {serverError && (
              <p
                id="login-error"
                role="alert"
                className="flex items-start gap-2 rounded-[var(--radius-md)] border-[1.5px] border-accent-text bg-surface px-4 py-3 font-semibold text-accent-text"
              >
                <AlertCircle size={18} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0" />
                {serverError}
              </p>
            )}

            <FormField label={t('login.email')} error={errors.email?.message} required>
              <Input type="email" icon={Mail} autoComplete="username" inputMode="email" {...register('email')} />
            </FormField>

            <FormField label={t('login.password')} error={errors.password?.message} required>
              {(id, describedBy, invalid) => (
                <div className="relative">
                  <KeyRound
                    aria-hidden="true"
                    strokeWidth={1.6}
                    className="pointer-events-none absolute left-3.5 top-1/2 h-[1.05rem] w-[1.05rem] -translate-y-1/2 text-ink-subtle"
                  />
                  <input
                    id={id}
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    aria-describedby={describedBy}
                    aria-invalid={invalid || undefined}
                    className="field field-icon pr-12"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-pressed={showPw}
                    aria-label={showPw ? t('login.hide_password') : t('login.show_password')}
                    className="btn btn-ghost btn-icon btn-sm absolute right-1.5 top-1/2 -translate-y-1/2"
                  >
                    {showPw ? <EyeOff size={17} strokeWidth={1.6} aria-hidden="true" /> : <Eye size={17} strokeWidth={1.6} aria-hidden="true" />}
                  </button>
                </div>
              )}
            </FormField>

            <Button type="submit" block size="lg" loading={isSubmitting}>
              {isSubmitting ? t('login.submitting') : t('login.submit')}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
