import { StatusBadge } from './AccessBadge';
import { STATUS_LABEL, type MatchResult, type NeedResult, type Status } from '../domain/types';

const ORDER: Status[] = ['confirmed', 'not-confirmed', 'not-available'];

/**
 * The "Why this match?" explanation: which needs are met, which are not confirmed, and which
 * are not available, each with the reason. Used inside job cards (compact, in a disclosure)
 * and on the job page (full).
 */
/**
 * `headingLevel` is the level of the group headings ("Confirmed", "Not confirmed" ...). It must be ONE LEVEL
 * BELOW the heading that introduces this block, so screen-reader users never meet a skipped level.
 */
export function WhyThisMatchBody({ result, full, headingLevel = 4 }: { result: MatchResult; full: boolean; headingLevel?: 3 | 4 }) {
  const Heading = `h${headingLevel}` as const;
  if (result.needResults.length === 0) {
    return <p className="text-sm text-muted">Choose your needs to see why a job matches. Until then there is nothing to compare.</p>;
  }

  const groups = ORDER.map((status) => ({ status, needs: result.needResults.filter((n) => n.status === status) })).filter((g) => g.needs.length > 0);

  return (
    <div className="flex flex-col gap-4">
      {groups.map(({ status, needs }) => (
        <section key={status}>
          <Heading className="mb-1.5 flex items-center gap-2 text-sm font-bold">
            <StatusBadge status={status} />
            <span>
              {needs.length} {needs.length === 1 ? 'need' : 'needs'}
            </span>
          </Heading>
          <ul className="flex flex-col gap-2">
            {needs.map((need) => (
              <NeedLine key={need.need} need={need} showAllChecks={full || need.status !== 'confirmed'} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function NeedLine({ need, showAllChecks }: { need: NeedResult; showAllChecks: boolean }) {
  // For needs that are not fully confirmed, show only the checks that are the problem.
  const checks = need.status === 'confirmed' ? need.checks : need.checks.filter((c) => c.status !== 'confirmed');
  return (
    <li className="text-sm">
      <p className="font-bold">{need.label}</p>
      {showAllChecks && (
        <ul className="mt-0.5 flex flex-col gap-0.5 text-muted">
          {checks.map((check, i) => (
            <li key={i}>
              <span className="font-bold text-ink">
                {check.scope === 'workplace' ? 'Workplace' : 'Commute'}: {check.label}.
              </span>{' '}
              <span className="sr-only">{STATUS_LABEL[check.status]}. </span>
              {check.explanation}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/** Collapsed by default, for job cards. Native <details>: keyboard and screen-reader friendly. */
export function WhyThisMatch({ result }: { result: MatchResult }) {
  return (
    <details className="relative z-10 rounded-control border border-line">
      <summary className="flex min-h-11 cursor-pointer items-center px-3 text-sm font-bold text-brand-700">Why this match?</summary>
      <div className="border-t border-line px-3 py-3">
        <WhyThisMatchBody result={result} full={false} />
      </div>
    </details>
  );
}
