import { useId, type ComponentProps, type ReactNode } from 'react';
import { StatusIcon } from './StatusIcon';

type Props = ComponentProps<'input'> & {
  label: string;
  hint?: string; // plain-language help shown under the label
  error?: string; // inline error message
  endSlot?: ReactNode; // something inside the right edge of the field (e.g. Show/Hide password)
};

/**
 * Accessible text field.
 *  - A visible <label> is tied to the input (htmlFor/id), never a placeholder-only label.
 *  - Hint and error text are linked with aria-describedby, so screen readers read them with the field.
 *  - aria-invalid tells assistive tech the field has a problem.
 *  - Pass autoComplete, type, etc. straight through (e.g. autoComplete="email").
 *  - Give it an `id` when something else (like the error summary) needs to point at it.
 */
export function FormField({ label, hint, error, endSlot, className = '', id: idProp, ...inputProps }: Props) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-bold text-ink">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={
            'min-h-11 w-full rounded-control border-2 bg-surface px-3 text-base text-ink ' +
            'placeholder:text-muted focus-visible:border-brand-600 ' +
            (error ? 'border-no ' : 'border-line-strong ') +
            (endSlot ? 'pr-20 ' : '') +
            className
          }
          {...inputProps}
        />
        {endSlot && <div className="absolute inset-y-0 right-0 flex items-center pr-1">{endSlot}</div>}
      </div>
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-sm font-bold text-no">
          <StatusIcon status="not-available" className="mt-0.5 size-4" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
