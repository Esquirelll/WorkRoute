import { SHORT_COMMUTE_MAX_MINUTES } from '../domain/rules';
import type { Need } from '../domain/types';

/**
 * The needs catalog: what each need means in terms of checks.
 * This is the "rule table" of the matching engine. Wording is plain and functional;
 * no diagnosis is ever asked for. All checks run against SAMPLE data.
 */
export const NEEDS: Need[] = [
  {
    id: 'wheelchair',
    label: 'I use a wheelchair',
    description: 'We check for a step-free entrance and route at work, and step-free travel where the wheelchair can board.',
    requirements: [
      { kind: 'workplace-feature', feature: 'stepFreeEntrance' },
      { kind: 'workplace-feature', feature: 'stepFreeRoutes' },
      { kind: 'commute-feature', feature: 'stepFree' },
      { kind: 'commute-feature', feature: 'wheelchairBoarding' },
    ],
  },
  {
    id: 'no-stairs',
    label: 'I cannot use stairs',
    description: 'We check for step-free entrances and routes at work, and no stairs along the commute.',
    requirements: [
      { kind: 'workplace-feature', feature: 'stepFreeEntrance' },
      { kind: 'workplace-feature', feature: 'stepFreeRoutes' },
      { kind: 'commute-feature', feature: 'stepFree' },
    ],
  },
  {
    id: 'screen-reader',
    label: 'I use a screen reader',
    description: 'We check that work tools are screen-reader-compatible, and that stops are announced aloud.',
    requirements: [
      { kind: 'workplace-feature', feature: 'screenReaderTools' },
      { kind: 'commute-feature', feature: 'audioAnnouncements' },
    ],
  },
  {
    id: 'captions-alerts',
    label: 'I need captions or visual alerts',
    description: 'We check for captions and visual alerts at work, and stops shown on a screen.',
    requirements: [
      { kind: 'workplace-feature', feature: 'captionsAndVisualAlerts' },
      { kind: 'commute-feature', feature: 'visualAnnouncements' },
    ],
  },
  {
    id: 'quiet-workspace',
    label: 'I need a quiet workspace',
    description: 'We check whether the workplace has a quiet place to work.',
    requirements: [{ kind: 'workplace-feature', feature: 'quietWorkspace' }],
  },
  {
    id: 'flexible-hours',
    label: 'I need flexible hours',
    description: 'We check whether the employer offers flexible working hours.',
    requirements: [{ kind: 'workplace-feature', feature: 'flexibleHours' }],
  },
  {
    id: 'short-commute',
    label: 'I need a short commute',
    description: `We compare the total travel time with a limit of ${SHORT_COMMUTE_MAX_MINUTES} minutes. This is a prototype rule, using sample times.`,
    requirements: [{ kind: 'commute-time' }],
  },
  {
    id: 'accessible-restroom',
    label: 'I need an accessible restroom',
    description: 'We check whether the workplace has an accessible restroom.',
    requirements: [{ kind: 'workplace-feature', feature: 'accessibleRestroom' }],
  },
];
