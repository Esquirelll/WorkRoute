import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Colour-contrast guard (WCAG 2.2 AA). It reads the design tokens from index.css and checks the pairs the
 * interface really uses, so a future colour change that breaks accessibility fails a test instead of shipping.
 *   - text needs 4.5:1
 *   - the EDGES of controls (inputs, chips, choice cards), icons and focus rings need 3:1
 */
const css = readFileSync('src/styles/index.css', 'utf8');
const token = (name: string): string => {
  const hex = new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css)?.[1];
  if (!hex) throw new Error(`token --color-${name} not found`);
  return hex;
};

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

describe('text contrast (4.5:1)', () => {
  const pairs: [string, string, string][] = [
    ['ink', 'surface', 'body text on cards'],
    ['ink', 'page', 'body text on the page'],
    ['muted', 'surface', 'secondary text on cards'],
    ['muted', 'page', 'secondary text on the page'],
    ['muted', 'brand-50', 'secondary text on tinted panels'],
    ['surface', 'brand-600', 'primary button and selected chip'],
    ['surface', 'brand-700', 'primary button hover'],
    ['brand-700', 'surface', 'links'],
    ['brand-700', 'brand-50', 'link and button hover'],
    ['ok', 'ok-bg', 'confirmed badge'],
    ['warn', 'warn-bg', 'not confirmed badge'],
    ['no', 'no-bg', 'not available badge and errors'],
    ['ok', 'surface', 'saved message'],
    ['no', 'surface', 'error text on cards'],
  ];
  it.each(pairs)('%s on %s (%s)', (fg, bg) => {
    expect(contrast(token(fg), token(bg))).toBeGreaterThanOrEqual(4.5);
  });
});

describe('non-text contrast (3:1)', () => {
  const pairs: [string, string, string][] = [
    ['line-strong', 'surface', 'edge of an input on a card'],
    ['line-strong', 'page', 'edge of a chip on the page'],
    ['line-strong', 'brand-50', 'edge of a hovered choice card'],
    ['brand-600', 'page', 'focus ring on the page'],
    ['brand-600', 'surface', 'focus ring on a card'],
    ['route-500', 'surface', 'commute line and icons'],
    ['route-500', 'route-100', 'commute node'],
    ['ok', 'ok-bg', 'confirmed icon'],
    ['warn', 'warn-bg', 'not confirmed icon'],
    ['no', 'no-bg', 'not available icon'],
  ];
  it.each(pairs)('%s on %s (%s)', (fg, bg) => {
    expect(contrast(token(fg), token(bg))).toBeGreaterThanOrEqual(3);
  });
});
