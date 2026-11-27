import { clearEmployerProfile } from './employerProfile';
import { clearNeeds } from './needs';
import { clearSaved } from './savedJobs';

/**
 * "Clear my data": removes this account's saved information from this browser:
 * chosen needs, saved jobs and (for employers) the workplace profile.
 * The ACCOUNT itself (name, email, password hash) stays, so the person can still log in.
 * "Delete my account" (auth.ts) calls this too, then removes the account record as well.
 */
export function clearMyData(userId: string): void {
  clearNeeds(userId);
  clearSaved(userId);
  clearEmployerProfile(userId);
}
