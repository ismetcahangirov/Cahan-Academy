'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLocale, useTranslations } from 'next-intl';
import { AlertCircle, Shield, ShieldAlert, Trash2, UserPlus } from 'lucide-react';
import adminApi from '@/lib/adminApi';
import { useAuth } from '@/context/AuthContext';
import { Button, Card, Checkbox, FormField, Input, Modal, StatusPill } from '@/components/ui';
import { DataView, PageHead, RowAction } from '@/components/admin/AdminUI';
import { useFeedback } from '@/components/ui/Feedback';
import { useAdminList } from '@/components/admin/useAdminList';
import { apiMessage, assertOk, fmtDate } from '@/components/admin/utils';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  isSuperAdmin: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const { user } = useAuth();
  const { confirm, ok } = useFeedback();
  const { items, setItems, loading, error, reload } = useAdminList<AdminUser>('/admin/users');
  const [modalOpen, setModalOpen] = useState(false);
  const [serverError, setServerError] = useState('');
  const isSuper = !!user?.isSuperAdmin;

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, t('users.err_name')),
        email: z.string().trim().min(1, t('login.err_email_required')).email(t('login.err_email_invalid')),
        password: z.string().min(6, t('users.err_password')),
        isSuperAdmin: z.boolean(),
      }),
    [t]
  );
  type Values = z.infer<typeof schema>;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: '', email: '', password: '', isSuperAdmin: false } });

  useEffect(() => {
    if (modalOpen) {
      reset({ name: '', email: '', password: '', isSuperAdmin: false });
      setServerError('');
    }
  }, [modalOpen, reset]);

  const onSubmit = async (v: Values) => {
    setServerError('');
    try {
      const { data } = await adminApi.post('/admin/users', v);
      assertOk(data);
      ok(data.message || t('common.created'));
      setModalOpen(false);
      void reload();
    } catch (e) {
      setServerError(apiMessage(e, t('users.create_error')));
    }
  };

  const askDelete = (a: AdminUser) =>
    confirm({
      title: t('confirm.delete_title'),
      entity: `${a.name} · ${a.email}`,
      message: t('users.delete_body'),
      confirmLabel: t('confirm.delete_action'),
      onConfirm: async () => {
        const { data } = await adminApi.delete(`/admin/users/${a.id}`);
        assertOk(data);
        setItems((prev) => prev.filter((x) => x.id !== a.id));
        ok(t('common.deleted'));
      },
    });

  return (
    <div>
      <PageHead
        title={t('users.title')}
        subtitle={t('users.subtitle', { count: items.length })}
        onRefresh={reload}
        loading={loading}
        actions={
          isSuper && (
            <Button icon={UserPlus} onClick={() => setModalOpen(true)}>
              {t('users.new')}
            </Button>
          )
        }
      />

      {user && !isSuper && (
        <Card className="mb-4 flex items-start gap-3 p-4">
          <ShieldAlert size={20} strokeWidth={1.6} aria-hidden="true" className="mt-0.5 shrink-0 text-accent-text" />
          <div>
            <h2 className="font-semibold">{t('users.viewer_title')}</h2>
            <p className="text-ink-muted">{t('users.viewer_text')}</p>
          </div>
        </Card>
      )}

      <DataView
        caption={t('users.title')}
        items={items}
        rowKey={(a) => a.id}
        loading={loading}
        error={error}
        onRetry={reload}
        empty={{ sketch: 'cap', title: t('users.empty_title'), description: t('users.empty_desc') }}
        columns={[
          { key: 'name', header: t('common.name'), cell: (a) => <span className="font-semibold">{a.name}</span> },
          { key: 'email', header: t('common.email'), cell: (a) => <span className="break-all">{a.email}</span> },
          {
            key: 'role',
            header: t('users.col_role'),
            cell: (a) =>
              a.isSuperAdmin ? (
                <StatusPill status="success" icon={Shield}>
                  {t('users.super_admin')}
                </StatusPill>
              ) : (
                <StatusPill status="neutral" icon={Shield}>
                  {t('users.admin')}
                </StatusPill>
              ),
          },
          { key: 'date', header: t('users.col_created'), cell: (a) => <span className="time-italic">{fmtDate(a.createdAt, locale)}</span> },
        ]}
        actions={
          isSuper
            ? (a) =>
                a.id === user?.id ? (
                  <span className="sc px-2 text-[0.8rem] tracking-[0.1em] text-ink-muted">{t('users.you')}</span>
                ) : (
                  <RowAction icon={Trash2} label={`${t('common.delete')}: ${a.name}`} onClick={() => askDelete(a)} />
                )
            : undefined
        }
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        size="sm"
        title={t('users.modal_new')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" form="user-form" loading={isSubmitting}>
              {isSubmitting ? t('users.creating') : t('common.create')}
            </Button>
          </>
        }
      >
        <form id="user-form" noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label={t('common.name')} error={errors.name?.message} required>
            <Input autoComplete="off" {...register('name')} />
          </FormField>
          <FormField label={t('common.email')} error={errors.email?.message} required>
            <Input type="email" autoComplete="off" {...register('email')} />
          </FormField>
          <FormField label={t('common.password')} hint={t('users.password_hint')} error={errors.password?.message} required>
            <Input type="password" autoComplete="new-password" {...register('password')} />
          </FormField>
          <Checkbox label={t('users.grant_super')} {...register('isSuperAdmin')} />
          {serverError && (
            <p role="alert" className="field-error">
              <AlertCircle aria-hidden="true" strokeWidth={2} />
              {serverError}
            </p>
          )}
        </form>
      </Modal>
    </div>
  );
}
