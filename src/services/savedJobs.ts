/**
 * Saved jobs, per account, in this browser only (localStorage key "workroute.saved.<userId>").
 * Same pattern as saved needs: functions + subscribe, with a cache that keeps the same array
 * until something changes.
 */
import { isOurKey, readJson, removeItem, writeJson } from './storage';
import { STORAGE_KEYS } from './storageRegistry';

const keyFor = STORAGE_KEYS.saved;
const cache = new Map<string, string[]>();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function clean(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((v): v is string => typeof v === 'string'))] : [];
}

export function getSavedIds(userId: string): string[] {
  let value = cache.get(userId);
  if (!value) {
    value = clean(readJson<unknown>(keyFor(userId), []));
    cache.set(userId, value);
  }
  return value;
}

/** Saves the job if it is not saved, removes it if it is. Returns true if it is now saved. */
export function toggleSaved(userId: string, jobId: string): boolean {
  const current = getSavedIds(userId);
  const nowSaved = !current.includes(jobId);
  const next = nowSaved ? [...current, jobId] : current.filter((id) => id !== jobId);
  writeJson(keyFor(userId), next);
  cache.set(userId, next);
  notify();
  return nowSaved;
}

export function clearSaved(userId: string): void {
  removeItem(keyFor(userId));
  cache.set(userId, []);
  notify();
}

export function subscribeSaved(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (isOurKey(event.key)) {
      cache.clear();
      notify();
    }
  });
}
