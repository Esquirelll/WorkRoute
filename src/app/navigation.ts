import type { IconName } from '../components/Icon';
import type { AccountType, User } from '../domain/types';
import { EMPLOYER_PAGES, SEEKER_PAGES } from './access';

export type NavItem = {
  to: string;
  label: string;
  icon: IconName;
  end?: boolean;
  /** Which account types see this link. Omit = everyone, including logged-out visitors. */
  for?: AccountType[];
};

const allItems: NavItem[] = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/jobs', label: 'Jobs', icon: 'jobs', for: SEEKER_PAGES },
  { to: '/needs', label: 'My needs', icon: 'needs', for: SEEKER_PAGES },
  { to: '/employer', label: 'Employer', icon: 'employer', for: EMPLOYER_PAGES },
  { to: '/method', label: 'Method', icon: 'method' },
];

/** One list feeds BOTH the top navigation and the mobile bottom navigation. */
export function getNavItems(user: User | null): NavItem[] {
  return allItems.filter((item) => !item.for || (user !== null && item.for.includes(user.accountType)));
}
