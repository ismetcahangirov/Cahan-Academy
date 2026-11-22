'use client';

import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Search, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { isRealImage } from '@/lib/media';
import { Button, Card, EmptyState, Input, Skeleton, Table } from '@/components/ui';
import { ScriptTitle, type SketchName } from '@/components/ornament';

/**
 * Admin page building blocks (the "admin data page" recipe of docs/DESIGN.md).
 *
 * <PageHead title={t('courses.title')} subtitle={t('courses.subtitle', { count })} onRefresh={reload} loading={loading}
 *           actions={<Button icon={Plus}>{t('courses.new')}</Button>} />
 * <Toolbar value={q} onChange={setQ} placeholder={t('leads.search')} />
 * <DataView items rowKey columns actions loading error onRetry empty={{ sketch, title, description, action }} caption />
 * <StatCard label value icon />
 * <LangTabs value onChange errorLangs />      az / en / ru switch for the modal forms
 */

export function PageHead({
  title,
  subtitle,
  onRefresh,
  loading,
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  onRefresh?: () => void;
  loading?: boolean;
  actions?: ReactNode;
}) {
  const t = useTranslations('admin');
  return (
    <ScriptTitle
      className="mb-6"
      title={title}
      subtitle={subtitle}
      actions={
        <>
          {onRefresh && (
            <Button
              variant="ghost"
              iconOnly
              icon={RefreshCcw}
              onClick={onRefresh}
              disabled={loading}
              aria-label={t('common.refresh')}
              title={t('common.refresh')}
            />
          )}
          {actions}
        </>
      }
    />
  );
}

export function Toolbar({
  value,
  onChange,
  placeholder,
  label,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label?: string;
  children?: ReactNode;
}) {
  const t = useTranslations('admin');
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="min-w-0 flex-1 sm:max-w-md">
        <Input
          type="search"
          icon={Search}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={label ?? t('common.search')}
        />
      </div>
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, hint }: { label: string; value: ReactNode; icon: LucideIcon; hint?: string }) {
  return (
    <Card variant="ornate" className="relative p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="sc text-[0.85rem] tracking-[0.12em] text-ink-muted">{label}</p>
          <p className="num mt-2 text-[2.4rem] font-semibold leading-none text-ink">{value}</p>
          {hint && <p className="mt-2 text-[0.95rem] text-ink-muted">{hint}</p>}
        </div>
        <span className="hidden h-11 w-11 shrink-0 items-center sm:flex justify-center rounded-full border border-line bg-accent-soft text-accent-text">
          <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
        </span>
      </div>
    </Card>
  );
}

export interface Column<T> {
  key: string;
  header: string;
  cell: (item: T) => ReactNode;
  /** right-aligned lining numerals */
  num?: boolean;
  /** hide below lg (tables only; the card list always shows every column) */
  wide?: boolean;
}

export function DataView<T>({
  items,
  rowKey,
  columns,
  actions,
  loading,
  error,
  onRetry,
  empty,
  caption,
  rowClassName,
}: {
  items: T[];
  rowKey: (item: T) => string;
  columns: Column<T>[];
  /** row actions (ghost icon buttons) */
  actions?: (item: T) => ReactNode;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  empty: { sketch?: SketchName; title: string; description?: string; action?: ReactNode };
  caption: string;
  rowClassName?: (item: T) => string | undefined;
}) {
  const t = useTranslations('admin');

  if (loading && items.length === 0) {
    return (
      <Card className="p-5" aria-busy="true">
        <span className="sr-only" role="status">
          {t('common.loading')}
        </span>
        <div className="space-y-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="hidden h-4 w-1/4 sm:block" />
              <Skeleton className="ml-auto h-4 w-16" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error && items.length === 0) {
    return (
      <Card className="p-2">
        <EmptyState
          sketch="inkwell"
          title={t('common.load_error_title')}
          description={error}
          action={
            onRetry && (
              <Button variant="outline" icon={RefreshCcw} onClick={onRetry}>
                {t('common.retry')}
              </Button>
            )
          }
        />
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="p-2">
        <EmptyState sketch={empty.sketch ?? 'books'} title={empty.title} description={empty.description} action={empty.action} />
      </Card>
    );
  }

  return (
    <>
      {error && (
        <p role="alert" className="field-error mb-3">
          <AlertCircle aria-hidden="true" strokeWidth={2} />
          {error}
        </p>
      )}
      {/* table from 640px */}
      <Card className="hidden overflow-hidden sm:block">
        <Table caption={caption}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} scope="col" className={cn(c.num && 'num', c.wide && 'hidden lg:table-cell')}>
                  {c.header}
                </th>
              ))}
              {actions && (
                <th scope="col" className="num">
                  <span className="sr-only">{t('common.actions')}</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={rowKey(item)} className={rowClassName?.(item)}>
                {columns.map((c) => (
                  <td key={c.key} className={cn(c.num && 'num', c.wide && 'hidden lg:table-cell')}>
                    {c.cell(item)}
                  </td>
                ))}
                {actions && (
                  <td className="num">
                    <div className="flex items-center justify-end gap-1">{actions(item)}</div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {/* card list below 640px */}
      <ul className="space-y-3 sm:hidden" aria-label={caption}>
        {items.map((item) => (
          <li key={rowKey(item)}>
            <Card className={cn('p-4', rowClassName?.(item))}>
              <div className="min-w-0 text-[1.1rem] font-semibold">{columns[0].cell(item)}</div>
              <dl className="mt-3 space-y-2">
                {columns.slice(1).map((c) => (
                  // wraps the value under its label when both do not fit (no mid-word breaks at 390px)
                  <div key={c.key} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                    <dt className="sc text-[0.8rem] tracking-[0.1em] text-ink-muted">{c.header}</dt>
                    <dd className="ml-auto min-w-0 text-right [overflow-wrap:break-word]">{c.cell(item)}</dd>
                  </div>
                ))}
              </dl>
              {actions && <div className="mt-3 flex items-center justify-end gap-1 border-t border-line-hair pt-3">{actions(item)}</div>}
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Ghost icon button for a table row; always pass the label (tooltip + aria-label). */
export function RowAction({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button variant="ghost" size="sm" iconOnly icon={icon} aria-label={label} title={label} onClick={onClick} disabled={disabled} />
  );
}

/** Avatar / thumb for list rows: user photo in a small round frame, else a palette icon. */
/** Row thumbnail: a real uploaded photo, else the entity icon (missing / stock / mock images: lib/media). */
export function Thumb({ src, alt, icon: Icon }: { src?: string | null; alt: string; icon: LucideIcon }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-accent-soft text-accent-text">
      {isRealImage(src) ? (
        // user photo: exempt from the colour audit, plain <img> so any host works
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} data-user-image className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <Icon size={18} strokeWidth={1.6} aria-hidden="true" />
      )}
    </span>
  );
}

export type Lang = 'az' | 'en' | 'ru';
export const LANGS: Lang[] = ['az', 'en', 'ru'];

/** az / en / ru switch for the modal forms: a tablist with arrow-key navigation; an alert icon marks tabs with errors. */
export function LangTabs({ value, onChange, errorLangs = [] }: { value: Lang; onChange: (l: Lang) => void; errorLangs?: Lang[] }) {
  const t = useTranslations('admin');
  const uid = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = LANGS.indexOf(value);
    let next = -1;
    if (e.key === 'ArrowRight') next = (i + 1) % LANGS.length;
    if (e.key === 'ArrowLeft') next = (i + LANGS.length - 1) % LANGS.length;
    if (next < 0) return;
    e.preventDefault();
    onChange(LANGS[next]);
    refs.current[LANGS[next]]?.focus();
  };
  return (
    <div role="tablist" aria-label={t('common.tabs_label')} className="flex max-w-full gap-1 rounded-full border border-line bg-surface-2 p-1 sm:inline-flex">
      {LANGS.map((l) => {
        const active = l === value;
        return (
          <button
            key={l}
            ref={(el) => {
              refs.current[l] = el;
            }}
            id={`${uid}-${l}`}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onKeyDown={onKey}
            onClick={() => onChange(l)}
            aria-label={`${t(`common.lang_${l}`)}${errorLangs.includes(l) ? ' ' + t('common.tab_has_errors') : ''}`}
            className={cn('btn btn-sm min-w-0 flex-1 px-2 sm:flex-none sm:px-4', active ? 'btn-primary' : 'btn-ghost')}
          >
            <span aria-hidden="true" className="sm:hidden">{l.toUpperCase()}</span>
            <span aria-hidden="true" className="hidden sm:inline">{t(`common.lang_${l}`)}</span>
            {errorLangs.includes(l) && (
              <>
                <AlertCircle size={14} strokeWidth={2} aria-hidden="true" />
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
