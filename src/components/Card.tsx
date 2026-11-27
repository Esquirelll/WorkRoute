import type { ComponentProps } from 'react';

/** White surface with a thin border. No shadow: shadows are saved for floating menus. */
export function Card({ className = '', ...rest }: ComponentProps<'div'>) {
  return <div className={`rounded-card border border-line bg-surface p-4 sm:p-5 ${className}`} {...rest} />;
}
