import { animate, useMotionValue, useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { spring } from '../motion/motion';

/**
 * A number that counts up from 0 (only when `intro` is true at the moment it first appears).
 * If `value` changes later, it glides from where it is to the new number, even mid-count (interruptible).
 *
 * The visible, moving digits are hidden from screen readers; a plain "value" text is read instead,
 * so nobody hears "12... 34... 56..." as it counts.
 */
export function CountUp({ value, intro }: { value: number; intro: boolean }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const startsAtZero = intro && !reduce;
  const initialText = useRef(String(startsAtZero ? 0 : value)).current; // React renders this once
  const motionValue = useMotionValue(startsAtZero ? 0 : value);

  // Write the number straight into the page, without re-rendering React on every frame.
  useEffect(() => motionValue.on('change', (v) => {
    if (ref.current) ref.current.textContent = String(Math.round(v));
  }), [motionValue]);

  useEffect(() => {
    if (reduce) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, spring.count);
    return () => controls.stop();
  }, [value, reduce, motionValue]);

  return (
    <>
      <span ref={ref} aria-hidden="true">
        {initialText}
      </span>
      <span className="sr-only">{value}</span>
    </>
  );
}
