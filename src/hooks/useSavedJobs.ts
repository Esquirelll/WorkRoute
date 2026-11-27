import { useSyncExternalStore } from 'react';
import { getSavedIds, subscribeSaved } from '../services/savedJobs';

export function useSavedJobs(userId: string): string[] {
  return useSyncExternalStore(subscribeSaved, () => getSavedIds(userId));
}
