/**
 * Password hashing with the browser's built-in Web Crypto API (no extra library).
 *
 * WHAT THIS DOES: turns a password into a one-way "fingerprint" (a hash) so the password
 * itself is never written to storage.
 *  - PBKDF2 repeats the scrambling HASH_ITERATIONS times, so each guess is slow to try.
 *  - A random SALT is mixed in, so two people with the same password get different hashes.
 *
 * WHAT THIS DOES NOT DO: protect anything on a shared or compromised device. The hash,
 * salt and the code that checks them all live in the same browser. Real security needs a
 * server. This simulates the shape of it.
 */
export const HASH_ITERATIONS = 210_000; // OWASP's guidance for PBKDF2 with SHA-512

const encoder = new TextEncoder();

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function fromBase64(text: string): Uint8Array<ArrayBuffer> {
  const binary = atob(text);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** True when Web Crypto is usable. It needs https:// or localhost (a "secure context"). */
export function isCryptoAvailable(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
}

/** 16 random bytes, as text. Make a NEW salt for every account. */
export function newSalt(): string {
  return toBase64(crypto.getRandomValues(new Uint8Array(16)));
}

export async function hashPassword(
  password: string,
  salt: string,
  iterations: number = HASH_ITERATIONS,
): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-512', salt: fromBase64(salt), iterations },
    key,
    512,
  );
  return toHex(new Uint8Array(bits));
}

/** Compare without stopping at the first difference (a habit that matters on real servers). */
function sameText(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifyPassword(
  password: string,
  salt: string,
  expectedHash: string,
  iterations: number = HASH_ITERATIONS,
): Promise<boolean> {
  return sameText(await hashPassword(password, salt, iterations), expectedHash);
}
