import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { AccountType } from '../domain/types';
import { useAuth } from '../hooks/useAuth';
import { NoAccess } from '../pages/NoAccess';

/**
 * Route guard. Used as a "layout route": every route nested inside it must pass this check.
 *   - Not logged in      -> polite redirect to Log in (and we remember where they were going).
 *   - Wrong account type -> a plain explanation page, not a blank screen.
 *   - Allowed            -> <Outlet /> shows the real page.
 *
 * IMPORTANT: this controls what the SCREEN shows. It is not security. The pages and sample
 * data are still inside the downloaded JavaScript. A real product checks on a server.
 */
export function RequireAuth({ allow }: { allow: AccountType[] }) {
  const user = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname, reason: 'login-required' }} />;
  }
  if (!allow.includes(user.accountType)) return <NoAccess user={user} allow={allow} />;
  return <Outlet />;
}
