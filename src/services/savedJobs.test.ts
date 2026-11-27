import { describe, expect, it } from 'vitest';
import { clearSaved, getSavedIds, toggleSaved } from './savedJobs';
import { clearMyData } from './privacy';
import { getNeeds, saveNeeds } from './needs';

describe('saved jobs', () => {
  it('toggles on and off, and reports the new state', () => {
    expect(getSavedIds('u1')).toEqual([]);
    expect(toggleSaved('u1', 'j1')).toBe(true);
    expect(toggleSaved('u1', 'j2')).toBe(true);
    expect(getSavedIds('u1')).toEqual(['j1', 'j2']);
    expect(toggleSaved('u1', 'j1')).toBe(false);
    expect(getSavedIds('u1')).toEqual(['j2']);
  });

  it('keeps accounts separate', () => {
    toggleSaved('u2', 'j5');
    expect(getSavedIds('u3')).toEqual([]);
  });

  it('returns the same array until something changes (needed by React)', () => {
    toggleSaved('u4', 'j1');
    expect(getSavedIds('u4')).toBe(getSavedIds('u4'));
  });

  it('is removed by "Clear my data", together with the saved needs', () => {
    toggleSaved('u5', 'j1');
    saveNeeds('u5', ['wheelchair']);
    clearMyData('u5');
    expect(getSavedIds('u5')).toEqual([]);
    expect(getNeeds('u5')).toEqual([]);
  });

  it('clearSaved only affects one account', () => {
    toggleSaved('u6', 'j1');
    toggleSaved('u7', 'j1');
    clearSaved('u6');
    expect(getSavedIds('u6')).toEqual([]);
    expect(getSavedIds('u7')).toEqual(['j1']);
  });
});
