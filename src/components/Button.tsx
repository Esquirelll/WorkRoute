import type { ComponentProps } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'quiet' | 'danger';

/**
 * One function builds the classes for buttons AND link-buttons, so they always match.
 * min-h-11 = 44px, the minimum comfortable touch size.
 * Hover: a thicker bottom edge (primary) or a tinted fill (others). Press: sinks 1px.
 */
function buttonClasses(variant: Variant, extra = ''): string {
  const base =
    'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-control px-4 text-base font-bold ' +
    'transition-[background-color,box-shadow,transform] active:translate-y-px ' +
    'disabled:cursor-not-allowed disabled:opacity-55';
  const variants: Record<Variant, string> = {
    primary:
      'bg-brand-600 text-white hover:bg-brand-700 hover:shadow-[inset_0_-3px_0_rgb(0_0_0/0.28)] active:shadow-none',
    secondary:
      'border-2 border-brand-600 bg-surface text-brand-700 hover:bg-brand-50 hover:border-brand-700',
    quiet: 'text-brand-700 underline decoration-2 underline-offset-4 hover:bg-brand-50',
    // For actions that cannot be undone. Always paired with a confirmation step.
    danger: 'bg-no text-white hover:bg-[#7c2323] hover:shadow-[inset_0_-3px_0_rgb(0_0_0/0.28)] active:shadow-none',
  };
  return `${base} ${variants[variant]} ${extra}`;
}

type ButtonProps = ComponentProps<'button'> & { variant?: Variant };

export function Button({ variant = 'primary', className = '', type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, className)} {...rest} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant };

/** Looks like a button but is a real link (use for navigation, Button for actions). */
export function ButtonLink({ variant = 'primary', className = '', ...rest }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, className)} {...rest} />;
}
