import type { Status } from '../domain/types';

/**
 * Status icons. Each status has its OWN SHAPE as well as its own color,
 * so it can be told apart without seeing color at all:
 *   confirmed     = circle with a check
 *   not confirmed = diamond with a question mark
 *   not available = square with a cross
 * The visible text label always sits beside it (see AccessBadge), never color alone.
 */
const colorClass: Record<Status, string> = {
  confirmed: 'text-ok',
  'not-confirmed': 'text-warn',
  'not-available': 'text-no',
};

export function StatusIcon({ status, className = 'size-5' }: { status: Status; className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`${className} shrink-0 ${colorClass[status]}`}
      aria-hidden="true"
      focusable="false"
    >
      {status === 'confirmed' && (
        <>
          <circle cx="10" cy="10" r="9" fill="currentColor" />
          <path d="m5.8 10.3 2.7 2.7 5.6-5.8" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {status === 'not-confirmed' && (
        <>
          <path d="M10 1.2 18.8 10 10 18.8 1.2 10z" fill="currentColor" strokeLinejoin="round" />
          <path d="M8.2 8.2a1.9 1.9 0 1 1 2.9 1.6c-.8.5-1.1.9-1.1 1.7" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="10" cy="14" r="1" fill="#fff" />
        </>
      )}
      {status === 'not-available' && (
        <>
          <rect x="1.5" y="1.5" width="17" height="17" rx="3.5" fill="currentColor" />
          <path d="m6.8 6.8 6.4 6.4M13.2 6.8l-6.4 6.4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
