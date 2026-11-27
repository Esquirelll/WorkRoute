/**
 * THE AUTH SERVICE (simulated).
 *
 * Pages only ever call these functions:
 *   signUp(input)            -> create an account and log in
 *   logIn(identifier, pass)  -> log in with email (or the demo username)
 *   logOut()                 -> end the session
 *   getCurrentUser()         -> who is logged in right now (or null)
 * (+ subscribe(), so screens re-draw when that changes.)
 *
 * A real backend would replace THIS FILE ONLY. The pages would not change.
 *
 * REMINDER: this is a simulation. Accounts live in this browser's localStorage, so anyone
 * who can open this browser's developer tools can read, edit or delete them. See crypto.ts.
 */
import type { AccountType, NeedId, User } from '../domain/types';
import { normalizeEmail, validateSignUp, type SignUpField } from '../domain/validation';
import { hashPassword, HASH_ITERATIONS, isCryptoAvailable, newSalt, verifyPassword } from './crypto';
import { saveNeeds } from './needs';
import { clearMyData } from './privacy';
import { isOurKey, readJson, removeItem, writeJson } from './storage';
import { STORAGE_KEYS } from './storageRegistry';

/* ---------- The built-in demo admin ----------
 * Requested for the demo. This password is written right here in the source code, and
 * therefore also in the website's JavaScript: ANYONE can read it. That is fine for a
 * prototype with sample data and would be a serious hole in a real product.
 * It is stored hashed like every other account; only the SEEDING needs the plain text.
 */
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '123456';

const ACCOUNTS_KEY = STORAGE_KEYS.accounts;
const SESSION_KEY = STORAGE_KEYS.session;

/** What is saved in the browser. Note: a salt and a hash, never the password. */
type StoredAccount = {
  id: string;
  name: string;
  email: string;
  username?: string; // only the demo admin has one
  isDemo?: boolean; // the fictional demo persona
  passwordless?: boolean; // true = no password exists, so the log-in form can never open this account
  accountType: AccountType;
  salt: string;
  hash: string;
  iterations: number;
  createdAt: string;
};

export type AuthError = {
  code: 'invalid-input' | 'email-taken' | 'invalid-credentials' | 'crypto-unavailable';
  message: string;
  field?: SignUpField;
};
export type AuthResult = { ok: true; user: User } | { ok: false; error: AuthError };

export type SignUpInput = { accountType: string; name: string; email: string; password: string };

/* ---------- Reading accounts safely ---------- */

function isStoredAccount(value: unknown): value is StoredAccount {
  if (typeof value !== 'object' || value === null) return false;
  const a = value as Record<string, unknown>;
  return (
    typeof a.id === 'string' &&
    typeof a.name === 'string' &&
    typeof a.email === 'string' &&
    typeof a.salt === 'string' &&
    typeof a.hash === 'string' &&
    typeof a.iterations === 'number' &&
    (a.accountType === 'seeker' || a.accountType === 'employer' || a.accountType === 'admin')
  );
}

function loadAccounts(): StoredAccount[] {
  const value = readJson<unknown>(ACCOUNTS_KEY, []);
  return Array.isArray(value) ? value.filter(isStoredAccount) : [];
}

function toUser(a: StoredAccount): User {
  return { id: a.id, name: a.name, email: a.email, accountType: a.accountType, ...(a.isDemo ? { isDemo: true } : {}) };
}

/* ---------- Current user + change notifications ---------- */

let cachedUser: User | null | undefined; // undefined = not read yet
const listeners = new Set<() => void>();

function readCurrentUser(): User | null {
  const session = readJson<{ userId?: string } | null>(SESSION_KEY, null);
  if (!session?.userId) return null;
  const account = loadAccounts().find((a) => a.id === session.userId);
  return account ? toUser(account) : null;
}

function refresh(): void {
  cachedUser = readCurrentUser();
  listeners.forEach((l) => l());
}

export function getCurrentUser(): User | null {
  if (cachedUser === undefined) cachedUser = readCurrentUser();
  return cachedUser; // the same object each time until something changes
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// If the person logs in or out in ANOTHER tab, follow along here.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (isOurKey(event.key)) refresh();
  });
}

/* ---------- Setup: the demo admin ---------- */

let seeding: Promise<void> | null = null;

async function seedAdmin(): Promise<void> {
  try {
    const salt = newSalt();
    const hash = await hashPassword(ADMIN_PASSWORD, salt);
    const latest = loadAccounts(); // re-read: something may have been saved while we were hashing
    if (latest.some((a) => a.username === ADMIN_USERNAME)) return;
    writeJson(ACCOUNTS_KEY, [
      ...latest,
      {
        id: 'demo-admin',
        name: 'Admin (demo)',
        email: 'admin@workroute.sample',
        username: ADMIN_USERNAME,
        accountType: 'admin',
        salt,
        hash,
        iterations: HASH_ITERATIONS,
        createdAt: new Date().toISOString(),
      } satisfies StoredAccount,
    ]);
  } catch {
    console.warn('WorkRoute: could not create the demo admin account.');
  }
}

/** Call once when the app starts. Safe to call again; it only seeds when the admin is missing. */
export function initAuth(): Promise<void> {
  if (!isCryptoAvailable() || loadAccounts().some((a) => a.username === ADMIN_USERNAME)) return Promise.resolve();
  seeding ??= seedAdmin().finally(() => {
    seeding = null;
  });
  return seeding;
}

/* ---------- The four public functions ---------- */

const CRYPTO_ERROR: AuthError = {
  code: 'crypto-unavailable',
  message: 'This browser cannot create accounts on this address. Open the site from https:// or localhost.',
};

export async function signUp(input: SignUpInput): Promise<AuthResult> {
  if (!isCryptoAvailable()) return { ok: false, error: CRYPTO_ERROR };
  await initAuth();

  // Safety net: the form already checked these, but never trust only the screen.
  const problems = validateSignUp(input);
  const firstField = (Object.keys(problems) as SignUpField[])[0];
  if (firstField) return { ok: false, error: { code: 'invalid-input', message: problems[firstField]!, field: firstField } };

  const email = normalizeEmail(input.email);
  if (loadAccounts().some((a) => a.email === email)) {
    return {
      ok: false,
      error: { code: 'email-taken', field: 'email', message: 'An account with this email already exists in this browser. Try logging in instead.' },
    };
  }

  const salt = newSalt();
  const hash = await hashPassword(input.password, salt);
  const account: StoredAccount = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email,
    accountType: input.accountType as AccountType, // validated above: only seeker or employer
    salt,
    hash,
    iterations: HASH_ITERATIONS,
    createdAt: new Date().toISOString(),
  };

  // Re-read right before saving, in case another tab added an account while we were hashing.
  const latest = loadAccounts();
  if (latest.some((a) => a.email === email)) {
    return { ok: false, error: { code: 'email-taken', field: 'email', message: 'An account with this email already exists in this browser. Try logging in instead.' } };
  }
  writeJson(ACCOUNTS_KEY, [...latest, account]);
  writeJson(SESSION_KEY, { userId: account.id });
  refresh();
  return { ok: true, user: toUser(account) };
}

const BAD_CREDENTIALS: AuthError = {
  code: 'invalid-credentials',
  message: 'That email, username or password does not match. Check both and try again.',
};

export async function logIn(identifier: string, password: string): Promise<AuthResult> {
  if (!isCryptoAvailable()) return { ok: false, error: CRYPTO_ERROR };
  await initAuth();

  const id = identifier.trim().toLowerCase();
  const account = loadAccounts().find((a) => a.email === id || a.username === id);

  if (!account || account.passwordless) {
    // Still do the same slow work, so "no such account" and "wrong password" take equally long.
    await hashPassword(password, newSalt());
    return { ok: false, error: BAD_CREDENTIALS };
  }
  if (!(await verifyPassword(password, account.salt, account.hash, account.iterations))) {
    return { ok: false, error: BAD_CREDENTIALS }; // one message for both cases, on purpose
  }

  writeJson(SESSION_KEY, { userId: account.id });
  refresh();
  return { ok: true, user: toUser(account) };
}

export function logOut(): void {
  removeItem(SESSION_KEY);
  refresh();
}

/* ---------- Demo persona: Maria ----------
 * A fictional wheelchair user for demos. She has NO password: her account can only be opened with
 * the "Try demo persona" button, never with the log-in form. Each time the button is used, her data
 * is reset to the same starting point, so every demo (or video take) begins identically.
 */
const DEMO_ID = 'demo-maria';
export const DEMO_NEEDS: NeedId[] = ['wheelchair', 'accessible-restroom'];

export function startDemoPersona(): User {
  const accounts = loadAccounts();
  let account = accounts.find((a) => a.id === DEMO_ID);
  if (!account) {
    account = {
      id: DEMO_ID,
      name: 'Maria (demo)',
      email: 'maria@demo.workroute.sample',
      accountType: 'seeker',
      isDemo: true,
      passwordless: true,
      salt: '',
      hash: '',
      iterations: 0,
      createdAt: new Date().toISOString(),
    };
    writeJson(ACCOUNTS_KEY, [...accounts, account]);
  }
  clearMyData(DEMO_ID); // back to the starting point: no saved jobs ...
  saveNeeds(DEMO_ID, DEMO_NEEDS); // ... and her needs already chosen
  writeJson(SESSION_KEY, { userId: DEMO_ID });
  refresh();
  return toUser(account);
}

/* ---------- Deleting an account ---------- */

export type DeleteResult = { ok: true } | { ok: false; reason: 'not-logged-in' | 'protected' };

/**
 * Removes the logged-in account AND everything saved for it, then logs out.
 * The built-in demo admin and the demo persona are protected (they are recreated automatically anyway).
 */
export function deleteAccount(): DeleteResult {
  const user = getCurrentUser();
  if (!user) return { ok: false, reason: 'not-logged-in' };
  const accounts = loadAccounts();
  const account = accounts.find((a) => a.id === user.id);
  if (!account || account.username === ADMIN_USERNAME || account.isDemo) return { ok: false, reason: 'protected' };

  writeJson(ACCOUNTS_KEY, accounts.filter((a) => a.id !== user.id));
  clearMyData(user.id);
  removeItem(SESSION_KEY);
  refresh();
  return { ok: true };
}
