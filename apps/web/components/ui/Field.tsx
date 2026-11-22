'use client';

import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  type ComponentPropsWithRef,
  type ReactElement,
  type ReactNode,
} from 'react';
import { AlertCircle, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Form fields: serif inputs (never script), token colours, 3px soft focus halo, and errors as a
 * 1.5px border + alert icon + bold message (no red). Forms use `noValidate` + zod messages — never the
 * browser's native validation bubbles (off-palette).
 *
 * <FormField label={t('email')} error={errors.email?.message} required>
 *   <Input type="email" icon={Mail} {...register('email')} />
 * </FormField>
 * A single <Input>/<Textarea>/<Select> (or native input/textarea/select) child is wired to the label (id)
 * and to the hint/error (aria-describedby) automatically. For anything else use the render prop:
 * <FormField label=…>{(id, describedBy, invalid) => <Custom id={id} aria-describedby={describedBy} />}</FormField>
 * Raw classes: .field, .field-label, .field-hint, .field-error, .check
 */
type FieldChild = ReactElement<{ id?: string; 'aria-describedby'?: string; invalid?: boolean }>;

export function Input({
  icon: Icon,
  invalid,
  className,
  wrapperClassName,
  ...props
}: ComponentPropsWithRef<'input'> & { icon?: LucideIcon; invalid?: boolean; wrapperClassName?: string }) {
  const input = (
    <input
      aria-invalid={invalid || props['aria-invalid'] || undefined}
      className={cn('field', Icon && 'field-icon', className)}
      {...props}
    />
  );
  if (!Icon) return input;
  return (
    <div className={cn('relative', wrapperClassName)}>
      <Icon
        aria-hidden="true"
        strokeWidth={1.6}
        className="pointer-events-none absolute left-3.5 top-1/2 h-[1.05rem] w-[1.05rem] -translate-y-1/2 text-ink-subtle"
      />
      {input}
    </div>
  );
}

export function Textarea({ invalid, className, ...props }: ComponentPropsWithRef<'textarea'> & { invalid?: boolean }) {
  return <textarea aria-invalid={invalid || undefined} className={cn('field', className)} {...props} />;
}

export function Select({
  invalid,
  className,
  children,
  ...props
}: ComponentPropsWithRef<'select'> & { invalid?: boolean }) {
  return (
    <select aria-invalid={invalid || undefined} className={cn('field', className)} {...props}>
      {children}
    </select>
  );
}

export function Checkbox({
  label,
  className,
  ...props
}: Omit<ComponentPropsWithRef<'input'>, 'type'> & { label: ReactNode }) {
  return (
    <label className={cn('inline-flex cursor-pointer items-center gap-2.5 text-[1rem] text-ink', className)}>
      <input type="checkbox" className="check" {...props} />
      {label}
    </label>
  );
}

const NATIVE = new Set(['input', 'textarea', 'select']);
const isFieldChild = (children: unknown): children is FieldChild =>
  typeof children !== 'function' &&
  Children.count(children as ReactNode) === 1 &&
  isValidElement(children) &&
  (NATIVE.has(children.type as string) || children.type === Input || children.type === Textarea || children.type === Select);

export function FormField({
  label,
  hint,
  error,
  required,
  htmlFor,
  className,
  children,
}: {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  children: ReactNode | ((id: string, describedBy: string | undefined, invalid: boolean) => ReactNode);
}) {
  const autoId = useId();
  const childId = isFieldChild(children) ? children.props.id : undefined;
  const id = htmlFor || childId || autoId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  let control: ReactNode;
  if (typeof children === 'function') {
    control = children(id, describedBy, Boolean(error));
  } else if (isFieldChild(children)) {
    const native = NATIVE.has(children.type as string);
    control = cloneElement(children, {
      id,
      'aria-describedby': [children.props['aria-describedby'], describedBy].filter(Boolean).join(' ') || undefined,
      ...(error ? (native ? { 'aria-invalid': true } : { invalid: true }) : null),
    } as Record<string, unknown>);
  } else {
    control = children;
  }

  return (
    <div className={cn('min-w-0', className)}>
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
      )}
      {control}
      {hint && !error && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field-error" role="alert">
          <AlertCircle aria-hidden="true" strokeWidth={2} />
          {error}
        </p>
      )}
    </div>
  );
}

export default FormField;
