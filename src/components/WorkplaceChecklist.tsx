import { WORKPLACE_FEATURE_LABEL } from '../data/features';
import type { Job, MatchResult, Status, WorkplaceFeature } from '../domain/types';
import { StatusBadge } from './AccessBadge';

const FEATURES = Object.keys(WORKPLACE_FEATURE_LABEL) as WorkplaceFeature[];

/**
 * The checklist rows themselves. ALL seven features are always listed, in the same order.
 * A feature with no information is shown as "Not confirmed", never skipped and never as accessible.
 * `matters` holds the labels of features that matter for the person's chosen needs (marked in words).
 * Used on the job page AND in the employer's profile preview, so both always look the same.
 */
export function ChecklistRows({ workplace, matters = new Set<string>() }: { workplace: Partial<Record<WorkplaceFeature, Status>>; matters?: Set<string> }) {
  return (
    <ul className="divide-y divide-line">
      {FEATURES.map((feature) => {
        const given = workplace[feature];
        const status = given ?? 'not-confirmed';
        const label = WORKPLACE_FEATURE_LABEL[feature];
        return (
          <li key={feature} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
            <div className="min-w-0">
              <p className="font-bold">{label}</p>
              {matters.has(label) && <p className="text-xs font-bold text-brand-700">Matters for your needs</p>}
              {status === 'not-confirmed' && (
                <p className="text-sm text-muted">{given === undefined ? 'No information in the sample data. Ask the employer.' : 'Ask the employer before relying on it.'}</p>
              )}
              {status === 'not-available' && <p className="text-sm text-muted">The sample data says this is not available.</p>}
            </div>
            <StatusBadge status={status} />
          </li>
        );
      })}
    </ul>
  );
}

/** The job page's checklist: the rows, with the person's needs marked. */
export function WorkplaceChecklist({ job, result }: { job: Job; result: MatchResult }) {
  const matters = new Set(result.needResults.flatMap((n) => n.checks.filter((c) => c.scope === 'workplace').map((c) => c.label)));
  return <ChecklistRows workplace={job.workplace} matters={matters} />;
}
