/**
 * Filtering and sorting the job feed. Pure functions (no React), so they are easy to test.
 *
 * One principle again: UNKNOWN IS NOT GOOD. A job with no travel time does not pass a
 * "travel up to 30 minutes" filter, and a workplace that is not confirmed does not pass
 * "workplace confirmed".
 */
import { totalCommuteMinutes } from './matching';
import type { Job, MatchResult } from './types';

export type Arrangement = 'any' | 'on-site' | 'hybrid';
export type SortKey = 'best-match' | 'shortest-commute' | 'title';

export type FeedFilters = {
  arrangement: Arrangement;
  maxMinutes: number | null; // null = any travel time
  workplaceConfirmed: boolean; // only jobs whose workplace checks are ALL confirmed
  commuteConfirmed: boolean; // only jobs whose commute checks are ALL confirmed
  savedOnly: boolean;
  showExcluded: boolean; // reveal jobs where a chosen need is not available
};

export const DEFAULT_FILTERS: FeedFilters = {
  arrangement: 'any',
  maxMinutes: null,
  workplaceConfirmed: false,
  commuteConfirmed: false,
  savedOnly: false,
  showExcluded: false,
};

export type FeedEntry = { job: Job; result: MatchResult };

/** How many narrowing filters are on (the "show excluded" switch is a view option, so it is not counted). */
export function activeFilterCount(f: FeedFilters): number {
  return [f.arrangement !== 'any', f.maxMinutes !== null, f.workplaceConfirmed, f.commuteConfirmed, f.savedOnly].filter(Boolean).length;
}

const cmp = (a: number, b: number) => (a < b ? -1 : a > b ? 1 : 0);
const minutesOf = (e: FeedEntry) => totalCommuteMinutes(e.job) ?? Infinity; // unknown goes last
const byTitle = (a: FeedEntry, b: FeedEntry) => a.job.title.localeCompare(b.job.title, 'en');

const sorters: Record<SortKey, (a: FeedEntry, b: FeedEntry) => number> = {
  // Highest score first; then shorter travel; then A-Z, so the order never jumps around randomly.
  'best-match': (a, b) => cmp(b.result.score ?? 0, a.result.score ?? 0) || cmp(minutesOf(a), minutesOf(b)) || byTitle(a, b),
  'shortest-commute': (a, b) => cmp(minutesOf(a), minutesOf(b)) || cmp(b.result.score ?? 0, a.result.score ?? 0) || byTitle(a, b),
  title: (a, b) => byTitle(a, b),
};

export function buildFeed(
  entries: FeedEntry[],
  filters: FeedFilters,
  sort: SortKey,
  savedIds: ReadonlySet<string>,
): { shown: FeedEntry[]; hiddenExcluded: number } {
  const passes = ({ job, result }: FeedEntry): boolean => {
    if (filters.arrangement !== 'any' && job.arrangement !== filters.arrangement) return false;
    if (filters.maxMinutes !== null) {
      const minutes = totalCommuteMinutes(job);
      if (minutes === null || minutes > filters.maxMinutes) return false;
    }
    if (filters.workplaceConfirmed && result.workplaceBadge !== 'confirmed') return false;
    if (filters.commuteConfirmed && result.commuteBadge !== 'confirmed') return false;
    if (filters.savedOnly && !savedIds.has(job.id)) return false;
    return true;
  };

  const matching = entries.filter(passes);
  const included = matching.filter((e) => !e.result.excluded).sort(sorters[sort]);
  const excluded = matching.filter((e) => e.result.excluded).sort(sorters[sort]);

  return filters.showExcluded
    ? { shown: [...included, ...excluded], hiddenExcluded: 0 } // excluded jobs always come last
    : { shown: included, hiddenExcluded: excluded.length };
}
