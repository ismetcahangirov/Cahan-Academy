'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { AlertCircle, KeyRound, Save, User as UserIcon } from 'lucide-react';
import adminApi from '@/lib/adminApi';
import { useAuth } from '@/context/AuthContext';
import { Button, FormField, Input, Card, CardHeader } from '@/components/ui';
import { ScriptTitle } from '@/components/ornament';
import { useAdminFeedback } from '@/components/admin/feedback';
import { apiMessage, assertOk } from '@/components/admin/utils';

export default function SettingsPage() {
  const t = useTranslations('admin');
  const { user, updateUser, logout } = useAuth();
  const { ok } = useAdminFeedback();
  const [profileError, setProfileError] = useState('');
  const [pwError, setPwError] = useState('');

  const profileSchema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, t('users.err_name')),
        email: z.string().trim().min(1, t('login.err_email_required')).email(t('login.err_email_invalid')),
      }),
    [t]
  );
  const pwSchema = useMemo(
    () =>
      z
        .object({
          oldPassword: z.string().min(1, t('settings.err_old')),
          newPassword: z.string().min(6, t('users.err_password')),
          confirmPassword: z.string().min(1, t('settings.err_confirm')),
        })
        .refine((v) => v.newPassword === v.confirmPassword, { path: ['confirmPassword'], message: t('settings.err_mismatch') }),
    [t]
  );

  const profile = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  });
  const pw = useForm<z.infer<typeof pwSchema>>({
    resolver: zodResolver(pwSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  const saveProfile = async (v: z.infer<typeof profileSchema>) => {
    setProfileError('');
    try {
      const { data } = await adminApi.put('/admin/profile', v);
      assertOk(data);
      ok(data.message || t('common.saved'));
      updateUser(data.data);
      profile.reset(v);
    } catch (e) {
      setProfileError(apiMessage(e, t('settings.profile_error')));
    }
  };

  const savePassword = async (v: z.infer<typeof pwSchema>) => {
    setPwError('');
    try {
      const { data } = await adminApi.put('/admin/profile/password', { oldPassword: v.oldPassword, newPassword: v.newPassword });
      assertOk(data);
      ok(data.message || t('settings.password_changed'));
      // changing the password revokes the session: sign out shortly after
      setTimeout(() => void logout(), 1500);
    } catch (e) {
      setPwError(apiMessage(e, t('settings.password_error')));
    }
  };

  const err = (msg: string, id: string) =>
    msg && (
      <p id={id} role="alert" className="field-error">
        <AlertCircle aria-hidden="true" strokeWidth={2} />
        {msg}
      </p>
    );

  const unchanged = !profile.formState.isDirty;

  return (
    <div>
      <ScriptTitle className="mb-6" title={t('settings.title')} subtitle={t('settings.subtitle')} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="paper" className="p-5 sm:p-6">
          <CardHeader title={t('settings.profile_title')} subtitle={t('settings.profile_subtitle')} actions={<UserIcon size={20} strokeWidth={1.6} aria-hidden="true" className="text-ornament" />} />
          <form noValidate onSubmit={profile.handleSubmit(saveProfile)} className="mt-5 space-y-4">
            <FormField label={t('common.name')} error={profile.formState.errors.name?.message} required>
              <Input autoComplete="name" {...profile.register('name')} />
            </FormField>
            <FormField label={t('common.email')} error={profile.formState.errors.email?.message} required>
              <Input type="email" autoComplete="email" {...profile.register('email')} />
            </FormField>
            {err(profileError, 'profile-error')}
            <Button type="submit" icon={Save} loading={profile.formState.isSubmitting} disabled={unchanged}>
              {profile.formState.isSubmitting ? t('common.saving') : t('settings.save_profile')}
            </Button>
          </form>
        </Card>

        <Card variant="paper" className="p-5 sm:p-6">
          <CardHeader title={t('settings.security_title')} subtitle={t('settings.security_subtitle')} actions={<KeyRound size={20} strokeWidth={1.6} aria-hidden="true" className="text-ornament" />} />
          <form noValidate onSubmit={pw.handleSubmit(savePassword)} className="mt-5 space-y-4">
            <FormField label={t('settings.old_password')} error={pw.formState.errors.oldPassword?.message} required>
              <Input type="password" autoComplete="current-password" {...pw.register('oldPassword')} />
            </FormField>
            <FormField label={t('settings.new_password')} hint={t('users.password_hint')} error={pw.formState.errors.newPassword?.message} required>
              <Input type="password" autoComplete="new-password" {...pw.register('newPassword')} />
            </FormField>
            <FormField label={t('settings.confirm_password')} error={pw.formState.errors.confirmPassword?.message} required>
              <Input type="password" autoComplete="new-password" {...pw.register('confirmPassword')} />
            </FormField>
            {err(pwError, 'pw-error')}
            <Button type="submit" icon={Save} loading={pw.formState.isSubmitting}>
              {pw.formState.isSubmitting ? t('settings.changing') : t('settings.change_password')}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
