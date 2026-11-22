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
import { BrandMark } from '@/components/brand';
import { EdelweissCorner, ScriptTitle } from '@/components/ornament';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import ThemeToggle from '@/components/layout/ThemeToggle';
import { Button, FormField, Input } from '@/components/ui';
import { apiMessage } from '@/components/admin/utils';
import { cn } from '@/lib/utils';

/** the four edelweiss clusters (same sizes as the dashboard's auth pages) */
const CORNER_SIZE = 'w-20 sm:w-28 lg:w-36';
/** small bordered pills for the language menu + theme toggle (the dashboard's auth look) */
const PILL =
  '[--btn-h:2.15rem] border-line-strong bg-surface text-ink-muted hover:border-ornament-soft hover:bg-surface hover:text-ink';

/**
 * Admin login — the dashboard's auth composition: the flat paper colour with a soft parchment hint, the brand
 * mark (no wordmark) as a faint full-height watermark, a small edelweiss cluster in every corner, and the form
 * centred straight on the page (no card, frame, seal, lace or ribbon). Language menu + theme toggle sit top
 * centre (banner); the form column is <main>. Inline zod errors (noValidate), the API message shown in the
 * form, no native validation bubbles. Fits one screen at 1440x900.
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
    <div className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden bg-paper px-4 py-16 sm:px-6">
      {/* background (follows the page theme) */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        {/* parchment texture, toned down to a soft hint */}
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'var(--tex-paper)', backgroundSize: '512px 512px' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          {/* dark: the dashboard uses white at 10%, but white over the wine-black paper leaves the colour law's tone
              line (color-audit); wine at 35% over #170004 stays on it and reads about as faint */}
          <BrandMark
            title=""
            className="w-auto max-w-none shrink-0 translate-x-[6vw] text-wine opacity-[0.13] dark:opacity-[0.35]"
            style={{ height: '100vh' }}
          />
        </div>
        <EdelweissCorner corner="tl" className={cn('absolute left-0 top-0', CORNER_SIZE)} />
        <EdelweissCorner corner="tr" className={cn('absolute right-0 top-0', CORNER_SIZE)} />
        <EdelweissCorner corner="bl" className={cn('absolute bottom-0 left-0', CORNER_SIZE)} />
        <EdelweissCorner corner="br" className={cn('absolute bottom-0 right-0', CORNER_SIZE)} />
      </div>

      {/* banner: language menu + theme toggle, top centre, clear of the corner ornaments */}
      <header className="absolute left-1/2 top-5 z-30 flex -translate-x-1/2 items-center gap-2">
        <LanguageSwitcher align="left" buttonClassName={cn(PILL, 'px-3.5')} />
        <ThemeToggle className={PILL} />
      </header>

      {/* the form, centred on the page (no card, frame or seal) */}
      <main id="main" className="relative w-full max-w-[37rem] px-4 py-8 sm:px-24">
        <div className="mx-auto w-full max-w-[22rem]">
          <ScriptTitle as="h1" size="page" align="center" className="orn-rise" title={t('login.title')} subtitle={t('login.subtitle')} />

          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="orn-rise mt-8 space-y-5"
            aria-describedby={serverError ? 'login-error' : undefined}
          >
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

            <Button type="submit" block size="lg" loading={isSubmitting} motif>
              {isSubmitting ? t('login.submitting') : t('login.submit')}
            </Button>
          </form>

          <p className="mt-8 text-center">
            <Link href="/" className="link inline-flex items-center gap-1.5 text-[0.98rem]">
              <ArrowLeft size={15} strokeWidth={1.6} aria-hidden="true" />
              {t('login.back')}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
