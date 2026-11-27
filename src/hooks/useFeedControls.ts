import { useEffect, useState } from 'react';
import { DEFAULT_FILTERS, type FeedFilters, type SortKey } from '../domain/feed';

export type FeedControls = { userId: string; filters: FeedFilters; sort: SortKey };

// Remembered while the tab is open, so pressing Back from a job detail keeps your filters.
// (Not saved to the browser: filters are a view setting, not personal data.)
let remembered: FeedControls | null = null;

export function useFeedControls(userId: string) {
  const [state, setState] = useState<FeedControls>(() =>
    remembered && remembered.userId === userId ? remembered : { userId, filters: DEFAULT_FILTERS, sort: 'best-match' },
  );
  useEffect(() => {
    remembered = state;
  }, [state]);

  return {
    filters: state.filters,
    sort: state.sort,
    setFilter: <K extends keyof FeedFilters>(key: K, value: FeedFilters[K]) =>
      setState((s) => ({ ...s, filters: { ...s.filters, [key]: value } })),
    setSort: (sort: SortKey) => setState((s) => ({ ...s, sort })),
    clearFilters: () => setState((s) => ({ ...s, filters: { ...DEFAULT_FILTERS, showExcluded: s.filters.showExcluded } })),
  };
}
