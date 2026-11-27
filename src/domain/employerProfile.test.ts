import { describe, expect, it } from 'vitest';
import { cleanProfile, defaultFeatures, emptyProfile, NOTE_MAX, summarize, validateProfile, WORKPLACE_FEATURES } from './employerProfile';

describe('employer profile', () => {
  it('starts with EVERY feature "not confirmed" (confirmed must be chosen on purpose)', () => {
    const features = defaultFeatures();
    expect(WORKPLACE_FEATURES.every((f) => features[f] === 'not-confirmed')).toBe(true);
    expect(WORKPLACE_FEATURES).toHaveLength(7);
  });

  it('needs a workplace name and an area', () => {
    const errors = validateProfile(emptyProfile());
    expect(errors.workplaceName).toBeDefined();
    expect(errors.area).toBeDefined();
    expect(validateProfile({ ...emptyProfile(), workplaceName: 'Made-up Works', area: 'Pasig' })).toEqual({});
  });

  it('limits the note length and says how long it is', () => {
    const errors = validateProfile({ ...emptyProfile(), workplaceName: 'X', area: 'Y', note: 'a'.repeat(NOTE_MAX + 1) });
    expect(errors.note).toContain(String(NOTE_MAX + 1));
  });

  it('counts statuses for the one-line summary', () => {
    const features = { ...defaultFeatures(), stepFreeEntrance: 'confirmed', quietWorkspace: 'confirmed', flexibleHours: 'not-available' } as const;
    expect(summarize({ ...features })).toEqual({ confirmed: 2, 'not-confirmed': 4, 'not-available': 1 });
  });

  it('cleans stored data: unknown or missing statuses fall back to "not confirmed", never to "confirmed"', () => {
    const profile = cleanProfile({ workplaceName: 'A', area: 'B', features: { stepFreeEntrance: 'confirmed', quietWorkspace: 'banana' } })!;
    expect(profile.features.stepFreeEntrance).toBe('confirmed');
    expect(profile.features.quietWorkspace).toBe('not-confirmed');
    expect(profile.features.flexibleHours).toBe('not-confirmed');
    expect(cleanProfile('nonsense')).toBeNull();
  });
});
