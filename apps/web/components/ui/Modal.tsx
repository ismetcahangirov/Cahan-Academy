'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import ScriptTitle from '../ornament/ScriptTitle';

/**
 * Modal — framed dialog (outer border + inner hairline), script title + divider, scale .98 -> 1 + fade
 * (CSS, transform/opacity only). Escape and backdrop close; body scroll locked; focus moves into the
 * panel, Tab / Shift+Tab stay inside, focus returns to the opener on close. Bottom sheet below 640px.
 * Use it instead of window.alert/confirm (off-palette browser chrome).
 *
 * <Modal open={open} onClose={close} title={t('enroll.title')} entity={course.title}
 *        footer={<><Button variant="ghost" onClick={close}>{t('common.cancel')}</Button>
 *                  <Button type="submit" form="enroll-form">{t('enroll.submit')}</Button></>}>
 *   <form id="enroll-form" noValidate onSubmit={…}>…</form>
 * </Modal>
 * Props: open, onClose, title (short fixed phrase, script), entity (serif data line), subtitle, footer,
 * size 'sm'|'md'|'lg'|'xl', className.
 */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const SIZES = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' } as const;

export default function Modal({
  open,
  onClose,
  title,
  entity,
  subtitle,
  children,
  footer,
  size = 'md',
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  entity?: string;
  subtitle?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const t = useTranslations('common');
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return undefined;
    const opener = document.activeElement;
    const onKey = (e: KeyboardEvent) => {
      const panel = panelRef.current;
      if (!panel) return;
      const active = document.activeElement;
      // a nested dialog opened on top owns the keyboard
      if (active && !panel.contains(active) && active.closest('[role="dialog"]')) return;
      if (e.key === 'Escape') {
        onCloseRef.current?.();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === active
      );
      if (!items.length) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (active === first || active === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !panel.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
      if (opener instanceof HTMLElement && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <div className="modal-backdrop orn-reveal" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title ? [title, entity].filter(Boolean).join(': ') : undefined}
        tabIndex={-1}
        className={cn(
          'modal-panel orn-pop relative z-[61] flex max-h-[92vh] w-full flex-col outline-none',
          'rounded-b-none sm:rounded-b-[var(--radius-xl)]',
          SIZES[size],
          className
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('close')}
          className="btn btn-ghost btn-icon btn-sm absolute right-4 top-4 z-10"
        >
          <X size={17} strokeWidth={1.6} aria-hidden="true" />
        </button>
        {title && (
          <div className="px-6 pb-2 pt-8 sm:px-8">
            <ScriptTitle as="h2" size="card" align="center" title={title} entity={entity} subtitle={subtitle} />
          </div>
        )}
        <div className="custom-scrollbar flex-1 overflow-y-auto px-6 py-4 sm:px-8">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line-hair px-6 py-4 sm:px-8">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
