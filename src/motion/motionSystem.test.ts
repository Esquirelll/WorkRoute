import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { delay, duration, ease, loading, spring } from './motion';

/**
 * GUARDRAILS FOR "ONE MOTION SYSTEM".
 * These tests read the source files as plain text and fail if someone sneaks a private animation
 * number into a component. All timing has to come from src/motion/motion.ts.
 */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) && !/\.test\./.test(name) ? [path] : [];
  });
}

const files = sourceFiles('src').filter((f) => !f.replace(/\\/g, '/').endsWith('src/motion/motion.ts'));

describe('one shared motion file', () => {
  it('keeps spring physics (stiffness, damping) only in motion.ts', () => {
    const offenders = files.filter((f) => /stiffness|damping|type:\s*['"]spring['"]/.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('has no inline transition objects in components (use spring.* or a variant from motion.ts)', () => {
    const offenders = files.filter((f) => /transition=\{\{|transition:\s*\{/.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('has no hard-coded animation durations or delays outside motion.ts', () => {
    const offenders = files.filter((f) => /\b(duration|delay)\s*:\s*[0-9.]/.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });
});

describe('plain CSS transitions match the motion file', () => {
  const css = readFileSync('src/styles/index.css', 'utf8');

  it('uses the same duration as duration.fast', () => {
    const ms = Number(/--default-transition-duration:\s*(\d+)ms/.exec(css)?.[1]);
    expect(ms).toBe(Math.round(duration.fast * 1000));
  });

  it('uses the same easing curve as ease', () => {
    const match = /--default-transition-timing-function:\s*cubic-bezier\(([^)]+)\)/.exec(css);
    expect(match?.[1]?.split(',').map(Number)).toEqual([...ease]);
  });

  it('switches off CSS animation and transitions for reduced motion', () => {
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
    expect(css).toMatch(/animation-duration:\s*0\.01ms\s*!important/);
    expect(css).toMatch(/transition-duration:\s*0\.01ms\s*!important/);
  });
});

describe('the personality of the system', () => {
  it('keeps every plain duration short (nothing over 0.4 s)', () => {
    const plain = [duration.instant, duration.fast, duration.base, duration.slow];
    expect(Math.max(...plain)).toBeLessThanOrEqual(0.4);
  });

  it('keeps springs heavily damped, except the one playful spring', () => {
    // damping ratio = damping / (2 * sqrt(stiffness * mass)). 1 = no overshoot at all.
    type Physics = { stiffness: number; damping: number; mass: number };
    const ratio = (t: unknown) => {
      const s = t as Physics;
      return s.damping / (2 * Math.sqrt(s.stiffness * s.mass));
    };
    expect(ratio(spring.smooth)).toBeGreaterThan(0.95);
    expect(ratio(spring.snappy)).toBeGreaterThan(0.85);
    expect(ratio(spring.count)).toBeGreaterThanOrEqual(1); // a score must never overshoot
    expect(ratio(spring.lively)).toBeGreaterThan(0.5); // some bounce, but small
    expect(ratio(spring.lively)).toBeLessThan(0.85);
  });

  it('shows a loader only after 400 ms and keeps it at least 500 ms', () => {
    expect(loading.showAfterMs).toBe(400);
    expect(loading.minVisibleMs).toBe(500);
  });

  it('limits staggering', () => {
    expect(delay.maxStaggerItems).toBeLessThanOrEqual(6);
  });
});
