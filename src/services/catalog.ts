/**
 * Where the jobs and employers come from. Today: the sample data files.
 * It is async on purpose: a real backend would fetch() here, and the screens (which already
 * handle "loading") would not have to change. Same idea as the auth service.
 *
 * In development you can see the loading state: open  http://localhost:5173/?slowjobs#/jobs
 */
import { EMPLOYERS } from '../data/employers';
import { JOBS } from '../data/jobs';
import type { Employer, Job } from '../domain/types';

export type Catalog = { jobs: Job[]; employers: Employer[] };

let cached: Catalog | null = null;

/** Already loaded? Screens use this so a second visit shows content immediately. */
export function getCachedCatalog(): Catalog | null {
  return cached;
}

export async function loadCatalog(): Promise<Catalog> {
  const slow = import.meta.env.DEV && typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('slowjobs');
  if (slow) await new Promise((resolve) => setTimeout(resolve, 1500));
  cached = { jobs: JOBS, employers: EMPLOYERS };
  return cached;
}
