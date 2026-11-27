import { describe, expect, it } from 'vitest';
import { JOBS } from '../data/jobs';
import { matchJob, totalCommuteMinutes, worstStatus } from './matching';
import type { CommuteStep, Job } from './types';

/**
 * HOW TO READ THIS FILE
 * Each `it(...)` is one small experiment: build a tiny job, run matchJob, and `expect` the answer.
 * `describe(...)` groups related experiments. If the code ever breaks a rule, the matching test goes red.
 *
 * `makeJob` builds a job with sensible defaults, so each test only states what it cares about.
 */
function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: 'test',
    title: 'Test job',
    employerId: 'e',
    area: 'Test City',
    arrangement: 'on-site',
    summary: '',
    workplace: {},
    commute: [],
    isSample: true,
    ...overrides,
  };
}

const vehicle = (features: CommuteStep['features'], minutes = 20): CommuteStep => ({
  mode: 'lrt-mrt',
  description: 'A to B',
  minutes,
  features,
});
const allOk = { stepFree: 'confirmed', wheelchairBoarding: 'confirmed', audioAnnouncements: 'confirmed', visualAnnouncements: 'confirmed' } as const;

describe('worstStatus', () => {
  it('picks the weakest status', () => {
    expect(worstStatus(['confirmed', 'not-confirmed'])).toBe('not-confirmed');
    expect(worstStatus(['confirmed', 'not-confirmed', 'not-available'])).toBe('not-available');
    expect(worstStatus(['confirmed', 'confirmed'])).toBe('confirmed');
  });
  it('treats an empty list as "no information", never as confirmed', () => {
    expect(worstStatus([])).toBe('not-confirmed');
  });
});

describe('no needs chosen', () => {
  it('gives no score, no exclusion and no badges', () => {
    const r = matchJob(makeJob(), []);
    expect(r.score).toBeNull();
    expect(r.excluded).toBe(false);
    expect(r.workplaceBadge).toBeNull();
    expect(r.commuteBadge).toBeNull();
    expect(r.needResults).toEqual([]);
  });
});

describe('scoring', () => {
  it('scores 100 when every check is confirmed', () => {
    const job = makeJob({ workplace: { quietWorkspace: 'confirmed', flexibleHours: 'confirmed' } });
    const r = matchJob(job, ['quiet-workspace', 'flexible-hours']);
    expect(r.score).toBe(100);
    expect(r.met).toEqual(['quiet-workspace', 'flexible-hours']);
    expect(r.excluded).toBe(false);
  });

  it('gives "not confirmed" NO credit: 1 of 2 needs confirmed = 50', () => {
    const job = makeJob({ workplace: { quietWorkspace: 'confirmed', flexibleHours: 'not-confirmed' } });
    const r = matchJob(job, ['quiet-workspace', 'flexible-hours']);
    expect(r.score).toBe(50);
    expect(r.unconfirmed).toEqual(['flexible-hours']);
    expect(r.excluded).toBe(false); // unconfirmed does not remove the job
    expect(r.workplaceBadge).toBe('not-confirmed');
  });

  it('excludes the job when a chosen need is not available', () => {
    const job = makeJob({ workplace: { quietWorkspace: 'confirmed', flexibleHours: 'not-available' } });
    const r = matchJob(job, ['quiet-workspace', 'flexible-hours']);
    expect(r.excluded).toBe(true);
    expect(r.blocked).toEqual(['flexible-hours']);
    expect(r.workplaceBadge).toBe('not-available');
  });

  it('ignores needs that were not chosen (a missing feature the person does not need is fine)', () => {
    const job = makeJob({ workplace: { quietWorkspace: 'not-available' } });
    expect(matchJob(job, ['flexible-hours']).excluded).toBe(false);
  });

  it('ignores duplicate need ids', () => {
    const job = makeJob({ workplace: { quietWorkspace: 'confirmed' } });
    expect(matchJob(job, ['quiet-workspace', 'quiet-workspace']).needResults).toHaveLength(1);
  });
});

describe('missing information', () => {
  it('counts a missing workplace feature as NOT CONFIRMED, never confirmed', () => {
    const r = matchJob(makeJob({ workplace: {} }), ['accessible-restroom']);
    expect(r.met).toEqual([]);
    expect(r.unconfirmed).toEqual(['accessible-restroom']);
    expect(r.needResults[0]!.checks[0]!.explanation).toContain('no information');
  });

  it('counts a job with no commute steps as not confirmed for commute needs', () => {
    const r = matchJob(makeJob({ commute: [] }), ['screen-reader']);
    expect(r.commuteBadge).toBe('not-confirmed');
  });

  it('counts a missing commute feature on a vehicle step as not confirmed', () => {
    const job = makeJob({ commute: [vehicle({ stepFree: 'confirmed' })] }); // boarding is missing
    const r = matchJob(job, ['wheelchair']);
    expect(r.commuteBadge).toBe('not-confirmed');
  });

  it('never words a not-confirmed check as if it were fine', () => {
    const r = matchJob(makeJob({ workplace: { quietWorkspace: 'not-confirmed' } }), ['quiet-workspace']);
    const text = r.needResults[0]!.checks[0]!.explanation;
    expect(text.startsWith('Not confirmed')).toBe(true);
  });
});

describe('commute: the weakest step decides', () => {
  const walk: CommuteStep = { mode: 'walk', description: 'to the stop', minutes: 5, features: { stepFree: 'confirmed' } };

  it('is confirmed when every step is confirmed', () => {
    const job = makeJob({ workplace: { stepFreeEntrance: 'confirmed', stepFreeRoutes: 'confirmed' }, commute: [walk, vehicle(allOk)] });
    const r = matchJob(job, ['wheelchair']);
    expect(r.commuteBadge).toBe('confirmed');
    expect(r.score).toBe(100);
  });

  it('is not confirmed if ONE step is not confirmed, and names that step', () => {
    const shaky = vehicle({ ...allOk, wheelchairBoarding: 'not-confirmed' });
    const job = makeJob({ commute: [walk, shaky] });
    const r = matchJob(job, ['wheelchair']);
    const boarding = r.needResults[0]!.checks.find((c) => c.label === 'Wheelchair can board')!;
    expect(boarding.status).toBe('not-confirmed');
    expect(boarding.explanation).toContain('Step 2');
  });

  it('is not available if ONE step is not available, even when the others are confirmed', () => {
    const blockedStep = vehicle({ ...allOk, stepFree: 'not-available' });
    const job = makeJob({ commute: [walk, blockedStep, walk] });
    const r = matchJob(job, ['no-stairs']);
    expect(r.commuteBadge).toBe('not-available');
    expect(r.excluded).toBe(true);
  });

  it('points at the weakest step by number, so the screen can highlight it', () => {
    const job = makeJob({ commute: [walk, vehicle(allOk), vehicle({ ...allOk, stepFree: 'not-available' })] });
    const check = matchJob(job, ['no-stairs']).needResults[0]!.checks.find((c) => c.label === 'Step-free travel')!;
    expect(check.stepIndex).toBe(2);
  });

  it('does not require walking steps to have a boarding feature', () => {
    const job = makeJob({ workplace: { stepFreeEntrance: 'confirmed', stepFreeRoutes: 'confirmed' }, commute: [walk, vehicle(allOk), walk] });
    const boarding = matchJob(job, ['wheelchair']).needResults[0]!.checks.find((c) => c.label === 'Wheelchair can board')!;
    expect(boarding.status).toBe('confirmed');
  });
});

describe('short commute (prototype rule: 45 minutes)', () => {
  const job = (minutes: number) => makeJob({ commute: [vehicle(allOk, minutes)] });

  it('is confirmed at or under the limit', () => {
    expect(matchJob(job(45), ['short-commute']).met).toEqual(['short-commute']);
  });
  it('is not available over the limit', () => {
    expect(matchJob(job(46), ['short-commute']).blocked).toEqual(['short-commute']);
  });
  it('is not confirmed when there is no travel time', () => {
    expect(matchJob(makeJob({ commute: [] }), ['short-commute']).unconfirmed).toEqual(['short-commute']);
  });
  it('adds up all the steps', () => {
    expect(totalCommuteMinutes(makeJob({ commute: [vehicle(allOk, 10), vehicle(allOk, 15)] }))).toBe(25);
  });
  it('lets the limit be changed (so the rule is not buried in the code)', () => {
    expect(matchJob(job(60), ['short-commute'], undefined, { shortCommuteMaxMinutes: 60 }).met).toEqual(['short-commute']);
  });
});

describe('the explanation ("Why this match?")', () => {
  it('has one entry per chosen need, each with readable checks', () => {
    const job = makeJob({ workplace: { quietWorkspace: 'confirmed', flexibleHours: 'not-available' } });
    const r = matchJob(job, ['quiet-workspace', 'flexible-hours']);
    expect(r.needResults.map((n) => n.need)).toEqual(['quiet-workspace', 'flexible-hours']);
    expect(r.needResults.every((n) => n.checks.every((c) => c.explanation.length > 0))).toBe(true);
    expect(r.summary).toBe('1 of 2 needs confirmed, 1 not available.');
  });
});

/* "Golden" tests against the real sample data: they keep the demo stable.
   If you edit data/jobs.ts on purpose, update these numbers on purpose too. */
describe('sample data scenario: wheelchair + accessible restroom', () => {
  const needs = ['wheelchair', 'accessible-restroom'] as const;
  const byId = Object.fromEntries(JOBS.map((j) => [j.id, matchJob(j, [...needs])]));

  it('fully matches the jobs where everything is confirmed', () => {
    expect(byId.j1!.score).toBe(100);
    expect(byId.j6!.score).toBe(100);
  });
  it('keeps jobs with unconfirmed items, with a lower score', () => {
    expect(byId.j4!.score).toBe(50);
    expect(byId.j5!.score).toBe(50);
    expect(byId.j7!.score).toBe(0);
    expect(byId.j7!.excluded).toBe(false);
  });
  it('excludes jobs with stairs or an inaccessible commute step', () => {
    expect(byId.j2!.excluded).toBe(true);
    expect(byId.j3!.excluded).toBe(true);
    expect(byId.j8!.excluded).toBe(true);
  });
});
