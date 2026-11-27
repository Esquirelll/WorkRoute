/**
 * Form rules as PURE functions (no React, no browser), so they are easy to test.
 * The pages use them to show messages; the auth service uses them again as a safety net,
 * because a rule that only lives in the screen can be skipped.
 *
 * Messages are plain language: say what is wrong and how to fix it.
 */
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;
const NAME_MAX = 80;

export type SignUpField = 'accountType' | 'name' | 'email' | 'password';
export type LogInField = 'identifier' | 'password';
export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export type SignUpValues = { accountType: string; name: string; email: string; password: string };
export type LogInValues = { identifier: string; password: string };

/** Emails are compared in lowercase without surrounding spaces. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** A deliberately simple check: something, an @, something, a dot, a domain ending. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function validateSignUp(values: SignUpValues): FieldErrors<SignUpField> {
  const errors: FieldErrors<SignUpField> = {};

  if (values.accountType !== 'seeker' && values.accountType !== 'employer') {
    errors.accountType = 'Choose whether you are a job seeker or an employer.';
  }

  const name = values.name.trim();
  if (name === '') errors.name = 'Enter your name. It is how WorkRoute greets you.';
  else if (name.length > NAME_MAX) errors.name = `Use ${NAME_MAX} characters or fewer for your name.`;

  const email = values.email.trim();
  if (email === '') errors.email = 'Enter your email address, for example maria@example.com.';
  else if (!isValidEmail(email))
    errors.email = 'That does not look like an email address. It needs an @ and a domain, such as maria@example.com.';

  // Length matters more than fancy symbols, so there are no "must contain a symbol" rules.
  if (values.password === '') errors.password = 'Create a password.';
  else if (values.password.length < PASSWORD_MIN)
    errors.password = `Your password needs at least ${PASSWORD_MIN} characters. It has ${values.password.length}.`;
  else if (values.password.length > PASSWORD_MAX) errors.password = `Use ${PASSWORD_MAX} characters or fewer.`;

  return errors;
}

export function validateLogIn(values: LogInValues): FieldErrors<LogInField> {
  const errors: FieldErrors<LogInField> = {};
  if (values.identifier.trim() === '') errors.identifier = 'Enter your email or username.';
  if (values.password === '') errors.password = 'Enter your password.';
  return errors;
}
