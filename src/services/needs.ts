/**
 * Saved needs, per account, in this browser only (localStorage key "workroute.needs.<userId>").
 * Two accounts on one browser never see each other's needs because each has its own key.
 *
 * Same shape as the auth service: screens call these functions and subscribe to changes.
 */
import { NEEDS } from '../data/needs';
import type { NeedId } from '../domain/types';
import { isOurKey, readJson, removeItem, writeJson } from './storage';
import { STORAGE_KEYS } from './storageRegistry';

const keyFor = STORAGE_KEYS.needs;

const cache = new Map<string, NeedId[]>(); // keeps the SAME array until something changes
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

/** Keep only known ids, once each, in catalog order. Protects against edited or old data. */
function clean(value: unknown): NeedId[] {
  const list = Array.isArray(value) ? value : [];
  return NEEDS.map((n) => n.id).filter((id) => list.includes(id));
}

export function getNeeds(userId: string): NeedId[] {
  let value = cache.get(userId);
  if (!value) {
    value = clean(readJson<unknown>(keyFor(userId), []));
    cache.set(userId, value);
  }
  return value;
}

export function saveNeeds(userId: string, needs: NeedId[]): void {
  const value = clean(needs);
  writeJson(keyFor(userId), value);
  cache.set(userId, value);
  notify();
}

export function clearNeeds(userId: string): void {
  removeItem(keyFor(userId));
  cache.set(userId, []);
  notify();
}

export function subscribeNeeds(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Changed in another tab? Forget what we remember and re-read.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (isOurKey(event.key)) {
      cache.clear();
      notify();
    }
  });
}
