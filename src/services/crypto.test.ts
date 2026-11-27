import { describe, expect, it } from 'vitest';
import { hashPassword, newSalt, verifyPassword } from './crypto';

const FAST = 1000; // few iterations: keeps the test quick (real code uses 210,000)

describe('password hashing', () => {
  it('gives the same hash for the same password and salt', async () => {
    const salt = newSalt();
    expect(await hashPassword('hello world', salt, FAST)).toBe(await hashPassword('hello world', salt, FAST));
  });

  it('gives different hashes for different salts (same password)', async () => {
    expect(await hashPassword('hello world', newSalt(), FAST)).not.toBe(await hashPassword('hello world', newSalt(), FAST));
  });

  it('never contains the password', async () => {
    expect(await hashPassword('hello world', newSalt(), FAST)).not.toContain('hello');
  });

  it('verifies the right password and rejects a wrong one', async () => {
    const salt = newSalt();
    const hash = await hashPassword('hello world', salt, FAST);
    expect(await verifyPassword('hello world', salt, hash, FAST)).toBe(true);
    expect(await verifyPassword('hello WORLD', salt, hash, FAST)).toBe(false);
  });

  it('makes a fresh salt every time', () => {
    expect(newSalt()).not.toBe(newSalt());
  });
});
