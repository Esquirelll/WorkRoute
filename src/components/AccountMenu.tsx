import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ACCOUNT_TYPE_LABEL, type User } from '../domain/types';
import { menuVariants } from '../motion/motion';
import { logOut } from '../services/auth';
import { Button } from './Button';
import { Icon } from './Icon';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((part) => /^\p{L}/u.test(part)) // skip things like "(demo)"
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

/**
 * Account button + dropdown with the person's details and Log out.
 *
 * This is a "disclosure" (a button that shows or hides a panel), not an ARIA "menu".
 * ARIA menus need arrow-key handling and are easy to get wrong; a disclosure works with
 * plain Tab and Enter, which every keyboard and screen-reader user already knows.
 * Closes with: Escape (focus returns to the button), a click outside, or Tab past the end.
 */
export function AccountMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const logOutRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const navigate = useNavigate();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function handlePanelKeyDown(event: KeyboardEvent) {
    // Tabbing past the LAST item (Log out) leaves the panel, so close it.
    if (event.key === 'Tab' && !event.shiftKey && document.activeElement === logOutRef.current) setOpen(false);
  }

  // Log out in TWO steps: first go to the home page, THEN end the session. If we ended the session
  // first, the protected page we are standing on would notice the missing user and bounce us
  // to the Log in page before our own navigation finished.
  function handleLogOut() {
    setOpen(false);
    setLoggingOut(true);
    navigate('/', { state: { notice: 'You have been logged out.' } });
  }

  useEffect(() => {
    if (loggingOut && location.pathname === '/') logOut();
  }, [loggingOut, location.pathname]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={`Account menu, ${user.name}`}
        className="flex min-h-11 items-center gap-2 rounded-control border border-line py-1 pl-1 pr-2 hover:bg-brand-50"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white" aria-hidden="true">
          {initials(user.name)}
        </span>
        <span className="hidden max-w-40 truncate text-sm font-bold sm:block" aria-hidden="true">
          {user.name}
        </span>
        <Icon name="chevronDown" className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="group"
            aria-label="Account"
            onKeyDown={handlePanelKeyDown}
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ transformOrigin: 'top right' }}
            className="absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-1rem)] rounded-card border border-line bg-surface p-3 shadow-float"
          >
            <p className="font-bold">{user.name}</p>
            <p className="break-all text-sm text-muted">{user.email}</p>
            <p className="mt-1 text-sm text-muted">{user.isDemo ? 'Demo persona (fictional)' : ACCOUNT_TYPE_LABEL[user.accountType]}</p>
            {user.accountType === 'admin' && (
              <p className="mt-2 text-sm text-muted">Built-in demo account. It can open every page.</p>
            )}
            <Link
              to="/account"
              onClick={() => setOpen(false)}
              className="mt-3 flex min-h-11 items-center rounded-control px-2 font-bold text-brand-700 underline underline-offset-4 hover:bg-brand-50"
            >
              Account and privacy
            </Link>
            <Button ref={logOutRef} variant="secondary" onClick={handleLogOut} className="mt-1 w-full">
              Log out
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
