import { useSyncExternalStore } from 'react';
import { getCurrentUser, subscribe } from '../services/auth';
import type { User } from '../domain/types';

/** The logged-in user (or null). Re-renders the component when someone logs in or out. */
export function useAuth(): User | null {
  return useSyncExternalStore(subscribe, getCurrentUser, () => null);
}
