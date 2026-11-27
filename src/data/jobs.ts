import type { CommuteFeature, CommuteMode, CommuteStep, Job, Status } from '../domain/types';

/**
 * SAMPLE DATA. Every job, stop, route, time and accessibility statement below is invented for
 * the prototype. Real kinds of transport are used (LRT/MRT, jeepney, bus, tricycle) but no real
 * station, route or schedule is described. Replace this file with verified data later.
 *
 * Short names so the table below stays readable:
 */
const OK: Status = 'confirmed';
const UNSURE: Status = 'not-confirmed';
const NO: Status = 'not-available';

type VehicleFeatures = Record<CommuteFeature, Status>;
const all = (stepFree: Status, wheelchairBoarding: Status, audioAnnouncements: Status, visualAnnouncements: Status): VehicleFeatures => ({
  stepFree,
  wheelchairBoarding,
  audioAnnouncements,
  visualAnnouncements,
});

const walk = (description: string, minutes: number, stepFree: Status): CommuteStep => ({
  mode: 'walk',
  description,
  minutes,
  features: { stepFree },
});

const ride = (mode: Exclude<CommuteMode, 'walk'>, description: string, minutes: number, features: VehicleFeatures): CommuteStep => ({
  mode,
  description,
  minutes,
  features,
});

export const JOBS: Job[] = [
  {
    id: 'j1',
    title: 'Data Entry Associate',
    employerId: 'tigib',
    area: 'Pasig',
    arrangement: 'on-site',
    summary: 'Enter and check records from scanned forms. Quiet, steady work.',
    workplace: {
      stepFreeEntrance: OK,
      stepFreeRoutes: OK,
      accessibleRestroom: OK,
      screenReaderTools: UNSURE,
      captionsAndVisualAlerts: OK,
      quietWorkspace: OK,
      flexibleHours: NO,
    },
    commute: [
      walk('Sample starting point to Ilog Station', 6, OK),
      ride('lrt-mrt', 'Ilog Station to Lunsod Station', 18, all(OK, OK, OK, OK)),
      walk('Lunsod Station to the office', 5, OK),
    ],
    isSample: true,
  },
  {
    id: 'j2',
    title: 'Chat Support Agent',
    employerId: 'hanay',
    area: 'Makati',
    arrangement: 'hybrid',
    summary: 'Answer customer chats. Two days a week in the office, the rest from home.',
    workplace: {
      stepFreeEntrance: OK,
      stepFreeRoutes: UNSURE,
      accessibleRestroom: UNSURE,
      screenReaderTools: OK,
      captionsAndVisualAlerts: OK,
      quietWorkspace: NO,
      flexibleHours: OK,
    },
    commute: [
      ride('tricycle', 'Sample starting point to Dapit Terminal', 10, all(NO, NO, NO, NO)),
      ride('bus', 'Dapit Terminal to the Hanay building stop', 25, all(UNSURE, UNSURE, OK, OK)),
      walk('Bus stop to the office', 4, OK),
    ],
    isSample: true,
  },
  {
    id: 'j3',
    title: 'Production Assistant',
    employerId: 'lambat',
    area: 'Mandaluyong',
    arrangement: 'on-site',
    summary: 'Help prepare print jobs on the studio floor.',
    workplace: {
      stepFreeEntrance: NO,
      stepFreeRoutes: NO,
      accessibleRestroom: NO,
      screenReaderTools: UNSURE,
      captionsAndVisualAlerts: OK,
      quietWorkspace: NO,
      flexibleHours: UNSURE,
    },
    commute: [
      ride('jeepney', 'Sample starting point to Lambat corner', 22, all(NO, NO, NO, NO)),
      walk('Footbridge with stairs to the studio', 7, NO),
    ],
    isSample: true,
  },
  {
    id: 'j4',
    title: 'Learning Coordinator',
    employerId: 'pinto',
    area: 'Quezon City',
    arrangement: 'hybrid',
    summary: 'Schedule classes and support tutors. Three office days a week.',
    workplace: {
      stepFreeEntrance: OK,
      stepFreeRoutes: OK,
      accessibleRestroom: OK,
      screenReaderTools: OK,
      captionsAndVisualAlerts: UNSURE,
      quietWorkspace: OK,
      flexibleHours: OK,
    },
    commute: [
      walk('Sample starting point to Tala Station', 8, OK),
      ride('lrt-mrt', 'Tala Station to Bukid Station', 24, all(OK, OK, OK, UNSURE)),
      ride('bus', 'Bukid Station to the Pinto hub stop', 15, all(OK, UNSURE, OK, OK)),
    ],
    isSample: true,
  },
  {
    id: 'j5',
    title: 'Bookkeeping Clerk',
    employerId: 'sinag',
    area: 'Manila',
    arrangement: 'on-site',
    summary: 'Keep ledgers and prepare monthly summaries.',
    workplace: {
      stepFreeEntrance: OK,
      stepFreeRoutes: OK,
      accessibleRestroom: UNSURE,
      screenReaderTools: UNSURE,
      captionsAndVisualAlerts: OK,
      quietWorkspace: OK,
      flexibleHours: NO,
    },
    commute: [
      walk('Sample starting point to Alon Station', 10, OK),
      ride('lrt-mrt', 'Alon Station to Sentro Station', 35, all(OK, OK, OK, OK)),
      ride('bus', 'Sentro Station to the Sinag building', 20, all(OK, OK, UNSURE, OK)),
      walk('Bus stop to the office', 5, OK),
    ],
    isSample: true,
  },
  {
    id: 'j6',
    title: 'Quality Checker',
    employerId: 'tigib',
    area: 'Pasig',
    arrangement: 'on-site',
    summary: 'Review finished records for mistakes before they go out.',
    workplace: {
      stepFreeEntrance: OK,
      stepFreeRoutes: OK,
      accessibleRestroom: OK,
      screenReaderTools: NO,
      captionsAndVisualAlerts: OK,
      quietWorkspace: UNSURE,
      flexibleHours: OK,
    },
    commute: [
      walk('Sample starting point to Bayan stop', 12, OK),
      ride('bus', 'Bayan stop to the Tigib office stop', 20, all(OK, OK, OK, OK)),
      walk('Bus stop to the office', 3, OK),
    ],
    isSample: true,
  },
  {
    id: 'j7',
    title: 'Records Clerk',
    employerId: 'sinag',
    area: 'Taguig',
    arrangement: 'hybrid',
    summary: 'File and look up records. The employer has shared very little accessibility information so far.',
    // Only three things were provided. Everything else is missing, which counts as NOT CONFIRMED.
    workplace: {
      stepFreeEntrance: OK,
      quietWorkspace: UNSURE,
      flexibleHours: OK,
    },
    commute: [], // no commute information at all
    isSample: true,
  },
  {
    id: 'j8',
    title: 'Layout Artist',
    employerId: 'lambat',
    area: 'Mandaluyong',
    arrangement: 'hybrid',
    summary: 'Prepare page layouts for print. Mostly from home, two days on-site.',
    workplace: {
      stepFreeEntrance: NO,
      stepFreeRoutes: NO,
      accessibleRestroom: UNSURE,
      screenReaderTools: OK,
      captionsAndVisualAlerts: OK,
      quietWorkspace: OK,
      flexibleHours: OK,
    },
    commute: [
      walk('Sample starting point to Ilaw Station', 5, OK),
      ride('lrt-mrt', 'Ilaw Station to Silong Station', 15, all(OK, OK, OK, OK)),
      walk('Silong Station to the studio', 6, OK),
    ],
    isSample: true,
  },
];
