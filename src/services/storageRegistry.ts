/**
 * THE LIST OF EVERYTHING WorkRoute stores in the browser, in one place.
 *
 * Every service builds its storage key from STORAGE_KEYS (so nothing can be stored without
 * being named here), and the Method page prints STORED_ITEMS word for word. A test (see
 * storageRegistry.test.ts) performs every action in the app and checks that every key
 * it created is described below. So this list cannot quietly go out of date.
 */
export const STORAGE_KEYS = {
  accounts: 'accounts',
  session: 'session',
  needs: (userId: string) => `needs.${userId}`,
  saved: (userId: string) => `saved.${userId}`,
  employerProfile: (userId: string) => `employerProfile.${userId}`,
};

export type StoredItem = {
  /** Shown to people. "<account id>" stands for the random id of one account. */
  name: string;
  /** Matches the real key (without the "workroute." prefix). Used by the test. */
  pattern: RegExp;
  holds: string;
  personal: 'yes' | 'no';
  written: string;
  removed: string;
};

export const STORED_ITEMS: StoredItem[] = [
  {
    name: 'workroute.accounts',
    pattern: /^accounts$/,
    holds:
      'One record per account in this browser: a random id, your name, your email, your account type, a random salt, a salted password hash (never the password itself) and the time it was created. It also holds the built-in demo admin and, once the demo button has been used, the demo persona (Maria).',
    personal: 'yes',
    written: 'When you sign up; the first time the site opens (the built-in demo admin); and the first time you use “Try demo persona”.',
    removed: 'Your own record is removed by “Delete my account”.',
  },
  {
    name: 'workroute.session',
    pattern: /^session$/,
    holds: 'The random id of the account that is logged in right now.',
    personal: 'no',
    written: 'When you sign up or log in, or start the demo persona.',
    removed: 'When you log out or delete your account.',
  },
  {
    name: 'workroute.needs.<account id>',
    pattern: /^needs\..+$/,
    holds: 'The needs you chose, as short codes (for example “wheelchair”). Needs describe what helps you, not a diagnosis.',
    personal: 'yes',
    written: 'Each time you tick or untick a need.',
    removed: '“Clear my data” or “Delete my account”.',
  },
  {
    name: 'workroute.saved.<account id>',
    pattern: /^saved\..+$/,
    holds: 'The ids of the sample jobs you saved.',
    personal: 'yes',
    written: 'When you save or unsave a job.',
    removed: '“Clear my data” or “Delete my account”.',
  },
  {
    name: 'workroute.employerProfile.<account id>',
    pattern: /^employerProfile\..+$/,
    holds: 'The workplace profile an employer account typed in: workplace name, area, a short note and the status chosen for each accessibility item.',
    personal: 'yes',
    written: 'When an employer account presses “Save profile”.',
    removed: '“Clear my data” or “Delete my account”.',
  },
];

/** Which registry entry describes this stored key? null means "not described" (a bug the test catches). */
export function describeKey(key: string): StoredItem | null {
  return STORED_ITEMS.find((item) => item.pattern.test(key)) ?? null;
}
