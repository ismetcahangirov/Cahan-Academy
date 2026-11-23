'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { AlertCircle, Clock, Link2, MapPin, Phone, Save } from 'lucide-react';
import adminApi, { refreshSite } from '@/lib/adminApi';
import { Button, Card, CardHeader, EmptyState, FormField, Input, Skeleton, Textarea } from '@/components/ui';
import { PageHead, LangTabs, LANGS, type Lang } from '@/components/admin/AdminUI';
import { useFeedback } from '@/components/ui/Feedback';
import { apiMessage, assertOk } from '@/components/admin/utils';

type L3 = Record<Lang, string>;
interface Contact {
  phone: string;
  email: string;
  address: L3;
  hours: L3;
  social: { instagram: string; facebook: string; youtube: string };
}

/**
 * Site details: the phone, e-mail, address, opening hours and social links shown in the footer, the closing CTA,
 * the contact page, the legal pages and the site's structured data. Saved changes reach the site within 5 minutes.
 */
export default function SiteDetailsPage() {
  const t = useTranslations('admin');
  const { ok } = useFeedback();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [serverError, setServerError] = useState('');
  const [tab, setTab] = useState<Lang>('az');

  const schema = useMemo(() => {
    const req = (msg: string) => z.string().trim().min(1, msg);
    const link = z
      .string()
      .trim()
      .refine((v) => v === '' || /^https:\/\/\S+$/.test(v), t('site.err_link'));
    return z.object({
      phone: z.string().trim().min(5, t('site.err_phone')).regex(/^\+?[\d\s()-]+$/, t('site.err_phone')),
      email: z.string().trim().min(1, t('login.err_email_required')).email(t('login.err_email_invalid')),
      address: z.object({ az: req(t('site.err_address')), en: req(t('site.err_address')), ru: req(t('site.err_address')) }),
      hours: z.object({ az: req(t('site.err_hours')), en: req(t('site.err_hours')), ru: req(t('site.err_hours')) }),
      social: z.object({ instagram: link, facebook: link, youtube: link }),
    });
  }, [t]);
  type Values = z.infer<typeof schema>;

  const { register, handleSubmit, reset, formState } = useForm<Values>({ resolver: zodResolver(schema) });
  const { errors, isSubmitting, isDirty } = formState;

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const { data } = await adminApi.get('/settings/contact');
      assertOk(data);
      reset(data.data as Contact);
    } catch (e) {
      setLoadError(apiMessage(e, t('common.load_error')));
    } finally {
      setLoading(false);
    }
  }, [reset, t]);

  useEffect(() => {
    load();
  }, [load]);

  const errorLangs = LANGS.filter((l) => errors.address?.[l] || errors.hours?.[l]);

  const onInvalid = (errs: typeof errors) => {
    const first = LANGS.find((l) => errs.address?.[l] || errs.hours?.[l]);
    if (first) setTab(first);
  };

  const onSubmit = async (v: Values) => {
    setServerError('');
    try {
      const { data } = await adminApi.put('/settings/admin/contact', v);
      assertOk(data);
      reset(data.data as Contact);
      await refreshSite(['site-settings']);
      ok(t('site.saved'));
    } catch (e) {
      setServerError(apiMessage(e, t('common.save_error')));
    }
  };

  return (
    <div>
      <PageHead title={t('site.title')} subtitle={t('site.subtitle')} onRefresh={load} loading={loading} />

      {loading ? (
        <Card className="space-y-4 p-5" aria-busy="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </Card>
      ) : loadError ? (
        <Card className="p-2">
          <EmptyState
            sketch="inkwell"
            title={t('common.load_error_title')}
            description={loadError}
            action={
              <Button variant="outline" onClick={load}>
                {t('common.retry')}
              </Button>
            }
          />
        </Card>
      ) : (
        <form noValidate onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card variant="paper" className="p-5 sm:p-6">
              <CardHeader as="h2" title={t('site.contact_title')} subtitle={t('site.contact_subtitle')} actions={<Phone size={20} strokeWidth={1.6} aria-hidden="true" className="text-ornament" />} />
              <div className="mt-5 space-y-4">
                <FormField label={t('common.phone')} hint={t('site.phone_hint')} error={errors.phone?.message} required>
                  <Input type="tel" inputMode="tel" autoComplete="off" {...register('phone')} />
                </FormField>
                <FormField label={t('common.email')} error={errors.email?.message} required>
                  <Input type="email" autoComplete="off" {...register('email')} />
                </FormField>
              </div>
            </Card>

            <Card variant="paper" className="p-5 sm:p-6">
              <CardHeader as="h2" title={t('site.social_title')} subtitle={t('site.social_subtitle')} actions={<Link2 size={20} strokeWidth={1.6} aria-hidden="true" className="text-ornament" />} />
              <div className="mt-5 space-y-4">
                {(['instagram', 'facebook', 'youtube'] as const).map((k) => (
                  <FormField key={k} label={t(`site.${k}`)} error={errors.social?.[k]?.message}>
                    <Input type="url" inputMode="url" placeholder="https://" {...register(`social.${k}`)} />
                  </FormField>
                ))}
              </div>
            </Card>
          </div>

          <Card variant="paper" className="p-5 sm:p-6">
            <CardHeader as="h2" title={t('site.place_title')} subtitle={t('common.three_langs')} actions={<MapPin size={20} strokeWidth={1.6} aria-hidden="true" className="text-ornament" />} />
            <div className="mt-5 space-y-4">
              <LangTabs value={tab} onChange={setTab} errorLangs={errorLangs} />
              <FormField label={t('site.address')} error={errors.address?.[tab]?.message} required>
                <Input key={`address-${tab}`} lang={tab} {...register(`address.${tab}`)} />
              </FormField>
              <FormField label={t('site.hours')} hint={t('site.hours_hint')} error={errors.hours?.[tab]?.message} required>
                <Textarea key={`hours-${tab}`} lang={tab} rows={3} {...register(`hours.${tab}`)} />
              </FormField>
              <p className="flex items-center gap-2 text-[0.95rem] text-ink-muted">
                <Clock size={15} strokeWidth={1.6} aria-hidden="true" className="shrink-0 text-ornament" />
                {t('site.delay_note')}
              </p>
            </div>
          </Card>

          {serverError && (
            <p role="alert" className="field-error">
              <AlertCircle aria-hidden="true" strokeWidth={2} />
              {serverError}
            </p>
          )}
          <Button type="submit" icon={Save} loading={isSubmitting} disabled={!isDirty}>
            {isSubmitting ? t('common.saving') : t('common.save')}
          </Button>
        </form>
      )}
    </div>
  );
}
