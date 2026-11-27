import type { ReactNode } from 'react';

/**
 * Small hand-drawn icon set (24x24, 2px strokes). Icons are always decorative here:
 * the visible text carries the meaning, so each SVG is hidden from screen readers.
 */
const paths = {
  home: <path d="M4 11.5 12 4l8 7.5M6.5 10v9.5h11V10" />,
  jobs: (
    <>
      <rect x="4" y="8" width="16" height="11" rx="2" />
      <path d="M9 8V6.2A1.2 1.2 0 0 1 10.2 5h3.6A1.2 1.2 0 0 1 15 6.2V8M4 13h16" />
    </>
  ),
  needs: <path d="M5 7h9M18 7h1M5 17h2M11 17h8M14 4.5v5M7 14.5v5" />,
  employer: <path d="M5 20V5.5h9V20M14 10h5v10M3 20h18M8.5 9h2M8.5 12.5h2M8.5 16h2" />,
  saved: <path d="M7 4.5h10v15l-5-3.6-5 3.6z" />,
  method: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 11v5M12 8v.01" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  chevronDown: <path d="m6 9.5 6 6 6-6" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof paths;

export function Icon({ name, className = 'size-5', filled = false }: { name: IconName; className?: string; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
