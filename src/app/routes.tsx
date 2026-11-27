import { Route, Routes } from 'react-router-dom';
import { Jobs } from '../pages/Jobs';
import { Landing } from '../pages/Landing';
import { LogIn } from '../pages/LogIn';
import { Needs } from '../pages/Needs';
import { NotFound } from '../pages/NotFound';
import { SignUp } from '../pages/SignUp';
import { EMPLOYER_PAGES, SEEKER_PAGES } from './access';
import { lazyPage } from './lazyPage';
import { RequireAuth } from './RequireAuth';
import { AppShell } from './layout/AppShell';

// Pages that are downloaded only when first needed (see lazyPage.tsx). The everyday screens stay in the main file.
export const Account = lazyPage(() => import('../pages/Account').then((m) => m.Account), 'Loading account');
export const Employer = lazyPage(() => import('../pages/Employer').then((m) => m.Employer), 'Loading employer form');
export const JobDetail = lazyPage(() => import('../pages/JobDetail').then((m) => m.JobDetail), 'Loading job');
export const Method = lazyPage(() => import('../pages/Method').then((m) => m.Method), 'Loading the method page');

/** Download the lazy pages quietly once the browser is idle, so later visits are instant. Skipped on data-saver. */
export function preloadLazyPages() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return;
  const run = () => [Method, JobDetail, Account, Employer].forEach((page) => void page.preload().catch(() => undefined));
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(run, { timeout: 6000 });
  else window.setTimeout(run, 3000);
}

/**
 * The route table. HashRouter (see main.tsx) means real addresses look like  /#/jobs
 * The guarded groups use <RequireAuth>, a layout route: its checks run before any page nested inside it.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Landing />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="login" element={<LogIn />} />

        {/* Job seeker pages (the demo admin may open them too) */}
        <Route element={<RequireAuth allow={SEEKER_PAGES} />}>
          <Route path="needs" element={<Needs />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:id" element={<JobDetail />} />
        </Route>

        {/* Employer pages */}
        <Route element={<RequireAuth allow={EMPLOYER_PAGES} />}>
          <Route path="employer" element={<Employer />} />
        </Route>

        <Route path="method" element={<Method />} />
        <Route path="account" element={<Account />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
