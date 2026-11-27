import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { spring } from '../motion/motion';
import { Icon } from './Icon';

/**
 * Filter chips are REAL form controls (radio buttons and checkboxes) dressed up as pills.
 * That gives keyboard use, arrow keys in a group, and screen-reader support for free.
 * The real input is visually hidden but still focusable; the pill is its visible face.
 * Checked chips show a check mark AND a filled pill, so state is never color alone.
 */
const pillBase =
  'relative inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 border-line-strong bg-surface px-4 text-sm font-bold ' +
  'transition-colors peer-checked:border-brand-600 peer-checked:text-white peer-hover:border-brand-600 ' +
  'peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-600 ' +
  'peer-disabled:cursor-not-allowed peer-disabled:opacity-55 peer-disabled:hover:border-line-strong';

type Option = { id: string; label: string };

/** Choose exactly one. The filled pill SLIDES from one chip to the next (a shared layout animation). */
export function ChipRadioGroup({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  options: Option[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-bold">{legend}</legend>
      <LayoutGroup id={name}>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const checked = option.id === value;
            return (
              <label key={option.id} className="relative inline-flex cursor-pointer">
                <input type="radio" name={name} value={option.id} checked={checked} onChange={() => onChange(option.id)} className="peer sr-only" />
                <span className={pillBase}>
                  {checked && (
                    <motion.span layoutId={`${name}-pill`} transition={spring.snappy} className="absolute inset-0 rounded-full bg-brand-600" />
                  )}
                  <span className="relative z-10 inline-flex items-center gap-1.5">
                    {checked && <Icon name="check" className="size-4" />}
                    {option.label}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </LayoutGroup>
    </fieldset>
  );
}

/** On or off. The filled pill pops in and out with a spring. */
export function ChipToggle({
  label,
  checked,
  onChange,
  disabled = false,
  children,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  children?: ReactNode;
}) {
  return (
    <label className={`relative inline-flex ${disabled ? '' : 'cursor-pointer'}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className={pillBase}>
        <AnimatePresence initial={false}>
          {checked && (
            <motion.span
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={spring.snappy}
              className="absolute inset-0 rounded-full bg-brand-600"
            />
          )}
        </AnimatePresence>
        <span className="relative z-10 inline-flex items-center gap-1.5">
          {checked && <Icon name="check" className="size-4" />}
          {label}
          {children}
        </span>
      </span>
    </label>
  );
}
