import { Link } from 'react-router-dom';
import { AccessBadge, SampleTag } from '../components/AccessBadge';
import { homeFor } from '../app/access';
import { Button, ButtonLink } from '../components/Button';
import { Card } from '../components/Card';
import { LogoMark } from '../components/Logo';
import { ModeIcon } from '../components/ModeIcon';
import { EMPLOYERS } from '../data/employers';
import { JOBS } from '../data/jobs';
import { matchJob } from '../domain/matching';
import { delay } from '../motion/motion';
import { useAuth } from '../hooks/useAuth';
import { usePageTitle } from '../hooks/usePageTitle';
import { useStartDemo } from '../hooks/useStartDemo';

/** A real result from the matching engine for a sample job, so the front page shows the idea honestly. */
function ExampleCard() {
  const job = JOBS.find((j) => j.id === 'j4') ?? JOBS[0]!;
  const employer = EMPLOYERS.find((e) => e.id === job.employerId)!;
  const result = matchJob(job, ['wheelchair']);
  const problem = result.needResults[0]?.checks.find((c) => c.status !== 'confirmed');

  return (
    <Card className="flex flex-col gap-3">
      <p className="flex items-center gap-2 text-sm font-bold text-muted">
        Example <SampleTag />
      </p>
      <div>
        <p className="text-xl font-bold">{job.title}</p>
        <p className="text-sm text-muted">
          {employer.name} · {job.area}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <AccessBadge scope="workplace" status={result.workplaceBadge} reveal revealDelay={delay.reveal * 2} />
        <AccessBadge scope="commute" status={result.commuteBadge} reveal revealDelay={delay.reveal * 3} />
      </div>
      <ol className="flex flex-wrap items-center gap-1.5 text-route-500" aria-label="Commute steps">
        {job.commute.map((step, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span className="flex size-8 items-center justify-center rounded-full border-2 border-route-500 bg-route-100">
              <ModeIcon mode={step.mode} className="size-4" />
            </span>
            <span className="h-[3px] w-6 rounded-full bg-route-500" aria-hidden="true" />
          </li>
        ))}
        <li aria-hidden="true">
          <span className="block size-6 rounded-md bg-brand-600" />
        </li>
      </ol>
      {problem && (
        <p className="text-sm">
          <b>For a wheelchair user:</b> {problem.label.toLowerCase()} is not confirmed on one step of the commute. WorkRoute says so, instead of guessing.
        </p>
      )}
    </Card>
  );
}

export function Landing() {
  usePageTitle('Jobs you can reach and use');
  const user = useAuth();
  const startDemo = useStartDemo();

  return (
    <div className="flex flex-col gap-12">
      <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-tag border border-dashed border-line-strong px-2 py-1 text-sm font-bold text-muted">
            <LogoMark className="size-5" /> Prototype for Metro Manila. All data is sample data.
          </p>
          <h1 tabIndex={-1} className="text-3xl leading-tight outline-none sm:text-4xl lg:text-[2.75rem]">
            Find a job you can reach, at a workplace you can use.
          </h1>
          <p className="mt-4 text-lg">
            WorkRoute is for persons with disabilities. For every job it shows two answers side by side: is the <b>workplace</b> accessible, and is the <b>commute</b> accessible, step by
            step?
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {user ? (
              <ButtonLink to={homeFor(user)}>Continue to my page</ButtonLink>
            ) : (
              <>
                <ButtonLink to="/signup">Sign up</ButtonLink>
                <ButtonLink to="/login" variant="secondary">
                  Log in
                </ButtonLink>
              </>
            )}
          </div>
          {!user && (
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
              <Button variant="quiet" onClick={startDemo} className="-ml-4">
                Try demo persona
              </Button>
              <span className="text-sm text-muted">No log-in needed. See the site as Maria, a fictional wheelchair user.</span>
            </div>
          )}
        </div>

        <ExampleCard />
      </div>

      <section aria-labelledby="how-title" className="max-w-3xl">
        <h2 id="how-title" className="text-2xl">
          How it works
        </h2>
        <ol className="mt-4">
          {[
            ['Choose what you need.', 'For example “I use a wheelchair” or “I need a quiet workspace”. You never share a diagnosis.'],
            ['See jobs matched on both halves.', 'Each job shows a workplace badge and a commute badge, and a plain-language “Why this match?”.'],
            ['Check the details.', 'A workplace checklist and a step-by-step commute show what is confirmed, what is not, and what to ask the employer.'],
          ].map(([title, text], i, all) => (
            <li key={title} className="relative flex gap-4 pb-6 last:pb-0">
              {i < all.length - 1 && <span className="absolute bottom-0 left-[1.0625rem] top-10 w-[3px] rounded-full bg-route-500" aria-hidden="true" />}
              <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-600 font-bold text-white" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <p className="font-bold">{title}</p>
                <p className="text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6">
          Not sure what is real? Nothing is: every employer, job and route is made up.{' '}
          <Link to="/method" className="font-bold text-brand-700 underline underline-offset-4">
            Read how matching works
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
