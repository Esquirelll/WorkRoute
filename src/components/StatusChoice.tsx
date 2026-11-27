import { STATUS_LABEL, type Status } from '../domain/types';
import { Icon } from './Icon';
import { StatusIcon } from './StatusIcon';

const OPTIONS: Status[] = ['confirmed', 'not-confirmed', 'not-available'];

/**
 * Pick one of the three statuses for one workplace feature. Real radio buttons (arrow keys work).
 * Every choice shows its own icon shape + words, and the chosen one also gets a check mark and a
 * thicker border, so nothing depends on color.
 */
export function StatusChoice({
  name,
  legend,
  help,
  value,
  onChange,
}: {
  name: string;
  legend: string;
  help: string;
  value: Status;
  onChange: (next: Status) => void;
}) {
  return (
    <fieldset className="py-3">
      <legend className="font-bold">{legend}</legend>
      <p className="text-sm text-muted">{help}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {OPTIONS.map((option) => (
          <label key={option} className="relative inline-flex cursor-pointer">
            <input type="radio" name={name} value={option} checked={value === option} onChange={() => onChange(option)} className="peer sr-only" />
            <span className="inline-flex min-h-11 items-center gap-1.5 rounded-control border-2 border-line-strong bg-surface px-3 text-sm font-bold transition-colors hover:border-brand-600 peer-checked:border-brand-600 peer-checked:bg-brand-50 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-600">
              <StatusIcon status={option} className="size-4" />
              {STATUS_LABEL[option]}
              {value === option && <Icon name="check" className="size-4 text-brand-700" />}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
