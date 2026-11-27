/**
 * The saved employer profile, per account, in this browser only. Nothing is sent anywhere,
 * and it is NOT shown to job seekers: the Jobs feed uses the sample data files.
 */
import { cleanProfile, type EmployerProfile } from '../domain/employerProfile';
import { readJson, removeItem, writeJson } from './storage';
import { STORAGE_KEYS } from './storageRegistry';

export function getEmployerProfile(userId: string): EmployerProfile | null {
  return cleanProfile(readJson<unknown>(STORAGE_KEYS.employerProfile(userId), null));
}

export function saveEmployerProfile(userId: string, profile: EmployerProfile): void {
  writeJson(STORAGE_KEYS.employerProfile(userId), {
    ...profile,
    workplaceName: profile.workplaceName.trim(),
    area: profile.area.trim(),
    note: profile.note.trim(),
  });
}

export function clearEmployerProfile(userId: string): void {
  removeItem(STORAGE_KEYS.employerProfile(userId));
}
