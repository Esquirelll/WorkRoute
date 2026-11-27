import type { AccountType, User } from '../domain/types';

/** Which account types may open which group of pages. The demo admin can open everything. */
export const SEEKER_PAGES: AccountType[] = ['seeker', 'admin'];
export const EMPLOYER_PAGES: AccountType[] = ['employer', 'admin'];

/** Where each kind of account lands after logging in or signing up. */
export function homeFor(user: User): string {
  if (user.accountType === 'employer') return '/employer';
  if (user.accountType === 'seeker') return '/needs';
  return '/jobs';
}

/** Can this user open this address? Used to send people back to the page they were trying to reach. */
export function canOpen(user: User, path: string): boolean {
  if (path.startsWith('/needs') || path.startsWith('/jobs')) return SEEKER_PAGES.includes(user.accountType);
  if (path.startsWith('/employer')) return EMPLOYER_PAGES.includes(user.accountType);
  return true;
}
