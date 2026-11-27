import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { totalCommuteMinutes } from '../domain/matching';
import type { Employer, Job, MatchResult } from '../domain/types';
import { cardVariants, delay } from '../motion/motion';
import { AccessBadge, SampleTag } from './AccessBadge';
import { Card } from './Card';
import { CountUp } from './CountUp';
import { SaveButton } from './SaveButton';
import { StatusIcon } from './StatusIcon';
import { WhyThisMatch } from './WhyThisMatch';

type Props = {
  job: Job;
  employer: Employer;
  result: MatchResult;
  saved: boolean;
  onToggleSave: () => void;
  /** Animate on first appearance: stagger (a few cards only) and count the score up. */
  intro: boolean;
  introDelay: number;
};

/**
 * One job in the feed. `layout="position"` makes the card GLIDE to its new place when the list
 * reorders (it moves, it never stretches). Entering and leaving use opacity + a little movement.
 * Everything is a spring or very short, so it can be interrupted at any moment.
 *
 * The title is the link, stretched with ::after to cover the whole card, so the entire card is
 * one big click target while Save and "Why this match?" (z-10) stay separately usable.
 */
export function JobCard({ job, employer, result, saved, onToggleSave, intro, introDelay }: Props) {
  const minutes = totalCommuteMinutes(job);

  return (
    <motion.li
      layout="position"
      variants={cardVariants}
      custom={introDelay}
      initial="initial"
      animate="animate"
      exit="exit"
      className="list-none"
    >
      <Card className="relative flex flex-col gap-3 transition-[border-color,box-shadow] hover:border-brand-600 hover:shadow-[0_0_0_1px_var(--color-brand-600)] has-[h3_a:focus-visible]:outline-3 has-[h3_a:focus-visible]:outline-offset-2 has-[h3_a:focus-visible]:outline-brand-600">
        {result.excluded && (
          <p className="flex items-center gap-2 rounded-tag bg-no-bg px-2 py-1 text-sm font-bold text-no">
            <StatusIcon status="not-available" className="size-4" />
            Hidden by default: {result.blocked.length === 1 ? 'a need you chose is' : 'needs you chose are'} not available here.
          </p>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg">
              <Link to={`/jobs/${job.id}`} className="after:absolute after:inset-0 after:content-['']">
                {job.title}
              </Link>
            </h3>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
              <span className="font-bold text-ink">{employer.name}</span>
              <SampleTag />
              <span>
                {job.area} · {job.arrangement === 'hybrid' ? 'Hybrid' : 'On-site'} · {minutes === null ? 'travel time not given' : `about ${minutes} min travel`}
              </span>
            </p>
          </div>

          {result.score !== null && (
            <p className="shrink-0 text-right">
              <span className="text-2xl font-bold tnum">
                <CountUp value={result.score} intro={intro} />%
              </span>
              <span className="block text-xs font-bold text-muted">match</span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <AccessBadge scope="workplace" status={result.workplaceBadge} reveal={intro} revealDelay={introDelay + delay.reveal} />
          <AccessBadge scope="commute" status={result.commuteBadge} reveal={intro} revealDelay={introDelay + delay.reveal * 2} />
        </div>

        <p className="text-sm font-bold">{result.summary}</p>

        <div className="flex flex-wrap items-start gap-2">
          <div className="min-w-0 flex-1 basis-60">
            <WhyThisMatch result={result} />
          </div>
          <SaveButton saved={saved} title={job.title} onToggle={onToggleSave} />
        </div>
      </Card>
    </motion.li>
  );
}
