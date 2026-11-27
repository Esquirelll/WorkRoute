import { useEffect } from 'react';

/** Sets the browser tab title. It is also what screen readers hear first on a new page. */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} - WorkRoute (prototype)`;
  }, [title]);
}
