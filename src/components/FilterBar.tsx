import { useId, useState } from 'react';
import { activeFilterCount, type Arrangement, type FeedFilters, type SortKey } from '../domain/feed';
import { Button } from './Button';
import { Card } from './Card';
import { ChipRadioGroup, ChipToggle } from './Chips';
import { Icon } from './Icon';

const ARRANGEMENTS = [
  { id: 'any', label: 'Any' },
  { id: 'on-site', label: 'On-site' },
  { id: 'hybrid', label: 'Hybrid' },
];
const TRAVEL = [
  { id: 'any', label: 'Any' },
  { id: '30', label: 'Up to 30 min' },
  { id: '45', label: 'Up to 45 min' },
  { id: '60', label: 'Up to 60 min' },
];
const SORTS: { id: SortKey; label: string }[] = [
  { id: 'best-match', label: 'Best match' },
  { id: 'shortest-commute', label: 'Shortest travel time' },
  { id: 'title', label: 'Job title (A to Z)' },
];

type Props = {
  filters: FeedFilters;
  sort: SortKey;
  hasNeeds: boolean;
  hiddenExcluded: number;
  setFilter: <K extends keyof FeedFilters>(key: K, value: FeedFilters[K]) => void;
  setSort: (sort: SortKey) => void;
  clearFilters: () => void;
};

/**
 * Filters and sorting. On phones the filters fold away behind one button (the sort stays visible),
 * because eleven chips would push the jobs off the screen.
 */
export function FilterBar({ filters, sort, hasNeeds, hiddenExcluded, setFilter, setSort, clearFilters }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const sortId = useId();
  const count = activeFilterCount(filters);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-0 max-w-full flex-col gap-1.5">
          <label htmlFor={sortId} className="text-sm font-bold">
            Sort by
          </label>
          <select
            id={sortId}
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="min-h-11 max-w-full rounded-control border-2 border-line-strong bg-surface px-3 text-base font-bold focus-visible:border-brand-600"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={panelId}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-control border-2 border-line-strong bg-surface px-3 text-base font-bold lg:hidden"
        >
          Filters{count > 0 ? ` (${count})` : ''}
          <Icon name="chevronDown" className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div id={panelId} className={`${open ? 'flex' : 'hidden'} flex-col gap-4 lg:flex`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <ChipRadioGroup legend="Work arrangement" name="arrangement" options={ARRANGEMENTS} value={filters.arrangement} onChange={(id) => setFilter('arrangement', id as Arrangement)} />
          <ChipRadioGroup
            legend="Travel time"
            name="travel"
            options={TRAVEL}
            value={filters.maxMinutes === null ? 'any' : String(filters.maxMinutes)}
            onChange={(id) => setFilter('maxMinutes', id === 'any' ? null : Number(id))}
          />
        </div>

        <fieldset>
          <legend className="mb-1.5 text-sm font-bold">Show only</legend>
          <div className="flex flex-wrap gap-2">
            <ChipToggle label="Workplace confirmed" checked={filters.workplaceConfirmed} disabled={!hasNeeds} onChange={(v) => setFilter('workplaceConfirmed', v)} />
            <ChipToggle label="Commute confirmed" checked={filters.commuteConfirmed} disabled={!hasNeeds} onChange={(v) => setFilter('commuteConfirmed', v)} />
            <ChipToggle label="Saved jobs" checked={filters.savedOnly} onChange={(v) => setFilter('savedOnly', v)} />
          </div>
          {!hasNeeds && <p className="mt-1.5 text-sm text-muted">The two “confirmed” filters need your needs. Choose them first.</p>}
        </fieldset>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3">
          <ChipToggle label="Show excluded jobs" checked={filters.showExcluded} onChange={(v) => setFilter('showExcluded', v)} />
          {!filters.showExcluded && hiddenExcluded > 0 && (
            <p className="text-sm text-muted">
              {hiddenExcluded} {hiddenExcluded === 1 ? 'job is' : 'jobs are'} hidden because a need you chose is not available.
            </p>
          )}
          {count > 0 && (
            <Button variant="quiet" onClick={clearFilters} className="ml-auto">
              Clear filters
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
