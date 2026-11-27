import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import { spring } from '../../motion/motion';
import { useAuth } from '../../hooks/useAuth';
import { getNavItems } from '../navigation';

/** Mobile-only bar fixed to the bottom of the screen (thumb-reachable). Hidden from md up. */
export function BottomNav() {
  const navItems = getNavItems(useAuth());
  return (
    <nav
      aria-label="Main (mobile)"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto grid max-w-xl" style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}>
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-xs font-bold ${
                  isActive ? 'text-brand-800' : 'text-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="bottom-nav-indicator"
                      transition={spring.snappy}
                      className="absolute inset-x-4 top-0 h-[3px] rounded-b-sm bg-brand-600"
                    />
                  )}
                  <Icon name={item.icon} />
                  {item.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
