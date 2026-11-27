import { describe, expect, it } from 'vitest';
import { JOBS } from '../data/jobs';
import { activeFilterCount, buildFeed, DEFAULT_FILTERS, type FeedEntry, type FeedFilters } from './feed';
import { matchJob } from './matching';

// Real sample jobs, matched for the same two needs as the earlier "Maria" scenario.
const entries: FeedEntry[] = JOBS.map((job) => ({ job, result: matchJob(job, ['wheelchair', 'accessible-restroom']) }));
const ids = (list: FeedEntry[]) => list.map((e) => e.job.id);
const none = new Set<string>();
const withFilters = (f: Partial<FeedFilters>): FeedFilters => ({ ...DEFAULT_FILTERS, ...f });

describe('buildFeed: excluded jobs', () => {
  it('hides excluded jobs by default and says how many were hidden', () => {
    const { shown, hiddenExcluded } = buildFeed(entries, DEFAULT_FILTERS, 'best-match', none);
    expect(ids(shown)).not.toContain('j2');
    expect(hiddenExcluded).toBe(3); // j2, j3, j8
  });

  it('shows them LAST when the switch is on', () => {
    const { shown, hiddenExcluded } = buildFeed(entries, withFilters({ showExcluded: true }), 'best-match', none);
    expect(shown).toHaveLength(8);
    expect(ids(shown).slice(-3).sort()).toEqual(['j2', 'j3', 'j8']);
    expect(hiddenExcluded).toBe(0);
  });
});

describe('buildFeed: sorting', () => {
  it('best match: score first, then shorter travel, then title', () => {
    const { shown } = buildFeed(entries, DEFAULT_FILTERS, 'best-match', none);
    // j1 (100%, 29 min) before j6 (100%, 35 min); then j4 (50%, 47 min) before j5 (50%, 70 min); j7 (0%) last.
    expect(ids(shown)).toEqual(['j1', 'j6', 'j4', 'j5', 'j7']);
  });

  it('shortest commute: fastest first, and jobs with unknown travel time last', () => {
    const { shown } = buildFeed(entries, DEFAULT_FILTERS, 'shortest-commute', none);
    // j1 29 min, j6 35 min, j4 47 min, j5 70 min, j7 has no travel time at all.
    expect(ids(shown)).toEqual(['j1', 'j6', 'j4', 'j5', 'j7']);
  });

  it('title sorts A to Z', () => {
    const { shown } = buildFeed(entries, DEFAULT_FILTERS, 'title', none);
    const titles = shown.map((e) => e.job.title);
    expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b, 'en')));
  });
});

describe('buildFeed: filters', () => {
  it('filters by work arrangement', () => {
    const { shown } = buildFeed(entries, withFilters({ arrangement: 'hybrid', showExcluded: true }), 'title', none);
    expect(shown.every((e) => e.job.arrangement === 'hybrid')).toBe(true);
    expect(shown.length).toBeGreaterThan(0);
  });

  it('filters by travel time, and does NOT let unknown travel time pass', () => {
    const { shown } = buildFeed(entries, withFilters({ maxMinutes: 45, showExcluded: true }), 'title', none);
    expect(ids(shown)).not.toContain('j7'); // no commute information
    expect(ids(shown)).not.toContain('j5'); // 70 minutes
    expect(ids(shown)).toContain('j1'); // 29 minutes
  });

  it('"workplace confirmed" needs every chosen workplace check confirmed', () => {
    const { shown } = buildFeed(entries, withFilters({ workplaceConfirmed: true }), 'best-match', none);
    expect(ids(shown)).toEqual(['j1', 'j6', 'j4']); // j5 has an unconfirmed restroom, j7 almost nothing
  });

  it('"commute confirmed" needs every chosen commute check confirmed', () => {
    const { shown } = buildFeed(entries, withFilters({ commuteConfirmed: true }), 'best-match', none);
    expect(ids(shown)).toEqual(['j1', 'j6', 'j5']); // j4 has an unconfirmed boarding step
  });

  it('shows only saved jobs when asked', () => {
    const { shown } = buildFeed(entries, withFilters({ savedOnly: true }), 'best-match', new Set(['j6', 'j2']));
    expect(ids(shown)).toEqual(['j6']); // j2 is saved but excluded, and hidden by default
  });

  it('combines filters (all must pass)', () => {
    const { shown } = buildFeed(entries, withFilters({ arrangement: 'on-site', commuteConfirmed: true }), 'best-match', none);
    expect(ids(shown)).toEqual(['j1', 'j6', 'j5']);
  });

  it('never loses or invents jobs', () => {
    const { shown, hiddenExcluded } = buildFeed(entries, DEFAULT_FILTERS, 'best-match', none);
    expect(shown.length + hiddenExcluded).toBe(JOBS.length);
  });
});

describe('activeFilterCount', () => {
  it('counts narrowing filters but not the show-excluded view switch', () => {
    expect(activeFilterCount(DEFAULT_FILTERS)).toBe(0);
    expect(activeFilterCount(withFilters({ showExcluded: true }))).toBe(0);
    expect(activeFilterCount(withFilters({ arrangement: 'hybrid', savedOnly: true }))).toBe(2);
  });
});
