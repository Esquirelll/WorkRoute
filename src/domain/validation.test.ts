import { describe, expect, it } from 'vitest';
import { isValidEmail, normalizeEmail, validateLogIn, validateSignUp } from './validation';

const good = { accountType: 'seeker', name: 'Maria Santos', email: 'maria@example.com', password: 'correct horse' };

describe('validateSignUp', () => {
  it('accepts good input', () => {
    expect(validateSignUp(good)).toEqual({});
  });

  it('asks for an account type, and refuses "admin"', () => {
    expect(validateSignUp({ ...good, accountType: '' }).accountType).toBeDefined();
    expect(validateSignUp({ ...good, accountType: 'admin' }).accountType).toBeDefined();
  });

  it('accepts both employer and seeker', () => {
    expect(validateSignUp({ ...good, accountType: 'employer' })).toEqual({});
  });

  it('rejects a blank name and a bad email', () => {
    const errors = validateSignUp({ ...good, name: '   ', email: 'maria@' });
    expect(errors.name).toBeDefined();
    expect(errors.email).toBeDefined();
  });

  it('enforces the password length and says how many characters were entered', () => {
    expect(validateSignUp({ ...good, password: 'short' }).password).toContain('5');
    expect(validateSignUp({ ...good, password: '12345678' }).password).toBeUndefined();
  });
});

describe('validateLogIn', () => {
  it('needs both fields', () => {
    expect(Object.keys(validateLogIn({ identifier: '', password: '' }))).toHaveLength(2);
    expect(validateLogIn({ identifier: 'admin', password: 'x' })).toEqual({});
  });
});

describe('email helpers', () => {
  it('normalizes case and spaces', () => {
    expect(normalizeEmail('  Maria@Example.COM ')).toBe('maria@example.com');
  });
  it('checks basic shape', () => {
    expect(isValidEmail('a@b.co')).toBe(true);
    expect(isValidEmail('a b@c.com')).toBe(false);
    expect(isValidEmail('abc')).toBe(false);
  });
});
