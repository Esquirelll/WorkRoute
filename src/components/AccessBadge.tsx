import { motion } from 'framer-motion';
import { SCOPE_LABEL, STATUS_LABEL, type Scope, type Status } from '../domain/types';
import { popVariants } from '../motion/motion';
import { StatusIcon } from './StatusIcon';

const statusStyle: Record<Status, string> = {
  confirmed: 'bg-ok-bg text-ok',
  'not-confirmed': 'bg-warn-bg text-warn',
  'not-available': 'bg-no-bg text-no',
};

/** Little route glyphs: orange line = commute, blue square = workplace. Decorative. */
export function ScopeGlyph({ scope }: { scope: Scope }) {
  return scope === 'commute' ? (
    <svg viewBox="0 0 20 20" className="size-4 shrink-0 text-route-500" aria-hidden="true" focusable="false">
      <path d="M3 15h6a4 4 0 0 0 4-4V8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="3.5" cy="15" r="2" fill="currentColor" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" className="size-4 shrink-0 text-brand-600" aria-hidden="true" focusable="false">
      <rect x="3.5" y="3.5" width="13" height="13" rx="2.5" fill="currentColor" />
    </svg>
  );
}

/**
 * Two-part badge: [ Workplace | icon Status text ].
 * Meaning is carried by shape + text; color only reinforces it.
 * Pass `reveal` to make it pop in (spring), e.g. when a card appears.
 */
export function AccessBadge({ scope, status, reveal = false, revealDelay = 0 }: { scope: Scope; status: Status | null; reveal?: boolean; revealDelay?: number }) {
  const Wrapper = reveal ? motion.span : 'span';
  const motionProps = reveal ? { variants: popVariants, initial: 'hidden', animate: 'visible', custom: revealDelay } : {};
  return (
    <Wrapper
      className="inline-flex max-w-full items-stretch overflow-hidden rounded-tag border border-line-strong text-xs font-bold"
      {...motionProps}
    >
      <span className="flex min-w-0 items-center gap-1.5 bg-surface px-2 py-1 text-ink">
        <ScopeGlyph scope={scope} />
        {SCOPE_LABEL[scope]}
        <span className="sr-only">: </span>
      </span>
      {status === null ? (
        // None of the needs you chose looks at this half of the journey, so we say "not checked"
        // instead of showing a status we did not actually check.
        <span className="flex min-w-0 items-center gap-1.5 border-l border-line-strong bg-page px-2 py-1 text-muted">
          <svg viewBox="0 0 20 20" className="size-4 shrink-0" aria-hidden="true" focusable="false">
            <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2.5" />
          </svg>
          Not checked
        </span>
      ) : (
        <span className={`flex min-w-0 items-center gap-1.5 border-l border-line-strong px-2 py-1 ${statusStyle[status]}`}>
          <StatusIcon status={status} className="size-4" />
          {STATUS_LABEL[status]}
        </span>
      )}
    </Wrapper>
  );
}

/** A single status on its own (used in checklists, e.g. "Step-free entrance: Confirmed"). */
export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 rounded-tag px-2 py-1 text-xs font-bold ${statusStyle[status]}`}>
      <StatusIcon status={status} className="size-4" />
      {STATUS_LABEL[status]}
    </span>
  );
}

/** Marks anything that is made-up prototype data. Required by the project's data rules. */
export function SampleTag() {
  return (
    <span className="inline-flex items-center rounded-tag border border-dashed border-line-strong px-1.5 py-0.5 text-xs font-bold text-muted">
      Sample
    </span>
  );
}
