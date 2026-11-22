import { Request } from 'express';

/** Express 5 types route params as `string | string[]`; our routes only use single segments. */
export const param = (req: Request, name: string): string => {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
};

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escape user input before it is interpolated into an HTML email. */
export const escapeHtml = (value: unknown): string =>
  String(value ?? '').replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);

/** Remove CR/LF and other control characters (header-injection guard for email subjects). */
export const singleLine = (value: unknown): string =>
  // eslint-disable-next-line no-control-regex
  String(value ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim();

/**
 * One CSV cell: quotes are doubled, the cell is always quoted, and values that a spreadsheet would
 * treat as a formula (=, +, -, @, tab, CR) are prefixed with an apostrophe (CSV/formula injection).
 */
export const csvCell = (value: unknown): string => {
  let s = value == null ? '' : value instanceof Date ? value.toISOString() : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export const toCsv = (rows: unknown[][]): string =>
  rows.map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
