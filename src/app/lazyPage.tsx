import { useEffect, useState, type ComponentType } from 'react';
import { Button } from '../components/Button';
import { LoadingGate } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';

/**
 * Code-splitting: a page that is downloaded only when it is first needed, so the first visit is lighter.
 *
 *   const Method = lazyPage(() => import('../pages/Method').then((m) => m.Method), 'Loading the method page');
 *
 * While the page's code downloads, the SAME loading component as everywhere else is used (shown only after
 * 400 ms, kept at least 500 ms). Once downloaded, the page is cached, so visiting it again is instant.
 * If the download fails (offline), the person gets a clear message and a Try again button.
 */
export type LazyPage = ComponentType & { preload: () => Promise<unknown> };

export function lazyPage(load: () => Promise<ComponentType>, label = 'Loading page'): LazyPage {
  let cached: ComponentType | null = null;
  let inFlight: Promise<ComponentType> | null = null;

  const preload = () => {
    if (cached) return Promise.resolve(cached);
    inFlight ??= load().then(
      (component) => {
        cached = component;
        return component;
      },
      (error) => {
        inFlight = null; // allow a later retry
        throw error;
      },
    );
    return inFlight;
  };

  function LazyPageComponent() {
    const [Component, setComponent] = useState<ComponentType | null>(() => cached);
    const [failed, setFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
      if (Component) return;
      let current = true;
      setFailed(false);
      preload().then(
        (loaded) => current && setComponent(() => loaded),
        () => current && setFailed(true),
      );
      return () => {
        current = false;
      };
    }, [Component, attempt]);

    if (failed) {
      return (
        <>
          <PageHeader title="This page did not load">Check your internet connection, then try again.</PageHeader>
          <Button onClick={() => setAttempt((n) => n + 1)}>Try again</Button>
        </>
      );
    }
    return (
      <LoadingGate loading={Component === null} label={label} cards={2}>
        {Component ? <Component /> : null}
      </LoadingGate>
    );
  }

  return Object.assign(LazyPageComponent, { preload });
}
