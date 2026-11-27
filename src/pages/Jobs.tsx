import { AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FilterBar } from '../components/FilterBar';
import { JobCard } from '../components/JobCard';
import { LoadingGate } from '../components/LoadingState';
import { Notice } from '../components/Notice';
import { PageHeader } from '../components/PageHeader';
import { LegendCard, NeedsProfileCard } from '../components/SideCards';
import { buildFeed, type FeedEntry } from '../domain/feed';
import { matchJob } from '../domain/matching';
import type { User } from '../domain/types';
import { useAuth } from '../hooks/useAuth';
import { useCatalog } from '../hooks/useCatalog';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useFeedControls } from '../hooks/useFeedControls';
import { useNeeds } from '../hooks/useNeeds';
import { useSavedJobs } from '../hooks/useSavedJobs';
import { delay as motionDelay, staggerDelay } from '../motion/motion';
import { toggleSaved } from '../services/savedJobs';

export function Jobs() {
  const user = useAuth();
  return user ? <JobsFeed user={user} /> : null;
}

function JobsFeed({ user }: { user: User }) {
  const { catalog, loading } = useCatalog();
  const needs = useNeeds(user.id);
  const savedIds = useSavedJobs(user.id);
  const controls = useFeedControls(user.id);
  const { filters, sort } = controls;
  const [announcement, setAnnouncement] = useState('');

  // "intro" = this is the first time the list appears. Cards then stagger in (a few only) and
  // the scores count up. After that, cards entering because of a filter change just fade in.
  const intro = useRef(true);
  useEffect(() => {
    if (catalog) intro.current = false;
  }, [catalog]);

  const savedSet = useMemo(() => new Set(savedIds), [savedIds]);
  const entries: FeedEntry[] = useMemo(
    () => (catalog ? catalog.jobs.map((job) => ({ job, result: matchJob(job, needs) })) : []),
    [catalog, needs],
  );
  const { shown, hiddenExcluded } = useMemo(() => buildFeed(entries, filters, sort, savedSet), [entries, filters, sort, savedSet]);
  const employers = useMemo(() => new Map((catalog?.employers ?? []).map((e) => [e.id, e])), [catalog]);

  // The result count is announced to screen readers only after filtering settles (not on every click).
  const countText = `${shown.length} ${shown.length === 1 ? 'job' : 'jobs'} shown.`;
  const settledCount = useDebouncedValue(countText, 600);

  function handleToggleSave(jobId: string, title: string) {
    const nowSaved = toggleSaved(user.id, jobId);
    setAnnouncement(nowSaved ? `Saved ${title}.` : `Removed ${title} from saved jobs.`);
  }

  return (
    <>
      <PageHeader title="Jobs">Sample jobs matched to your needs. Every job, employer and route here is sample data.</PageHeader>

      {/* One column on phones. Two on laptops: needs card and legend stacked on the left. Three on wide screens. */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)_16rem]">
        <aside aria-label="My needs" className="lg:col-start-1 lg:row-start-1 xl:sticky xl:top-20 xl:self-start">
          <NeedsProfileCard user={user} needs={needs} savedCount={savedIds.length} onShowSaved={() => controls.setFilter('savedOnly', true)} />
        </aside>

        <section aria-label="Job results" className="flex min-w-0 flex-col gap-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 xl:row-span-1">
          {needs.length === 0 && (
            <Notice tone="info">
              You have not chosen any needs yet, so there are no match scores.{' '}
              <Link to="/needs" className="text-brand-700 underline underline-offset-4">
                Choose my needs
              </Link>
            </Notice>
          )}

          <LoadingGate loading={loading} label="Loading sample jobs">
            <FilterBar
              filters={filters}
              sort={sort}
              hasNeeds={needs.length > 0}
              hiddenExcluded={hiddenExcluded}
              setFilter={controls.setFilter}
              setSort={controls.setSort}
              clearFilters={controls.clearFilters}
            />

            <p className="text-sm font-bold" aria-hidden="true">
              {countText}
            </p>
            {/* Screen readers hear the count once things settle, plus save confirmations. */}
            <p role="status" className="sr-only">
              {announcement || settledCount}
            </p>

            <ul className="relative flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {shown.map(({ job, result }, index) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    employer={employers.get(job.employerId)!}
                    result={result}
                    saved={savedSet.has(job.id)}
                    onToggleSave={() => handleToggleSave(job.id, job.title)}
                    intro={intro.current}
                    introDelay={intro.current && index < motionDelay.maxStaggerItems ? staggerDelay(index) : 0}
                  />
                ))}
              </AnimatePresence>
            </ul>

            {shown.length === 0 && (
              <Card>
                <h2 className="text-lg">No jobs match these filters</h2>
                <p className="mt-1 text-sm text-muted">
                  {hiddenExcluded > 0
                    ? `${hiddenExcluded} ${hiddenExcluded === 1 ? 'job is' : 'jobs are'} hidden because a need you chose is not available. `
                    : ''}
                  Try removing a filter.
                </p>
                <Button variant="secondary" onClick={controls.clearFilters} className="mt-3">
                  Clear filters
                </Button>
              </Card>
            )}
          </LoadingGate>
        </section>

        <aside aria-label="Legend and tips" className="flex flex-col gap-4 lg:col-start-1 lg:row-start-2 xl:col-start-3 xl:row-start-1 xl:sticky xl:top-20 xl:self-start">
          <LegendCard />
        </aside>
      </div>
    </>
  );
}
