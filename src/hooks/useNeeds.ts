import { useSyncExternalStore } from 'react';
import type { NeedId } from '../domain/types';
import { getNeeds, subscribeNeeds } from '../services/needs';

/** The needs saved for this account. Re-renders when they change (here or in another component). */
export function useNeeds(userId: string): NeedId[] {
  return useSyncExternalStore(subscribeNeeds, () => getNeeds(userId));
}
