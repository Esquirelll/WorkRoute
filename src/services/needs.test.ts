import { describe, expect, it } from 'vitest';
import { clearNeeds, getNeeds, saveNeeds } from './needs';
import { writeJson } from './storage';

describe('saved needs', () => {
  it('starts empty and saves per account', () => {
    expect(getNeeds('maria')).toEqual([]);
    saveNeeds('maria', ['wheelchair', 'quiet-workspace']);
    expect(getNeeds('maria')).toEqual(['wheelchair', 'quiet-workspace']);
  });

  it('keeps accounts separate', () => {
    saveNeeds('maria', ['wheelchair']);
    expect(getNeeds('carlo')).toEqual([]);
  });

  it('drops unknown ids and duplicates, and keeps catalog order', () => {
    saveNeeds('maria', ['quiet-workspace', 'banana' as never, 'wheelchair', 'wheelchair']);
    expect(getNeeds('maria')).toEqual(['wheelchair', 'quiet-workspace']);
  });

  it('returns the same array object until something changes (needed by React)', () => {
    saveNeeds('maria', ['wheelchair']);
    expect(getNeeds('maria')).toBe(getNeeds('maria'));
  });

  it('clears only that account', () => {
    saveNeeds('maria', ['wheelchair']);
    saveNeeds('carlo', ['flexible-hours']);
    clearNeeds('maria');
    expect(getNeeds('maria')).toEqual([]);
    expect(getNeeds('carlo')).toEqual(['flexible-hours']);
  });

  it('survives corrupted stored data', () => {
    writeJson('needs.broken', { not: 'a list' });
    expect(getNeeds('broken')).toEqual([]);
  });
});
