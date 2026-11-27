import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { duration, ease } from '../motion/motion';
import { useDelayedLoading } from '../hooks/useDelayedLoading';
import { LogoMark } from './Logo';

/** Small branded progress indicator: an orange dot travels the route to the blue square. */
function RouteProgress() {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 120 24" className="h-6 w-28" aria-hidden="true" focusable="false">
      <path d="M8 12h96" stroke="#d8d5cf" strokeWidth="3" strokeLinecap="round" />
      <rect x="104" y="6" width="12" height="12" rx="3" fill="#1D4F91" />
      <motion.circle
        cy="12"
        r="5"
        fill="#B45F06"
        initial={{ cx: reduce ? 56 : 8 }}
        animate={reduce ? { cx: 56 } : { cx: [8, 96] }}
        transition={reduce ? undefined : { duration: duration.loop, ease, repeat: Infinity, repeatType: 'loop' }}
      />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-card border border-line bg-surface p-4" aria-hidden="true">
      <div className="wr-skeleton h-5 w-2/3" />
      <div className="wr-skeleton mt-2 h-4 w-1/3" />
      <div className="mt-4 flex gap-2">
        <div className="wr-skeleton h-7 w-36" />
        <div className="wr-skeleton h-7 w-32" />
      </div>
      <div className="wr-skeleton mt-4 h-4 w-full" />
    </div>
  );
}

/**
 * The loading UI itself: progress indicator + skeleton cards + a screen-reader message.
 * role="status" makes screen readers announce the text politely, without stealing focus.
 */
export function LoadingState({ label = 'Loading', cards = 3 }: { label?: string; cards?: number }) {
  return (
    <div role="status" aria-busy="true" className="flex flex-col gap-4 py-2">
      <div className="flex items-center gap-3 text-muted">
        <LogoMark className="size-6" />
        <RouteProgress />
        <span className="text-sm font-bold">{label}…</span>
      </div>
      {Array.from({ length: cards }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * Wrap anything that can take time:
 *   <LoadingGate loading={isLoading} label="Loading jobs"> ...content... </LoadingGate>
 * While loading is short, nothing flashes. If it runs long, LoadingState appears and stays at least ~500 ms.
 */
export function LoadingGate({
  loading,
  label,
  cards,
  sinceNavigationStart = false,
  children,
}: {
  loading: boolean;
  label?: string;
  cards?: number;
  /** Only for the very first load of the site: count the wait from when the page began loading. */
  sinceNavigationStart?: boolean;
  children: ReactNode;
}) {
  const showLoader = useDelayedLoading(loading, { sinceNavigationStart });
  if (showLoader) return <LoadingState label={label} cards={cards} />;
  if (loading) return null; // still inside the first 400 ms: show nothing rather than flash a loader
  return <>{children}</>;
}
