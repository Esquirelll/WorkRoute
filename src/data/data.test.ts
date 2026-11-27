import { describe, expect, it } from 'vitest';
import { COMMUTE_FEATURES_BY_MODE } from '../domain/rules';
import { COMMUTE_FEATURE_LABEL, WORKPLACE_FEATURE_LABEL } from './features';
import { EMPLOYERS } from './employers';
import { JOBS } from './jobs';
import { NEEDS } from './needs';

/** Guards for editing the data files: they catch typos and rule-breaking before the screens do. */
describe('sample data integrity', () => {
  it('labels every employer and job as Sample', () => {
    expect([...EMPLOYERS, ...JOBS].every((r) => r.isSample === true)).toBe(true);
  });

  it('uses unique ids', () => {
    expect(new Set(JOBS.map((j) => j.id)).size).toBe(JOBS.length);
    expect(new Set(EMPLOYERS.map((e) => e.id)).size).toBe(EMPLOYERS.length);
    expect(new Set(NEEDS.map((n) => n.id)).size).toBe(NEEDS.length);
  });

  it('points every job at an employer that exists', () => {
    const ids = new Set(EMPLOYERS.map((e) => e.id));
    expect(JOBS.every((j) => ids.has(j.employerId))).toBe(true);
  });

  it('only states commute features that make sense for each step type', () => {
    for (const job of JOBS) {
      for (const step of job.commute) {
        const allowed = COMMUTE_FEATURES_BY_MODE[step.mode];
        for (const key of Object.keys(step.features)) expect(allowed).toContain(key);
      }
    }
  });

  it('has a plain-language label for every feature a need uses', () => {
    for (const need of NEEDS) {
      for (const req of need.requirements) {
        if (req.kind === 'workplace-feature') expect(WORKPLACE_FEATURE_LABEL[req.feature]).toBeTruthy();
        if (req.kind === 'commute-feature') expect(COMMUTE_FEATURE_LABEL[req.feature]).toBeTruthy();
      }
    }
  });

  it('gives every step a positive travel time', () => {
    expect(JOBS.flatMap((j) => j.commute).every((s) => s.minutes > 0)).toBe(true);
  });
});
