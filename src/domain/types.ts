/**
 * Shared types. More arrive in Phase 3 (needs, jobs, matching).
 *
 * The three-value Status is the most important rule in the app:
 * "not-confirmed" is its own value, so "we don't know" can never be shown as "accessible".
 */
export type Status = 'confirmed' | 'not-confirmed' | 'not-available';

/** Which half of the journey a fact belongs to. */
export type Scope = 'workplace' | 'commute';

/**
 * Who an account belongs to. People can only SIGN UP as seeker or employer.
 * 'admin' is a built-in demo account (see services/auth.ts) that can open every page.
 */
export type AccountType = 'seeker' | 'employer' | 'admin';

/** The safe, public view of an account. It never contains a password or hash. */
export type User = {
  id: string;
  name: string;
  email: string;
  accountType: AccountType;
  /** True for the fictional demo persona ("Maria"). It has no password and can only be entered with the demo button. */
  isDemo?: boolean;
};

export const STATUS_LABEL: Record<Status, string> = {
  confirmed: 'Confirmed',
  'not-confirmed': 'Not confirmed',
  'not-available': 'Not available',
};

export const SCOPE_LABEL: Record<Scope, string> = {
  workplace: 'Workplace',
  commute: 'Commute',
};

export const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  seeker: 'Job seeker',
  employer: 'Employer',
  admin: 'Admin (demo)',
};

/* =====================  Phase 3: needs, jobs, matching  ===================== */

/** What a person needs. Always a FUNCTIONAL need ("cannot use stairs"), never a diagnosis. */
export type NeedId =
  | 'wheelchair'
  | 'no-stairs'
  | 'screen-reader'
  | 'captions-alerts'
  | 'quiet-workspace'
  | 'flexible-hours'
  | 'short-commute'
  | 'accessible-restroom';

/** Things an employer can state about the WORKPLACE. */
export type WorkplaceFeature =
  | 'stepFreeEntrance'
  | 'stepFreeRoutes'
  | 'accessibleRestroom'
  | 'screenReaderTools'
  | 'captionsAndVisualAlerts'
  | 'quietWorkspace'
  | 'flexibleHours';

/** Things that can be true (or not) about ONE step of the commute. */
export type CommuteFeature = 'stepFree' | 'wheelchairBoarding' | 'audioAnnouncements' | 'visualAnnouncements';

export type CommuteMode = 'walk' | 'lrt-mrt' | 'jeepney' | 'bus' | 'tricycle';

/**
 * One thing to check for a need. A "discriminated union": the `kind` field says which shape it is,
 * and TypeScript then knows which other fields exist.
 */
export type Requirement =
  | { kind: 'workplace-feature'; feature: WorkplaceFeature }
  | { kind: 'commute-feature'; feature: CommuteFeature } // judged by the WEAKEST step of the journey
  | { kind: 'commute-time' }; // total travel time against the prototype's limit

export type Need = {
  id: NeedId;
  label: string; // what the person sees: "I use a wheelchair"
  description: string; // one plain-language line about what we check
  requirements: Requirement[];
};

/**
 * Every record below carries `isSample: true`. The type only allows `true`, so a record
 * can never be created without the label. The screens show a "Sample" tag for it.
 */
export type Employer = {
  id: string;
  name: string; // fictional
  about: string;
  isSample: true;
};

export type CommuteStep = {
  mode: CommuteMode;
  description: string; // fictional place names
  minutes: number; // fictional estimate
  /** A feature missing here counts as NOT CONFIRMED (never as accessible). */
  features: Partial<Record<CommuteFeature, Status>>;
};

export type Job = {
  id: string;
  title: string;
  employerId: string;
  area: string;
  arrangement: 'on-site' | 'hybrid';
  summary: string;
  /** A feature missing here counts as NOT CONFIRMED (never as accessible). */
  workplace: Partial<Record<WorkplaceFeature, Status>>;
  commute: CommuteStep[]; // in order, door to door. Empty = no commute information.
  isSample: true;
};

/** One line of the "Why this match?" explanation. */
export type RequirementCheck = {
  scope: Scope;
  label: string; // "Step-free entrance"
  status: Status;
  explanation: string; // plain-language reason
  /** For commute checks that are not confirmed: which step (0 = first) is the weakest. */
  stepIndex?: number;
};

export type NeedResult = {
  need: NeedId;
  label: string;
  status: Status; // the WORST status among its checks
  checks: RequirementCheck[];
};

export type MatchResult = {
  jobId: string;
  /** Percent of chosen needs that are fully confirmed (0-100). null when no needs are chosen. */
  score: number | null;
  /** True when at least one chosen need is NOT AVAILABLE at this job. */
  excluded: boolean;
  met: NeedId[]; // every check confirmed
  unconfirmed: NeedId[]; // nothing blocked, but something is not confirmed
  blocked: NeedId[]; // something is not available
  needResults: NeedResult[]; // the "Why this match?" detail
  /** Worst status among the chosen needs' workplace checks. null = none of the chosen needs checks the workplace. */
  workplaceBadge: Status | null;
  /** Same for the commute. */
  commuteBadge: Status | null;
  summary: string; // one sentence for the card
};
