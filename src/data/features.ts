import type { CommuteFeature, CommuteMode, WorkplaceFeature } from '../domain/types';

/** Plain-language names for every checkable feature. Central, so the wording is easy to improve. */
export const WORKPLACE_FEATURE_LABEL: Record<WorkplaceFeature, string> = {
  stepFreeEntrance: 'Step-free entrance',
  stepFreeRoutes: 'Step-free route to the work area',
  accessibleRestroom: 'Accessible restroom',
  screenReaderTools: 'Screen-reader-compatible tools',
  captionsAndVisualAlerts: 'Captions and visual alerts',
  quietWorkspace: 'Quiet workspace',
  flexibleHours: 'Flexible hours',
};

/**
 * One plain sentence per workplace feature, shown on the Employer form.
 * These are everyday descriptions, NOT legal or technical standards. WorkRoute checks nothing against any law or standard.
 */
export const WORKPLACE_FEATURE_HELP: Record<WorkplaceFeature, string> = {
  stepFreeEntrance: 'A way in without steps, such as a ramp or a level entrance.',
  stepFreeRoutes: 'A route from the entrance to the work area without stairs, such as a working lift.',
  accessibleRestroom: 'A restroom with extra space and support for people who need it.',
  screenReaderTools: 'Work software and documents that a screen reader can read.',
  captionsAndVisualAlerts: 'Captions in meetings, and visual signals for alarms or announcements.',
  quietWorkspace: 'A place to work with low noise.',
  flexibleHours: 'Flexible start, end or break times.',
};

export const COMMUTE_FEATURE_LABEL: Record<CommuteFeature, string> = {
  stepFree: 'Step-free travel',
  wheelchairBoarding: 'Wheelchair can board',
  audioAnnouncements: 'Stops announced aloud',
  visualAnnouncements: 'Stops shown on a screen',
};

export const COMMUTE_MODE_LABEL: Record<CommuteMode, string> = {
  walk: 'Walk',
  'lrt-mrt': 'LRT/MRT',
  jeepney: 'Jeepney',
  bus: 'Bus',
  tricycle: 'Tricycle',
};
