import type { CommuteFeature, CommuteMode } from './types';

/**
 * PROTOTYPE RULES. These are choices made for this demo, not standards or legal definitions.
 * The Method page (Phase 5) states them in plain language.
 */

/** "I need a short commute" means total travel time of at most this many minutes. */
export const SHORT_COMMUTE_MAX_MINUTES = 45;

const VEHICLE_FEATURES: CommuteFeature[] = ['stepFree', 'wheelchairBoarding', 'audioAnnouncements', 'visualAnnouncements'];

/**
 * Which features make sense for which kind of step.
 * Walking has no vehicle to board and no announcements, so only "step-free" applies.
 * A feature that APPLIES but has no data is "not confirmed". One that doesn't apply is ignored.
 */
export const COMMUTE_FEATURES_BY_MODE: Record<CommuteMode, CommuteFeature[]> = {
  walk: ['stepFree'],
  'lrt-mrt': VEHICLE_FEATURES,
  jeepney: VEHICLE_FEATURES,
  bus: VEHICLE_FEATURES,
  tricycle: VEHICLE_FEATURES,
};
