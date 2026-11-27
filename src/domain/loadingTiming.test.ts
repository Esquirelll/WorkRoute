import { describe, expect, it } from 'vitest';
import { decideLoader } from './loadingTiming';

const rules = { showAfterMs: 400, minVisibleMs: 500 };

describe('decideLoader', () => {
  it('stays hidden while loading is still quick', () => {
    const r = decideLoader({ isLoading: true, loadingSince: 0, shownAt: null, now: 100 }, rules);
    expect(r.visible).toBe(false);
    expect(r.recheckInMs).toBe(300); // check again when 400 ms have passed
  });

  it('appears once loading has lasted 400 ms', () => {
    const r = decideLoader({ isLoading: true, loadingSince: 0, shownAt: null, now: 400 }, rules);
    expect(r.visible).toBe(true);
  });

  it('never appears if loading finishes before 400 ms', () => {
    const r = decideLoader({ isLoading: false, loadingSince: 0, shownAt: null, now: 350 }, rules);
    expect(r.visible).toBe(false);
  });

  it('stays visible for at least 500 ms after it appeared', () => {
    const r = decideLoader({ isLoading: false, loadingSince: 0, shownAt: 400, now: 600 }, rules);
    expect(r.visible).toBe(true);
    expect(r.recheckInMs).toBe(300); // 400 + 500 - 600
  });

  it('hides after the minimum visible time has passed', () => {
    const r = decideLoader({ isLoading: false, loadingSince: 0, shownAt: 400, now: 900 }, rules);
    expect(r.visible).toBe(false);
  });
});
