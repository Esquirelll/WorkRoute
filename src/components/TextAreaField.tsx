import { useId, type ComponentProps } from 'react';
import { StatusIcon } from './StatusIcon';

type Props = Omit<ComponentProps<'textarea'>, 'id'> & { id?: string; label: string; hint?: string; error?: string; max: number };

/** Same accessibility pattern as FormField (label, hint and error linked), for longer text, with a length counter. */
export function TextAreaField({ label, hint, error, max, id: idProp, value, className = '', ...rest }: Props) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const length = typeof value === 'string' ? value.length : 0;
  const describedBy = [hint ? hintId : null, `${id}-count`, error ? errorId : null].filter(Boolean).join(' ');

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-bold">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      <textarea
        id={id}
        value={value}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`w-full rounded-control border-2 bg-surface px-3 py-2 text-base focus-visible:border-brand-600 ${error ? 'border-no' : 'border-line-strong'} ${className}`}
        {...rest}
      />
      <p id={`${id}-count`} className="text-sm text-muted">
        <span className="tnum">{length}</span> of <span className="tnum">{max}</span> characters
      </p>
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-sm font-bold text-no">
          <StatusIcon status="not-available" className="mt-0.5 size-4" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
