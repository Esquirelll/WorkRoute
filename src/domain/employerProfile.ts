/**
 * The employer's accessibility profile: what an employer states about their workplace.
 * Pure helpers (no React, no browser), so they are easy to test.
 *
 * Same safety rule as everywhere: every feature starts as "not confirmed", and "confirmed"
 * is something the employer has to choose on purpose.
 */
import { WORKPLACE_FEATURE_LABEL } from '../data/features';
import type { Status, WorkplaceFeature } from './types';

export const WORKPLACE_FEATURES = Object.keys(WORKPLACE_FEATURE_LABEL) as WorkplaceFeature[];
export const NOTE_MAX = 300;
const NAME_MAX = 80;

export type EmployerProfile = {
  workplaceName: string;
  area: string;
  note: string;
  features: Record<WorkplaceFeature, Status>;
};

export type ProfileField = 'workplaceName' | 'area' | 'note';

export function defaultFeatures(): Record<WorkplaceFeature, Status> {
  return Object.fromEntries(WORKPLACE_FEATURES.map((f) => [f, 'not-confirmed'])) as Record<WorkplaceFeature, Status>;
}

export function emptyProfile(): EmployerProfile {
  return { workplaceName: '', area: '', note: '', features: defaultFeatures() };
}

export function validateProfile(profile: EmployerProfile): Partial<Record<ProfileField, string>> {
  const errors: Partial<Record<ProfileField, string>> = {};
  const name = profile.workplaceName.trim();
  if (name === '') errors.workplaceName = 'Enter a workplace name. Please use a made-up one, not a real company.';
  else if (name.length > NAME_MAX) errors.workplaceName = `Use ${NAME_MAX} characters or fewer.`;
  if (profile.area.trim() === '') errors.area = 'Enter the area, for example a city name.';
  if (profile.note.length > NOTE_MAX) errors.note = `Use ${NOTE_MAX} characters or fewer. It is ${profile.note.length} now.`;
  return errors;
}

/** How many features have each status. Used for the one-line summary in the preview. */
export function summarize(features: Record<WorkplaceFeature, Status>): Record<Status, number> {
  const counts: Record<Status, number> = { confirmed: 0, 'not-confirmed': 0, 'not-available': 0 };
  for (const feature of WORKPLACE_FEATURES) counts[features[feature]] += 1;
  return counts;
}

/** Accept only well-formed saved data. Anything missing or odd falls back to "not confirmed". */
export function cleanProfile(value: unknown): EmployerProfile | null {
  if (typeof value !== 'object' || value === null) return null;
  const v = value as Record<string, unknown>;
  const features = defaultFeatures();
  const given = typeof v.features === 'object' && v.features !== null ? (v.features as Record<string, unknown>) : {};
  for (const f of WORKPLACE_FEATURES) {
    const s = given[f];
    if (s === 'confirmed' || s === 'not-confirmed' || s === 'not-available') features[f] = s;
  }
  return {
    workplaceName: typeof v.workplaceName === 'string' ? v.workplaceName : '',
    area: typeof v.area === 'string' ? v.area : '',
    note: typeof v.note === 'string' ? v.note.slice(0, NOTE_MAX) : '',
    features,
  };
}
