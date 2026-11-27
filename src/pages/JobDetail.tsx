import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AccessBadge, SampleTag } from '../components/AccessBadge';
import { ButtonLink } from '../components/Button';
import { Card } from '../components/Card';
import { CommuteStepper } from '../components/CommuteStepper';
import { CountUp } from '../components/CountUp';
import { Icon } from '../components/Icon';
import { LoadingGate } from '../components/LoadingState';
import { Notice } from '../components/Notice';
import { PageHeader } from '../components/PageHeader';
import { SaveButton } from '../components/SaveButton';
import { WhyThisMatchBody } from '../components/WhyThisMatch';
import { WorkplaceChecklist } from '../components/WorkplaceChecklist';
import { matchJob } from '../domain/matching';
import { delay } from '../motion/motion';
import type { User } from '../domain/types';
import { useAuth } from '../hooks/useAuth';
import { useCatalog } from '../hooks/useCatalog';
import { useNeeds } from '../hooks/useNeeds';
import { useSavedJobs } from '../hooks/useSavedJobs';
import { toggleSaved } from '../services/savedJobs';

export function JobDetail() {
  const user = useAuth();
  return user ? <Detail user={user} /> : null;
}

function BackLink() {
  return (
    <Link to="/jobs" className="mb-3 inline-flex min-h-11 items-center gap-1 font-bold text-brand-700 underline underline-offset-4">
      <Icon name="chevronDown" className="size-4 rotate-90" />
      Back to jobs
    </Link>
  );
}

function Detail({ user }: { user: User }) {
  const { id } = useParams();
  const { catalog, loading } = useCatalog();
  const needs = useNeeds(user.id);
  const savedIds = useSavedJobs(user.id);
  const [announcement, setAnnouncement] = useState('');

  const job = catalog?.jobs.find((j) => j.id === id);
  const employer = catalog?.employers.find((e) => e.id === job?.employerId);
  const result = useMemo(() => (job ? matchJob(job, needs) : null), [job, needs]);

  return (
    <LoadingGate loading={loading} label="Loading job" cards={2}>
      {!job || !employer || !result ? (
        <>
          <BackLink />
          <PageHeader title="Job not found">There is no sample job with that address.</PageHeader>
          <ButtonLink to="/jobs">See all jobs</ButtonLink>
        </>
      ) : (
        <>
          <BackLink />
          <PageHeader title={job.title}>
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-base">
              <span className="font-bold text-ink">{employer.name}</span>
              <SampleTag />
              <span>
                {job.area} · {job.arrangement === 'hybrid' ? 'Hybrid' : 'On-site'}
              </span>
            </span>
          </PageHeader>

          <p role="status" className="sr-only">
            {announcement}
          </p>

          <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="flex min-w-0 flex-col gap-6">
              {result.excluded && (
                <Notice tone="info">
                  This job is hidden in your feed because a need you chose is not available here. See “Why this match?” below.
                </Notice>
              )}

              <Card>
                <p>{job.summary}</p>
                <p className="mt-2 text-sm text-muted">{employer.about}</p>
              </Card>

              <Card>
                <h2 className="text-xl">Workplace accessibility</h2>
                <p className="mb-1 mt-1 text-sm text-muted">What the employer has stated about the workplace (sample data). “Not confirmed” is never counted as accessible.</p>
                <WorkplaceChecklist job={job} result={result} />
              </Card>

              <Card>
                <h2 className="mb-1 text-xl">Commute, step by step</h2>
                <p className="mb-4 text-sm text-muted">Every stop, route and time is fictional. The weakest step decides whether the commute works for you.</p>
                <CommuteStepper job={job} employer={employer} result={result} />
              </Card>
            </div>

            <aside aria-label="Match summary" className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
              <Card className="flex flex-col gap-3">
                <div className="flex items-end justify-between gap-3">
                  <h2 className="text-xl">Your match</h2>
                  {result.score !== null && (
                    <p className="text-3xl font-bold tnum">
                      <CountUp value={result.score} intro />%
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <AccessBadge scope="workplace" status={result.workplaceBadge} reveal revealDelay={delay.reveal} />
                  <AccessBadge scope="commute" status={result.commuteBadge} reveal revealDelay={delay.reveal * 2} />
                </div>
                <p className="text-sm font-bold">{result.summary}</p>
                <SaveButton
                  saved={savedIds.includes(job.id)}
                  title={job.title}
                  onToggle={() => setAnnouncement(toggleSaved(user.id, job.id) ? `Saved ${job.title}.` : `Removed ${job.title} from saved jobs.`)}
                />
              </Card>

              <Card>
                <h2 className="mb-3 text-lg">Why this match?</h2>
                <WhyThisMatchBody result={result} full headingLevel={3} />
              </Card>
            </aside>
          </div>
        </>
      )}
    </LoadingGate>
  );
}
