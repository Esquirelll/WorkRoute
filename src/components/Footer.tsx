import { Link } from 'react-router-dom';
import { PAGE_WIDTH } from '../app/layout/pageWidth';
import { useAuth } from '../hooks/useAuth';

/** Small site footer: the sample-data reminder and the privacy links are always one click away. */
export function Footer() {
  const user = useAuth();
  return (
    <footer className="border-t border-line bg-surface pb-24 md:pb-0">
      <div className={`${PAGE_WIDTH} flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-4 text-sm sm:px-6`}>
        <p className="text-muted">WorkRoute is a student prototype. Every employer, job and route is sample data.</p>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-4">
            <li>
              <Link to="/method" className="inline-flex min-h-11 items-center font-bold text-brand-700 underline underline-offset-4">
                Method and sample data
              </Link>
            </li>
            {user && (
              <li>
                <Link to="/account" className="inline-flex min-h-11 items-center font-bold text-brand-700 underline underline-offset-4">
                  Account and privacy
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
