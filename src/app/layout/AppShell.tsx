import { AnimatePresence, motion } from 'framer-motion';
import { PAGE_WIDTH } from './pageWidth';
import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Footer } from '../../components/Footer';
import { Notice } from '../../components/Notice';
import { pageVariants, panelVariants } from '../../motion/motion';
import { BottomNav } from './BottomNav';
import { TopNav } from './TopNav';

/**
 * The frame around every page: skip link, top nav, <main>, mobile bottom nav.
 *
 * Landmarks (header / nav / main) let screen-reader users jump straight to sections.
 * On every route change we move keyboard focus to the new page's <h1>, because a
 * single-page app doesn't reload the page, so screen readers would otherwise hear nothing.
 */
export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const isFirstRender = useRef(true);

  // One-time messages passed with navigate(..., { state: { notice } }), e.g. "You have been logged out."
  // We keep the text in state, remember which page it belongs to, and clear the history entry
  // so it does not reappear if the page is refreshed.
  const [flash, setFlash] = useState<{ text: string; path: string } | null>(null);
  useEffect(() => {
    const text = (location.state as { notice?: string } | null)?.notice;
    if (text) {
      setFlash({ text, path: location.pathname });
      navigate(location.pathname + location.search, { replace: true, state: null });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <>
      <a href="#main" className="skip-link" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>
        Skip to main content
      </a>
      <TopNav />
      <main id="main" tabIndex={-1} className={`${PAGE_WIDTH} px-4 pb-10 pt-6 outline-none sm:px-6 md:pb-12`}>
        {/* A live region that always exists, so screen readers announce text added to it. */}
        <div role="status" className="empty:hidden mb-4">
          <AnimatePresence>
            {flash && flash.path === location.pathname && (
              <motion.div key={flash.text} variants={panelVariants} initial="hidden" animate="visible" exit="exit">
                <Notice tone="success">{flash.text}</Notice>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* key={pathname} replays the enter animation on each new page. Opacity + transform only. */}
        <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="enter">
          <Outlet />
        </motion.div>
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}
