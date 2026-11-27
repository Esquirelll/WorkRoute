import { describe, expect, it } from 'vitest';
import { getCurrentUser, initAuth, logIn, logOut, signUp } from './auth';
import { readJson } from './storage';

// In Node there is no localStorage, so storage.ts uses its in-memory fallback.
// That lets us test the whole service without a browser.

const maria = { accountType: 'seeker', name: 'Maria Santos', email: 'maria@example.com', password: 'correct horse' };

describe('auth service', () => {
  it('signs up, logs the person in, and exposes only safe fields', async () => {
    const result = await signUp(maria);
    expect(result.ok).toBe(true);
    expect(getCurrentUser()?.email).toBe('maria@example.com');
    expect(getCurrentUser()).not.toHaveProperty('hash');
  });

  it('stores a salted hash, never the password', async () => {
    const stored = JSON.stringify(readJson('accounts', []));
    expect(stored).not.toContain('correct horse');
    expect(stored).toContain('"salt"');
    expect(stored).toContain('"hash"');
  });

  it('refuses a duplicate email (even with different capital letters)', async () => {
    const result = await signUp({ ...maria, email: 'MARIA@example.com' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('email-taken');
  });

  it('cannot sign up as admin', async () => {
    const result = await signUp({ ...maria, email: 'sneaky@example.com', accountType: 'admin' });
    expect(result.ok).toBe(false);
  });

  it('logs out, then logs in again with the right password', async () => {
    logOut();
    expect(getCurrentUser()).toBeNull();
    const result = await logIn('Maria@Example.com', 'correct horse');
    expect(result.ok).toBe(true);
    expect(getCurrentUser()?.accountType).toBe('seeker');
  });

  it('rejects a wrong password with one generic message', async () => {
    logOut();
    const wrong = await logIn('maria@example.com', 'wrong password');
    const missing = await logIn('nobody@example.com', 'whatever123');
    expect(wrong.ok).toBe(false);
    expect(missing.ok).toBe(false);
    if (!wrong.ok && !missing.ok) expect(wrong.error.message).toBe(missing.error.message);
    expect(getCurrentUser()).toBeNull();
  });

  it('has a demo admin who logs in with the username', async () => {
    await initAuth();
    const result = await logIn('admin', '123456');
    expect(result.ok).toBe(true);
    expect(getCurrentUser()?.accountType).toBe('admin');
    expect(JSON.stringify(readJson('accounts', []))).not.toContain('"123456"');
    logOut();
  });
});
