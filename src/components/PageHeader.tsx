import type { ReactNode } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';

/**
 * Every page starts with this: it sets the tab title and renders the <h1>.
 * tabIndex={-1} lets the app move focus here after navigation (see AppShell)
 * without making the heading a stop in the normal Tab order.
 */
export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  usePageTitle(title);
  return (
    <div className="mb-6">
      <h1 tabIndex={-1} className="text-2xl outline-none sm:text-3xl">
        {title}
      </h1>
      {children && <div className="mt-2 text-lg text-muted">{children}</div>}
    </div>
  );
}
