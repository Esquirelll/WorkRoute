import { MotionConfig } from 'framer-motion';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { AppReady } from './app/AppReady';
import { AppRoutes, preloadLazyPages } from './app/routes';
import { initAuth } from './services/auth';
import './styles/index.css';

// Create the built-in demo admin account if it does not exist yet (runs in the background).
void initAuth();
// After the first screen is up and the browser is idle, fetch the rest quietly.
window.addEventListener('load', () => window.setTimeout(preloadLazyPages, 1500), { once: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* reducedMotion="user": if the device asks for less motion, Framer Motion turns off movement
        (transform) animations everywhere automatically. Opacity fades are kept. */}
    <MotionConfig reducedMotion="user">
      <HashRouter>
        <AppReady>
          <AppRoutes />
        </AppReady>
      </HashRouter>
    </MotionConfig>
  </StrictMode>,
);
