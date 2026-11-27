import type { CommuteMode } from '../domain/types';

/** Simple hand-drawn glyphs for each kind of transport. Decorative: the text names the mode too. */
export function ModeIcon({ mode, className = 'size-5' }: { mode: CommuteMode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {mode === 'walk' && (
        <>
          <circle cx="13" cy="4.5" r="1.8" />
          <path d="m13 8-2.5 4 2.5 2.2V20M10.5 12l-3 1.5M13 9.5l3 2.5M13 14.2l3 5.3" />
        </>
      )}
      {mode === 'lrt-mrt' && (
        <>
          <rect x="5" y="3.5" width="14" height="13" rx="3" />
          <path d="M5 10.5h14M9 20.5l1.5-4M15 20.5l-1.5-4" />
          <circle cx="9" cy="13.5" r=".6" fill="currentColor" />
          <circle cx="15" cy="13.5" r=".6" fill="currentColor" />
        </>
      )}
      {mode === 'bus' && (
        <>
          <rect x="4" y="4.5" width="16" height="12" rx="2" />
          <path d="M4 10.5h16" />
          <circle cx="8" cy="19" r="1.5" />
          <circle cx="16" cy="19" r="1.5" />
        </>
      )}
      {mode === 'jeepney' && (
        <>
          <path d="M3 15.5V10l3-3.5h12l3 3.5v5.5z" />
          <path d="M3 11.5h18M10 7v4.5" />
          <circle cx="7" cy="17.5" r="1.6" />
          <circle cx="17" cy="17.5" r="1.6" />
        </>
      )}
      {mode === 'tricycle' && (
        <>
          <circle cx="6" cy="17" r="2.4" />
          <circle cx="18" cy="17" r="2.4" />
          <path d="M6 17h5l2-6h-4M13 11l3 6M9.5 11 8 8h-2M11 17h-.5M14 7h3" />
        </>
      )}
    </svg>
  );
}
