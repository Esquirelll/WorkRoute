import { useEffect, useRef, useState } from 'react';
import { decideLoader } from '../domain/loadingTiming';
import { loading } from '../motion/motion';

/**
 * Turns "is something loading?" into "should a loader be on screen?".
 * Rules (from loadingTiming.ts): wait ~400 ms before showing, then keep it ~500 ms minimum.
 * Fast loads never show a loader at all.
 */
export function useDelayedLoading(isLoading: boolean, options: { sinceNavigationStart?: boolean } = {}): boolean {
  // On the very first render of a slow first load the loader must already be there: starting hidden would
  // leave one blank frame between the plain-HTML loader in index.html and this one (a flicker).
  const [visible, setVisible] = useState(() => Boolean(options.sinceNavigationStart && isLoading && performance.now() >= loading.showAfterMs));
  const loadingSince = useRef<number | null>(null);
  const shownAt = useRef<number | null>(null);

  useEffect(() => {
    let timer: number | undefined;

    if (isLoading && loadingSince.current === null) {
      // First load of the whole site: the wait began when the page started loading (performance.now() counts
      // from then), and the plain-HTML loader in index.html has been on screen since the 400 ms mark.
      loadingSince.current = options.sinceNavigationStart ? 0 : performance.now();
      if (options.sinceNavigationStart && performance.now() >= loading.showAfterMs) shownAt.current = loading.showAfterMs;
    }

    const evaluate = () => {
      const now = performance.now();
      const decision = decideLoader(
        { isLoading, loadingSince: loadingSince.current, shownAt: shownAt.current, now },
        loading,
      );
      if (decision.visible && shownAt.current === null) shownAt.current = now;
      if (!decision.visible && !isLoading) {
        // Cycle finished: reset for the next time something loads.
        loadingSince.current = null;
        shownAt.current = null;
      }
      setVisible(decision.visible);
      if (decision.recheckInMs !== null) timer = window.setTimeout(evaluate, decision.recheckInMs);
    };

    evaluate();
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  return visible;
}
