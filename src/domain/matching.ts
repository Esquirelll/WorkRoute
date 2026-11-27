/**
 * THE MATCHING ENGINE. Plain rules, no AI and no machine learning.
 *
 * It is a PURE function: give it a job and the needs a person chose, and it returns a result.
 * It reads nothing from the browser and changes nothing, so the same input always gives the
 * same output. That is what makes it easy to test (see matching.test.ts).
 *
 * THE RULES, in order:
 *  1. Each chosen need is turned into a list of CHECKS (see data/needs.ts).
 *  2. Every check gets a status: confirmed, not-confirmed or not-available.
 *     Missing information is NOT CONFIRMED. It is never treated as accessible.
 *  3. A commute check looks at every step of the journey. The WEAKEST step decides,
 *     because one blocked step breaks the whole trip.
 *  4. A need's status is the worst status among its checks.
 *  5. FILTER: if any chosen need is "not available" at a job, the job is "excluded".
 *  6. SCORE: the percent of chosen needs that are fully "confirmed". "Not confirmed" earns nothing.
 *  7. EXPLAIN: every check keeps a plain-language reason (the "Why this match?" text).
 */
import { COMMUTE_FEATURE_LABEL, COMMUTE_MODE_LABEL, WORKPLACE_FEATURE_LABEL } from '../data/features';
import { NEEDS } from '../data/needs';
import { COMMUTE_FEATURES_BY_MODE, SHORT_COMMUTE_MAX_MINUTES } from './rules';
import type {
  CommuteFeature,
  Job,
  MatchResult,
  Need,
  NeedId,
  NeedResult,
  Requirement,
  RequirementCheck,
  Status,
  WorkplaceFeature,
} from './types';

export type MatchOptions = { shortCommuteMaxMinutes?: number };

/* ---------- Small helpers ---------- */

// Lower number = worse. "Worst of" is then just "the smallest rank".
const RANK: Record<Status, number> = { 'not-available': 0, 'not-confirmed': 1, confirmed: 2 };

/** The worst status in a list. An EMPTY list means "no information", so it is not confirmed. */
export function worstStatus(statuses: Status[]): Status {
  if (statuses.length === 0) return 'not-confirmed';
  return statuses.reduce((worst, s) => (RANK[s] < RANK[worst] ? s : worst));
}

/** Total door-to-door minutes, or null when the job has no commute information. */
export function totalCommuteMinutes(job: Job): number | null {
  if (job.commute.length === 0) return null;
  return job.commute.reduce((sum, step) => sum + step.minutes, 0);
}

/** Wording for a status. "Not confirmed" is never phrased as if it were fine. */
function statusText(status: Status): string {
  if (status === 'confirmed') return 'Confirmed.';
  if (status === 'not-confirmed') return 'Not confirmed. Ask the employer before relying on it.';
  return 'Not available at this workplace.';
}

/* ---------- One check at a time ---------- */

function checkWorkplaceFeature(job: Job, feature: WorkplaceFeature): RequirementCheck {
  const given = job.workplace[feature];
  const status: Status = given ?? 'not-confirmed'; // missing information = not confirmed
  return {
    scope: 'workplace',
    label: WORKPLACE_FEATURE_LABEL[feature],
    status,
    explanation: given === undefined ? 'Not confirmed. The sample data has no information about this.' : statusText(status),
  };
}

function checkCommuteFeature(job: Job, feature: CommuteFeature): RequirementCheck {
  const label = COMMUTE_FEATURE_LABEL[feature];

  if (job.commute.length === 0) {
    return { scope: 'commute', label, status: 'not-confirmed', explanation: 'Not confirmed. The sample data has no commute steps for this job.' };
  }

  // Only the steps where this feature makes sense (a walk has nothing to board).
  const relevant = job.commute
    .map((step, index) => ({ step, index }))
    .filter(({ step }) => COMMUTE_FEATURES_BY_MODE[step.mode].includes(feature));

  if (relevant.length === 0) {
    return { scope: 'commute', label, status: 'confirmed', explanation: 'Not needed on this route: it has no step where this applies.' };
  }

  const statuses = relevant.map(({ step }) => step.features[feature] ?? 'not-confirmed');
  const status = worstStatus(statuses);

  if (status === 'confirmed') {
    return { scope: 'commute', label, status, explanation: `Confirmed on every step where it applies (${relevant.length} of ${job.commute.length} steps).` };
  }

  // Name the first step that causes the problem.
  const culprit = relevant[statuses.indexOf(status)]!;
  const stepName = `Step ${culprit.index + 1} (${COMMUTE_MODE_LABEL[culprit.step.mode]}: ${culprit.step.description})`;
  const reason =
    status === 'not-confirmed'
      ? culprit.step.features[feature] === undefined
        ? 'not confirmed, the sample data has no information about it'
        : 'not confirmed, ask before relying on it'
      : 'not available';
  return { scope: 'commute', label, status, explanation: `${stepName}: ${reason}. The weakest step decides.`, stepIndex: culprit.index };
}

function checkCommuteTime(job: Job, maxMinutes: number): RequirementCheck {
  const minutes = totalCommuteMinutes(job);
  const label = 'Travel time';
  if (minutes === null) {
    return { scope: 'commute', label, status: 'not-confirmed', explanation: 'Not confirmed. The sample data has no travel time for this job.' };
  }
  if (minutes <= maxMinutes) {
    return { scope: 'commute', label, status: 'confirmed', explanation: `About ${minutes} minutes (sample estimate), within the ${maxMinutes}-minute limit this prototype uses.` };
  }
  return { scope: 'commute', label, status: 'not-available', explanation: `About ${minutes} minutes (sample estimate), longer than the ${maxMinutes}-minute limit this prototype uses.` };
}

function runCheck(job: Job, requirement: Requirement, maxMinutes: number): RequirementCheck {
  switch (requirement.kind) {
    case 'workplace-feature':
      return checkWorkplaceFeature(job, requirement.feature);
    case 'commute-feature':
      return checkCommuteFeature(job, requirement.feature);
    case 'commute-time':
      return checkCommuteTime(job, maxMinutes);
  }
}

/* ---------- The whole match ---------- */

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

export function matchJob(
  job: Job,
  selectedNeeds: NeedId[],
  catalog: Need[] = NEEDS,
  options: MatchOptions = {},
): MatchResult {
  const maxMinutes = options.shortCommuteMaxMinutes ?? SHORT_COMMUTE_MAX_MINUTES;

  // Keep catalog order, ignore duplicates and unknown ids.
  const chosen = catalog.filter((need) => selectedNeeds.includes(need.id));

  const needResults: NeedResult[] = chosen.map((need) => {
    const checks = need.requirements.map((req) => runCheck(job, req, maxMinutes));
    return { need: need.id, label: need.label, status: worstStatus(checks.map((c) => c.status)), checks };
  });

  const idsWith = (status: Status) => needResults.filter((r) => r.status === status).map((r) => r.need);
  const met = idsWith('confirmed');
  const unconfirmed = idsWith('not-confirmed');
  const blocked = idsWith('not-available');

  const allChecks = needResults.flatMap((r) => r.checks);
  const badgeFor = (scope: 'workplace' | 'commute'): Status | null => {
    const checks = allChecks.filter((c) => c.scope === scope);
    return checks.length === 0 ? null : worstStatus(checks.map((c) => c.status));
  };

  const total = needResults.length;
  const parts = [`${met.length} of ${plural(total, 'need')} confirmed`];
  if (unconfirmed.length) parts.push(`${unconfirmed.length} not confirmed`);
  if (blocked.length) parts.push(`${blocked.length} not available`);

  return {
    jobId: job.id,
    score: total === 0 ? null : Math.round((met.length / total) * 100),
    excluded: blocked.length > 0,
    met,
    unconfirmed,
    blocked,
    needResults,
    workplaceBadge: badgeFor('workplace'),
    commuteBadge: badgeFor('commute'),
    summary: total === 0 ? 'No needs chosen yet, so there is nothing to match.' : `${parts.join(', ')}.`,
  };
}
