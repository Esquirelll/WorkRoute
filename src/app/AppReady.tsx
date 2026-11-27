import { useEffect, useState, type ReactNode } from 'react';
import { LoadingGate } from '../components/LoadingState';

const FONT = '1rem "Atkinson Hyperlegible Next Variable"';
const FONT_GIVE_UP_MS = 3000; // never block the site on a font that will not arrive

/**
 * First-load gate. It waits for something REAL: the self-hosted font, so text does not jump when the font
 * arrives. On a normal connection that is well under 400 ms and nobody sees a loader. On a slow one the
 * loader shows (the plain-HTML one in index.html first, then this one, continuing seamlessly).
 * If the font has not arrived after 3 seconds we carry on with the fallback font.
 *
 * To test it while developing, open the site with ?slow in the address before the #:
 *   http://localhost:5173/?slow#/
 */
export function AppReady({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fontReady: Promise<unknown> = document.fonts
      ? Promise.race([document.fonts.load(FONT), new Promise((resolve) => window.setTimeout(resolve, FONT_GIVE_UP_MS))]).catch(() => undefined)
      : Promise.resolve();
    const devDelay =
      import.meta.env.DEV && new URLSearchParams(window.location.search).has('slow')
        ? new Promise<void>((resolve) => window.setTimeout(resolve, 1800))
        : Promise.resolve();
    Promise.all([fontReady, devDelay]).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <LoadingGate loading={!ready} label="Loading WorkRoute" cards={0} sinceNavigationStart>
      {children}
    </LoadingGate>
  );
}
