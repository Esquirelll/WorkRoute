import { motion } from 'framer-motion';
import { PAGE_WIDTH } from './pageWidth';
import { Link, NavLink } from 'react-router-dom';
import { AccountMenu } from '../../components/AccountMenu';
import { useAuth } from '../../hooks/useAuth';
import { Logo } from '../../components/Logo';
import { ButtonLink } from '../../components/Button';
import { spring } from '../../motion/motion';
import { getNavItems } from '../navigation';

/** Compact top bar. The links are hidden on phones (the bottom nav takes over). */
export function TopNav() {
  const user = useAuth();
  const navItems = getNavItems(user);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className={`${PAGE_WIDTH} flex min-h-14 flex-wrap items-center gap-x-2 py-1 px-4 sm:px-6`}>
        <Link to="/" className="mr-2 flex min-h-11 items-center rounded-control" aria-label="WorkRoute home">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex flex-wrap items-stretch gap-1">
            {navItems.map((item) => (
              <li key={item.to} className="flex">
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `relative flex min-h-11 items-center px-3 text-base font-bold transition-colors hover:bg-brand-50 ${
                      isActive ? 'text-brand-800' : 'text-muted hover:text-ink'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive && (
                        <motion.span
                          layoutId="top-nav-indicator"
                          transition={spring.snappy}
                          className="absolute inset-x-2 bottom-0 h-[3px] rounded-t-sm bg-brand-600"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {user ? (
            <AccountMenu user={user} />
          ) : (
            <>
              <ButtonLink to="/login" variant="quiet" className="px-2 sm:px-4">
                Log in
              </ButtonLink>
              <ButtonLink to="/signup" className="px-3 sm:px-4">
                Sign up
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
