import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * index.html contains a small inline style for the plain-HTML loader that shows before the app starts.
 * Styles written directly in the page are NOT inside Tailwind's cascade layers, so they beat the app's own
 * base styles. A color or font set on html/body there once turned every heading gray. This test keeps it from happening again.
 */
describe('index.html boot styles', () => {
  const html = readFileSync('index.html', 'utf8');
  const style = /<style>([\s\S]*?)<\/style>/.exec(html)?.[1] ?? '';

  it('does not set text color or font on html or body', () => {
    const rule = /html\s*,\s*body\s*\{([^}]*)\}/.exec(style)?.[1] ?? '';
    expect(rule).not.toMatch(/(^|[;\s])color\s*:/);
    expect(rule).not.toMatch(/font/);
  });

  it('keeps the loader invisible for the first 400 ms', () => {
    expect(style).toMatch(/animation:\s*boot-in\s+1ms\s+linear\s+400ms\s+forwards/);
  });

  it('switches the loader animation off for reduced motion', () => {
    expect(style).toMatch(/prefers-reduced-motion:\s*reduce[\s\S]*boot-dot\s*\{\s*animation:\s*none/);
  });
});
