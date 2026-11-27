import { useEffect, useState } from 'react';
import { getCachedCatalog, loadCatalog, type Catalog } from '../services/catalog';

/** Jobs + employers. `loading` is true until they arrive (instantly, for sample data). */
export function useCatalog(): { catalog: Catalog | null; loading: boolean } {
  const [catalog, setCatalog] = useState<Catalog | null>(getCachedCatalog);

  useEffect(() => {
    if (catalog) return;
    let current = true;
    loadCatalog().then((c) => {
      if (current) setCatalog(c);
    });
    return () => {
      current = false; // the screen closed before the data arrived: ignore the late answer
    };
  }, [catalog]);

  return { catalog, loading: catalog === null };
}
