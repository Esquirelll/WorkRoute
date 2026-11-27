/**
 * THE shared motion file.
 * Every animation in WorkRoute takes its numbers from here, so all movement
 * feels like it belongs to one system. To make the whole site snappier or
 * calmer, change values in this file only.
 *
 * THE PERSONALITY: quick, soft and small. Springs are heavily damped (almost no bounce); movement is
 * never more than a few pixels; nothing takes longer than 0.4 s. The only playful bounce (`lively`) is
 * kept for tiny things: a badge appearing, a saved bookmark, a stepper node.
 *
 * Rules (also in the project notes):
 *  - Animate only `transform` (x, y, scale) and `opacity`. They are cheap for the browser.
 *  - Use SPRINGS for anything the user can trigger or reverse (they can be interrupted
 *    smoothly mid-animation). Use short DURATIONS only for simple fades.
 *  - Never block input while something animates.
 */
import type { Transition, Variants } from 'framer-motion';

/** Springs. stiffness = how hard it pulls to the target, damping = how quickly it stops bouncing. */
export const spring = {
  /** Small, quick things: chips, badges, buttons, menus. */
  snappy: { type: 'spring', stiffness: 520, damping: 38, mass: 0.8 } as Transition,
  /** Cards moving or reordering (layout animations). Soft, almost no bounce. */
  smooth: { type: 'spring', stiffness: 300, damping: 34, mass: 1 } as Transition,
  /** The one place a little bounce is welcome: match score settling, a badge revealing. */
  lively: { type: 'spring', stiffness: 380, damping: 22, mass: 0.9 } as Transition,
  /** Numbers counting up: soft and no overshoot (a score must never briefly read 103%). */
  count: { type: 'spring', stiffness: 140, damping: 30, mass: 1 } as Transition,
};

/** Durations in seconds, for plain fades. Keep short. */
export const duration = {
  instant: 0.08,
  fast: 0.16,
  base: 0.24,
  slow: 0.4,
  loop: 1.4, // one pass of the looping loading indicator
} as const;

/** Delays and staggers in seconds. Use staggering rarely, and cap how many items get it. */
export const delay = {
  stagger: 0.04,
  maxStaggerItems: 6, // items after the 6th appear together, so long lists never feel slow
  reveal: 0.1,
} as const;

/** The time rules for the loading component (milliseconds). */
export const loading = {
  showAfterMs: 400, // only show a loader if waiting is longer than this
  minVisibleMs: 500, // once shown, keep it at least this long so it never flickers
} as const;

/** Easing for non-spring fades. */
export const ease = [0.2, 0, 0, 1] as const;

/* ---------- Reusable variants (named animation states) ---------- */

/** Page transition: a quick fade with a tiny rise. Opacity + transform only. */
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0, transition: { ...spring.smooth } },
  exit: { opacity: 0, transition: { duration: duration.instant } },
};

/** Something that pops in (a badge, a stepper node). `custom` = delay in seconds. */
export const popVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (delayInSeconds: number = 0) => ({ opacity: 1, scale: 1, transition: { ...spring.lively, delay: delayInSeconds } }),
};

/** A small icon that pops when its state changes (the saved bookmark). */
export const iconPopVariants: Variants = {
  hidden: { scale: 0.7 },
  visible: { scale: 1, transition: { ...spring.lively } },
};

/** An inline panel or message appearing in the page: a confirmation question, an error summary, a notice. */
export const panelVariants: Variants = {
  hidden: { opacity: 0, y: -6 },
  visible: { opacity: 1, y: 0, transition: { ...spring.snappy } },
  exit: { opacity: 0, transition: { duration: duration.fast } },
};

/** Menus and small panels. */
export const menuVariants: Variants = {
  hidden: { opacity: 0, y: -6, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { ...spring.snappy } },
  exit: { opacity: 0, y: -4, transition: { duration: duration.fast } },
};

/** Returns the delay for item number `index`, capped so long lists don't drag. */
export function staggerDelay(index: number): number {
  return Math.min(index, delay.maxStaggerItems) * delay.stagger;
}

/**
 * A job card entering or leaving the feed. `custom` is the delay: stagger on first load only,
 * zero when filters change (so rapid filtering stays snappy). Exit is fast and opacity/scale only.
 */
export const cardVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: (delayInSeconds: number = 0) => ({ opacity: 1, y: 0, transition: { ...spring.smooth, delay: delayInSeconds } }),
  exit: { opacity: 0, scale: 0.98, transition: { duration: duration.fast } },
};

/**
 * The commute stepper drawing itself along its path. Each step has a node and the orange line down to the
 * next step. Step number i starts `perStep` seconds after step i-1, and its line starts `lineLead` after its node,
 * so the line seems to travel from stop to stop.
 */
export const stepper = {
  perStep: 0.26,
  lineLead: 0.06,
  maxStaggerSteps: 6,
} as const;

export const stepperNodeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: (step: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { ...spring.lively, delay: Math.min(step, stepper.maxStaggerSteps) * stepper.perStep },
  }),
};

export const stepperLineVariants: Variants = {
  hidden: { scaleY: 0 },
  visible: (step: number = 0) => ({
    scaleY: 1,
    transition: { duration: duration.slow, ease, delay: Math.min(step, stepper.maxStaggerSteps) * stepper.perStep + stepper.lineLead },
  }),
};
