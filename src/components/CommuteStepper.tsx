import { motion, useReducedMotion } from 'framer-motion';
import { COMMUTE_FEATURE_LABEL, COMMUTE_MODE_LABEL } from '../data/features';
import { totalCommuteMinutes } from '../domain/matching';
import { COMMUTE_FEATURES_BY_MODE } from '../domain/rules';
import type { Employer, Job, MatchResult } from '../domain/types';
import { stepperLineVariants, stepperNodeVariants } from '../motion/motion';
import { StatusBadge } from './AccessBadge';
import { ModeIcon } from './ModeIcon';
import { StatusIcon } from './StatusIcon';

/**
 * The commute as an ordered list of steps, joined by an orange line that DRAWS ITSELF stop by stop
 * as the list scrolls into view: each node pops, and the line down to the next one grows from top to bottom.
 * One <ol> triggers everything (`whileInView`), and the steps follow in order (see `stepper` in motion.ts).
 * With reduced motion, delays are zero and the movement is switched off, so it simply appears.
 *
 * It is a real <ol>, so screen readers announce "list, 4 items" and the step numbers.
 */
export function CommuteStepper({ job, employer, result }: { job: Job; employer: Employer; result: MatchResult }) {
  const total = totalCommuteMinutes(job);
  const reduce = useReducedMotion();
  const at = (step: number) => (reduce ? 0 : step); // `custom` = which step this is; 0 = no delay

  if (job.commute.length === 0) {
    return (
      <div className="flex items-start gap-3">
        <StatusBadge status="not-confirmed" />
        <p className="text-sm">The sample data has no commute steps for this job, so the commute is not confirmed. Ask the employer how people usually travel here.</p>
      </div>
    );
  }

  // Problems that affect THIS person's needs, grouped by the step they come from.
  const problems = new Map<number, { need: string; label: string; status: 'not-confirmed' | 'not-available' }[]>();
  for (const need of result.needResults) {
    for (const check of need.checks) {
      if (check.scope === 'commute' && check.stepIndex !== undefined && check.status !== 'confirmed') {
        const list = problems.get(check.stepIndex) ?? [];
        list.push({ need: need.label, label: check.label, status: check.status });
        problems.set(check.stepIndex, list);
      }
    }
  }

  return (
    <div>
      <p className="mb-4 font-bold">
        About <span className="tnum">{total}</span> minutes in total <span className="text-sm font-normal text-muted">(sample estimate)</span>
      </p>

      <motion.ol initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
        {job.commute.map((step, index) => {
          const applicable = COMMUTE_FEATURES_BY_MODE[step.mode];
          const affecting = problems.get(index) ?? [];
          return (
            <li key={index} className="relative flex gap-4 pb-6">
              {/* The line down to the next step. It grows from the top. */}
              <motion.span
                aria-hidden="true"
                variants={stepperLineVariants}
                custom={at(index)}
                style={{ originY: 0 }}
                className="absolute bottom-0 left-[1.0625rem] top-10 w-[3px] rounded-full bg-route-500"
              />
              <motion.span
                variants={stepperNodeVariants}
                custom={at(index)}
                className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-route-500 bg-route-100 text-route-500"
              >
                <ModeIcon mode={step.mode} />
              </motion.span>
              <div className="min-w-0 flex-1">
                <p className="font-bold">
                  Step {index + 1}: {COMMUTE_MODE_LABEL[step.mode]} <span className="font-normal text-muted">· about {step.minutes} min</span>
                </p>
                <p className="text-sm text-muted">{step.description}</p>

                <ul className="mt-2 flex flex-col gap-1.5">
                  {applicable.map((feature) => (
                    <li key={feature} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
                      <span>{COMMUTE_FEATURE_LABEL[feature]}</span>
                      <StatusBadge status={step.features[feature] ?? 'not-confirmed'} />
                    </li>
                  ))}
                </ul>

                {affecting.length > 0 && (
                  <div className="mt-2 rounded-control border border-line-strong bg-page px-3 py-2 text-sm">
                    <p className="font-bold">This step affects your needs:</p>
                    <ul className="mt-0.5 list-disc pl-5">
                      {affecting.map((p, i) => (
                        <li key={i}>
                          {p.need}: {p.label} is {p.status === 'not-available' ? 'not available' : 'not confirmed'}.
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </li>
          );
        })}

        {/* The destination: the blue square from the logo. It pops last, when the line reaches it. */}
        <li className="flex gap-4">
          <span className="relative z-10 flex size-9 shrink-0 items-center justify-center" aria-hidden="true">
            <motion.span variants={stepperNodeVariants} custom={at(job.commute.length)} className="size-7 rounded-md bg-brand-600" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-bold">Arrive at {employer.name}</p>
            <p className="text-sm text-muted">{job.area} · sample location</p>
          </div>
        </li>
      </motion.ol>

      {result.commuteBadge === 'not-available' && (
        <p className="mt-4 flex items-start gap-2 text-sm font-bold text-no">
          <StatusIcon status="not-available" className="mt-0.5 size-4" />A step on this route is not available for one of your needs.
        </p>
      )}
    </div>
  );
}
