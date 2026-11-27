/**
 * Pure rules for WHEN a loading indicator may appear and disappear.
 * No React in here, so it is easy to test (see loadingTiming.test.ts).
 *
 * Rule 1: don't show the loader unless loading lasts longer than `showAfterMs`
 *         (most loads are fast; a flash of loader would just be noise).
 * Rule 2: once the loader is shown, keep it for at least `minVisibleMs`
 *         (so it never flickers on and off).
 */
export type LoaderInput = {
  isLoading: boolean;
  loadingSince: number | null; // timestamp when loading started
  shownAt: number | null; // timestamp when the loader first became visible
  now: number;
};

export type LoaderDecision = {
  visible: boolean;
  /** Ask the caller to check again after this many ms (null = no need). */
  recheckInMs: number | null;
};

export function decideLoader(
  input: LoaderInput,
  rules: { showAfterMs: number; minVisibleMs: number },
): LoaderDecision {
  const { isLoading, loadingSince, shownAt, now } = input;

  if (isLoading) {
    if (shownAt !== null) return { visible: true, recheckInMs: null };
    const waited = loadingSince === null ? 0 : now - loadingSince;
    if (waited >= rules.showAfterMs) return { visible: true, recheckInMs: null };
    return { visible: false, recheckInMs: rules.showAfterMs - waited };
  }

  // Loading finished.
  if (shownAt === null) return { visible: false, recheckInMs: null };
  const remaining = shownAt + rules.minVisibleMs - now;
  if (remaining > 0) return { visible: true, recheckInMs: remaining };
  return { visible: false, recheckInMs: null };
}
