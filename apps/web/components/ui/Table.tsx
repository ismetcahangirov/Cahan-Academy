import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import OrnamentDivider from '../ornament/OrnamentDivider';

/**
 * Table — admin data tables: small-caps header, hairline rows, soft hover, numbers right-aligned (.num).
 * Scrolls inside its own frame on narrow screens; below 640px prefer rendering rows as <Card> list items.
 *
 * <Table caption={t('courses')}>
 *   <thead><tr><th>{t('name')}</th><th className="num">{t('price')}</th></tr></thead>
 *   <tbody>{rows.map((r) => <tr key={r.id}><td>{r.title}</td><td className="num">{r.price}</td></tr>)}</tbody>
 * </Table>
 */
export default function Table({
  caption,
  divider = false,
  className,
  tableClassName,
  children,
}: {
  caption?: string;
  divider?: boolean;
  className?: string;
  tableClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      {divider && <OrnamentDivider className="mb-4" />}
      {/* the frame scrolls on narrow screens: keyboard users must be able to focus it to scroll (WCAG 2.1.1) */}
      <div className="table-wrap custom-scrollbar" tabIndex={0} role="region" aria-label={caption}>
        <table className={cn('table-ornate', tableClassName)}>
          {caption && <caption className="sr-only">{caption}</caption>}
          {children}
        </table>
      </div>
    </div>
  );
}
