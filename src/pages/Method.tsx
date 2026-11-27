import type { ReactNode } from 'react';
import { Card } from '../components/Card';
import { Notice } from '../components/Notice';
import { PageHeader } from '../components/PageHeader';
import { StatusIcon } from '../components/StatusIcon';
import { WhyThisMatchBody } from '../components/WhyThisMatch';
import { COMMUTE_FEATURE_LABEL, WORKPLACE_FEATURE_LABEL } from '../data/features';
import { JOBS } from '../data/jobs';
import { NEEDS } from '../data/needs';
import { matchJob } from '../domain/matching';
import { SHORT_COMMUTE_MAX_MINUTES } from '../domain/rules';
import type { Need } from '../domain/types';

/** Jump to a section. Buttons, not <a href="#...">, because with HashRouter the part after # is the route. */
function jumpTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  el.focus({ preventScroll: true });
}

const SECTIONS = [
  { id: 'm-idea', label: 'The idea' },
  { id: 'm-matching', label: 'How matching works' },
  { id: 'm-goals', label: 'Global goals (SDGs)' },
  { id: 'm-sample', label: 'Sample data' },
];

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-title`} className="flex flex-col gap-3">
      <h2 id={`${id}-title`} tabIndex={-1} className="scroll-mt-20 text-2xl outline-none">
        <span id={id} tabIndex={-1} className="outline-none">
          {title}
        </span>
      </h2>
      {children}
    </section>
  );
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-bold text-brand-700 underline underline-offset-4">
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/** "Wheelchair: Workplace: step-free entrance, ... Commute: step-free travel, ..." built from the real rule table. */
function needChecks(need: Need): { workplace: string[]; commute: string[] } {
  const workplace: string[] = [];
  const commute: string[] = [];
  for (const req of need.requirements) {
    if (req.kind === 'workplace-feature') workplace.push(WORKPLACE_FEATURE_LABEL[req.feature]);
    else if (req.kind === 'commute-feature') commute.push(COMMUTE_FEATURE_LABEL[req.feature]);
    else commute.push(`Total travel time (at most ${SHORT_COMMUTE_MAX_MINUTES} minutes)`);
  }
  return { workplace, commute };
}

export function Method() {
  // A live example from the REAL engine, so this page can never disagree with how matching works.
  const exampleJob = JOBS.find((j) => j.id === 'j4') ?? JOBS[0]!;
  const exampleResult = matchJob(exampleJob, ['wheelchair']);

  return (
    <>
      <PageHeader title="Method and sample data">How WorkRoute decides, and what is made up.</PageHeader>

      <Card className="mb-6 max-w-3xl">
        <h2 className="text-base">On this page</h2>
        <ul className="mt-1 flex flex-wrap gap-x-4">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <button type="button" onClick={() => jumpTo(s.id)} className="min-h-11 text-left font-bold text-brand-700 underline underline-offset-4">
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex max-w-3xl flex-col gap-10">
        <Section id="m-idea" title="The idea">
          <p>
            WorkRoute is for persons with disabilities in Metro Manila. For every job it puts two questions side by side: <b>can I work there?</b> and{' '}
            <b>can I get there?</b>
          </p>
          <p>
            Job sites list jobs, and accessibility maps show places. WorkRoute shows the accessibility of the workplace and of the whole commute together, in one view, for the person
            looking for work.
          </p>
        </Section>

        <Section id="m-matching" title="How matching works">
          <p>
            Matching follows a short list of fixed rules written down here. It does <b>not</b> use artificial intelligence or machine learning. The same needs and the same job
            always give the same answer.
          </p>

          <ol className="flex list-decimal flex-col gap-3 pl-5">
            <li>
              <b>You choose your needs.</b> They describe what helps you, never a diagnosis. Each need is turned into a short list of checks (the table below).
            </li>
            <li>
              <b>Every check gets one of three statuses.</b>
              <ul className="mt-1.5 flex flex-col gap-1.5">
                <li className="flex items-start gap-2">
                  <StatusIcon status="confirmed" className="mt-0.5 size-4" />
                  <span>
                    <b>Confirmed:</b> the sample data says it is there.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <StatusIcon status="not-confirmed" className="mt-0.5 size-4" />
                  <span>
                    <b>Not confirmed:</b> nobody has said either way. <b>Missing information counts as not confirmed.</b> It is never shown as accessible.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <StatusIcon status="not-available" className="mt-0.5 size-4" />
                  <span>
                    <b>Not available:</b> the sample data says it is not there.
                  </span>
                </li>
              </ul>
            </li>
            <li>
              <b>The commute is judged step by step, and the weakest step decides.</b> If one step of the journey is blocked, the whole journey is blocked, even when every other step is fine.
              A walking step has no vehicle to board, so only “step-free travel” applies to it.
            </li>
            <li>
              <b>A need takes the worst status among its checks.</b>
            </li>
            <li>
              <b>Filter:</b> if any need you chose is <i>not available</i> at a job, that job is <b>excluded</b>. Excluded jobs are hidden by default, and a switch on the Jobs page shows them.
              A job where something is only <i>not confirmed</i> stays in the list.
            </li>
            <li>
              <b>Score:</b> the percent of your chosen needs that are fully confirmed. For example, if you chose 4 needs and 3 are confirmed, the score is 75%. “Not confirmed” earns
              nothing.
            </li>
            <li>
              <b>Explanation:</b> every result has a “Why this match?” that lists each need, its status and the reason.
            </li>
          </ol>

          <h3 className="mt-2 text-lg">Rules used for matching</h3>
          <p>
            These are choices made for WorkRoute, not official standards: a “short commute” means a total travel time of at most <b className="tnum">{SHORT_COMMUTE_MAX_MINUTES}</b> minutes
            (using the sample times), and a score counts only needs that are fully confirmed.
          </p>

          <h3 className="mt-2 text-lg">What each need checks</h3>
          <div className="overflow-x-auto rounded-card border border-line bg-surface">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <caption className="sr-only">What each need checks at the workplace and on the commute</caption>
              <thead>
                <tr className="border-b border-line bg-page">
                  <th scope="col" className="px-3 py-2">
                    Need
                  </th>
                  <th scope="col" className="px-3 py-2">
                    Checked at the workplace
                  </th>
                  <th scope="col" className="px-3 py-2">
                    Checked on the commute
                  </th>
                </tr>
              </thead>
              <tbody>
                {NEEDS.map((need) => {
                  const checks = needChecks(need);
                  return (
                    <tr key={need.id} className="border-b border-line align-top last:border-b-0">
                      <th scope="row" className="px-3 py-2 font-bold">
                        {need.label}
                      </th>
                      <td className="px-3 py-2">{checks.workplace.length ? checks.workplace.join(', ') : 'Nothing'}</td>
                      <td className="px-3 py-2">{checks.commute.length ? checks.commute.join(', ') : 'Nothing'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <h3 className="mt-2 text-lg">A worked example</h3>
          <p>
            This is the real output for the sample job “{exampleJob.title}” and the need “I use a wheelchair”. It is produced by the same code that powers the Jobs page.
          </p>
          <Card>
            <WhyThisMatchBody result={exampleResult} full />
          </Card>
        </Section>

        <Section id="m-goals" title="Global goals (SDGs)">
          <p>WorkRoute is meant to support three of the United Nations Sustainable Development Goals. It does not claim to achieve them.</p>
          <ul className="flex flex-col gap-3">
            <li>
              <Card className="!p-3">
                <h3 className="text-lg">SDG 8: Decent work and economic growth</h3>
                <p className="mt-1 text-sm">
                  Looking for work is hard when you cannot tell which jobs you could actually do and reach. WorkRoute shows both, so job seekers can spend their effort on realistic options.
                </p>
                <ExternalLink href="https://sdgs.un.org/goals/goal8">About SDG 8</ExternalLink>
              </Card>
            </li>
            <li>
              <Card className="!p-3">
                <h3 className="text-lg">SDG 10: Reduced inequalities</h3>
                <p className="mt-1 text-sm">
                  Accessibility information is often missing or hard to compare. WorkRoute puts it in one place, and it is honest about what is unknown: “not confirmed” is never shown
                  as “accessible”.
                </p>
                <ExternalLink href="https://sdgs.un.org/goals/goal10">About SDG 10</ExternalLink>
              </Card>
            </li>
            <li>
              <Card className="!p-3">
                <h3 className="text-lg">SDG 11: Sustainable cities and communities</h3>
                <p className="mt-1 text-sm">
                  A job you cannot reach is not an opportunity. WorkRoute treats the journey as part of the job, in line with the goal’s attention to accessible transport for all, including
                  persons with disabilities.
                </p>
                <ExternalLink href="https://sdgs.un.org/goals/goal11">About SDG 11</ExternalLink>
              </Card>
            </li>
          </ul>
        </Section>

        <Section id="m-sample" title="Sample data">
          <Notice tone="prototype">Everything you see about employers, jobs and journeys is made up. Please do not use WorkRoute to decide anything in real life.</Notice>
          <ul className="flex list-disc flex-col gap-1.5 pl-5">
            <li>
              <b>Employers and jobs</b> are invented. The employer names are fictional, and no real company is described. Each one is marked with a “Sample” tag.
            </li>
            <li>
              <b>Accessibility statements</b> (confirmed, not confirmed, not available) are invented too. Nobody has checked any real place.
            </li>
            <li>
              <b>Commute steps</b> use real kinds of transport (LRT/MRT, jeepney, bus, tricycle and walking), but every stop, route and travel time is fictional. Area names such as
              Pasig are real places, but the jobs and employers located there are not.
            </li>
            <li>
              WorkRoute uses <b>no statistics</b>, makes <b>no claims about real workplaces or real transport</b>, gives <b>no legal advice</b>, and does not check anything against a
              law or an accessibility standard.
            </li>
          </ul>
        </Section>
      </div>
    </>
  );
}
