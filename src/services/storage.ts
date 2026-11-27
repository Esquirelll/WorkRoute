/**
 * The ONLY file that touches localStorage. Everything else calls these helpers.
 * Why one wrapper: (1) every key gets the same "workroute." prefix, so "Clear my data"
 * can find them all; (2) localStorage can be blocked (private mode, strict settings) or
 * full, and the app should keep working instead of crashing.
 *
 * If real storage is unavailable we fall back to memory: everything still works until the
 * tab is closed. isStoragePersistent() lets a page warn the person about that.
 */
const PREFIX = 'workroute.';
const memory = new Map<string, string>();
let persistent: boolean | null = null;

function realStorage(): Storage | null {
  if (persistent === false) return null;
  try {
    if (typeof window === 'undefined') {
      persistent = false;
      return null;
    }
    const s = window.localStorage;
    s.setItem(`${PREFIX}__test__`, '1');
    s.removeItem(`${PREFIX}__test__`);
    persistent = true;
    return s;
  } catch {
    persistent = false;
    return null;
  }
}

/** True when data will still be there after the tab is closed. */
export function isStoragePersistent(): boolean {
  realStorage();
  return persistent === true;
}

export function readJson<T>(key: string, fallback: T): T {
  const full = PREFIX + key;
  let raw: string | null = null;
  try {
    raw = realStorage()?.getItem(full) ?? memory.get(full) ?? null;
  } catch {
    raw = memory.get(full) ?? null;
  }
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback; // corrupted or hand-edited data: act as if it is empty
  }
}

export function writeJson(key: string, value: unknown): void {
  const full = PREFIX + key;
  const raw = JSON.stringify(value);
  try {
    const s = realStorage();
    if (s) {
      s.setItem(full, raw);
      return;
    }
  } catch {
    persistent = false; // storage full or blocked: keep going in memory
  }
  memory.set(full, raw);
}

export function removeItem(key: string): void {
  const full = PREFIX + key;
  memory.delete(full);
  try {
    realStorage()?.removeItem(full);
  } catch {
    /* nothing to do */
  }
}

/** Is this storage key one of ours? (Used to react to changes made in another tab.) */
export function isOurKey(fullKey: string | null): boolean {
  return fullKey !== null && fullKey.startsWith(PREFIX);
}

/** Every item WorkRoute currently keeps (real storage + in-memory fallback), with its size in characters. */
export function listStoredKeys(): { key: string; size: number }[] {
  const found = new Map<string, number>();
  memory.forEach((value, full) => found.set(full.slice(PREFIX.length), value.length));
  try {
    const s = realStorage();
    if (s) {
      for (let i = 0; i < s.length; i++) {
        const full = s.key(i);
        if (full && full.startsWith(PREFIX) && full !== `${PREFIX}__test__`) {
          found.set(full.slice(PREFIX.length), (s.getItem(full) ?? '').length);
        }
      }
    }
  } catch {
    /* storage unreadable: report what we have */
  }
  return [...found].map(([key, size]) => ({ key, size })).sort((a, b) => a.key.localeCompare(b.key));
}
