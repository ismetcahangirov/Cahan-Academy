'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { Toaster, toast, type ToastOptions } from 'react-hot-toast';
import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button, Modal } from '@/components/ui';
import { apiMessage } from './utils';

/**
 * Admin feedback layer: palette-styled toasts + an in-app confirm dialog (replaces window.alert /
 * window.confirm, finding A-44). Mounted once by <AdminShell>.
 *
 *   const { confirm, ok, fail } = useAdminFeedback();
 *   confirm({
 *     title: t('confirm.delete_title'),               // short script phrase
 *     entity: course.title,                           // serif line (the thing being deleted)
 *     message: t('confirm.delete_body'),
 *     confirmLabel: t('confirm.delete_action'),
 *     onConfirm: async () => { await adminApi.delete(...); },   // throws -> the message stays IN the dialog
 *   });
 *   ok(t('common.deleted'));  fail(apiMessage(err, t('common.save_error')));
 *
 * Toasts keep the colour law: surface + hairline border; success/error differ by icon shape and text,
 * never by green/red (react-hot-toast's default icon colours are overridden).
 */
const toastOptions: ToastOptions = {
  duration: 4200,
  className: 'toast-ornate',
  style: {
    background: 'var(--surface)',
    color: 'var(--ink)',
    border: '1px solid var(--line-strong)',
    boxShadow: 'var(--shadow-md)',
    maxWidth: '420px',
    fontFamily: 'var(--font-serif)',
    fontSize: '1rem',
  },
  success: { iconTheme: { primary: 'var(--accent-text)', secondary: 'var(--surface)' } },
  error: {
    iconTheme: { primary: 'var(--accent-text)', secondary: 'var(--surface)' },
    style: {
      background: 'var(--surface)',
      color: 'var(--ink)',
      border: '1.5px solid var(--accent-text)',
      boxShadow: 'var(--shadow-md)',
      maxWidth: '420px',
      fontWeight: 600,
    },
  },
};

export interface ConfirmOptions {
  title: string;
  entity?: string;
  message: ReactNode;
  confirmLabel: string;
  /** destructive (default true): heavy outline + alert icon */
  danger?: boolean;
  onConfirm: () => Promise<unknown> | unknown;
}

interface Ctx {
  confirm: (o: ConfirmOptions) => void;
  ok: (msg: string) => void;
  fail: (msg: string) => void;
}

const FeedbackContext = createContext<Ctx | null>(null);

export function useAdminFeedback(): Ctx {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useAdminFeedback must be used inside <AdminFeedbackProvider>');
  return ctx;
}

export function AdminFeedbackProvider({ children }: { children: ReactNode }) {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const busyRef = useRef(false);

  const confirm = useCallback((o: ConfirmOptions) => {
    setError('');
    setOpts(o);
  }, []);
  const ok = useCallback((msg: string) => void toast.success(msg), []);
  const fail = useCallback((msg: string) => void toast.error(msg), []);

  const close = () => {
    if (busyRef.current) return;
    setOpts(null);
    setError('');
  };

  const run = async () => {
    if (!opts || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError('');
    try {
      await opts.onConfirm();
      busyRef.current = false;
      setOpts(null);
    } catch (e) {
      busyRef.current = false;
      setError(apiMessage(e, t('common.delete_error')));
    } finally {
      setBusy(false);
    }
  };

  const value = useMemo(() => ({ confirm, ok, fail }), [confirm, ok, fail]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <Modal
        open={!!opts}
        onClose={close}
        size="sm"
        title={opts?.title}
        entity={opts?.entity}
        footer={
          <>
            <Button variant="ghost" onClick={close} disabled={busy}>
              {tc('cancel')}
            </Button>
            <Button variant={opts?.danger === false ? 'primary' : 'danger'} onClick={run} loading={busy}>
              {opts?.confirmLabel}
            </Button>
          </>
        }
      >
        <p className="text-center text-[1.05rem] text-ink-muted">{opts?.message}</p>
        {error && (
          <p role="alert" className="field-error mt-4 justify-center">
            <AlertCircle aria-hidden="true" strokeWidth={2} />
            {error}
          </p>
        )}
      </Modal>
      <Toaster position="top-right" toastOptions={toastOptions} containerStyle={{ top: 72 }} />
    </FeedbackContext.Provider>
  );
}
