import { Link } from 'react-router-dom';
import { NEEDS } from '../data/needs';
import { ACCOUNT_TYPE_LABEL, type NeedId, type User } from '../domain/types';
import { Button } from './Button';
import { Card } from './Card';
import { Icon } from './Icon';
import { StatusIcon } from './StatusIcon';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((p) => /^\p{L}/u.test(p))
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}

/** Left column: who you are and which needs the feed is matching. */
export function NeedsProfileCard({
  user,
  needs,
  savedCount,
  onShowSaved,
}: {
  user: User;
  needs: NeedId[];
  savedCount: number;
  onShowSaved: () => void;
}) {
  const labels = NEEDS.filter((n) => needs.includes(n.id)).map((n) => n.label);
  return (
    <Card className="flex flex-col gap-3">
      <div className="hidden items-center gap-3 lg:flex">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white" aria-hidden="true">
          {initials(user.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-bold">{user.name}</p>
          <p className="text-sm text-muted">{ACCOUNT_TYPE_LABEL[user.accountType]}</p>
        </div>
      </div>

      <div>
        <h2 className="text-base">My needs</h2>
        {labels.length === 0 ? (
          <p className="mt-1 text-sm text-muted">No needs chosen yet, so jobs cannot be matched.</p>
        ) : (
          <>
            {/* On phones: one compact line, so the jobs start higher up the screen. */}
            <p className="mt-1 text-sm lg:hidden">{labels.join(', ')}</p>
          <ul className="mt-1 hidden flex-col gap-1 text-sm lg:flex">
            {labels.map((label) => (
              <li key={label} className="flex items-start gap-1.5">
                <Icon name="check" className="mt-0.5 size-4 shrink-0 text-brand-700" />
                <span>{label}</span>
              </li>
            ))}
          </ul>
          </>
        )}
        <Link to="/needs" className="mt-2 inline-flex min-h-11 items-center font-bold text-brand-700 underline underline-offset-4">
          {labels.length === 0 ? 'Choose my needs' : 'Edit my needs'}
        </Link>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-3 lg:block">
        <p className="text-sm">
          <span className="font-bold tnum">{savedCount}</span> saved {savedCount === 1 ? 'job' : 'jobs'}
        </p>
        <Button variant="secondary" onClick={onShowSaved} disabled={savedCount === 0} className="lg:mt-2 lg:w-full">
          Show saved jobs
        </Button>
      </div>
    </Card>
  );
}

/** Right column: how to read the badges and a few tips. All static text. */
export function LegendCard() {
  return (
    <>
      <Card>
        <h2 className="text-base">How to read the badges</h2>
        <ul className="mt-2 flex flex-col gap-2.5 text-sm">
          <li className="flex items-start gap-2">
            <StatusIcon status="confirmed" className="mt-0.5 size-4" />
            <span>
              <b>Confirmed.</b> The sample data says it is there.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <StatusIcon status="not-confirmed" className="mt-0.5 size-4" />
            <span>
              <b>Not confirmed.</b> Nobody has confirmed it. Ask the employer. It is never counted as accessible.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <StatusIcon status="not-available" className="mt-0.5 size-4" />
            <span>
              <b>Not available.</b> The sample data says it is not there.
            </span>
          </li>
        </ul>
        <p className="mt-3 border-t border-line pt-3 text-sm">
          <b>Workplace</b> is the job site. <b>Commute</b> is the whole journey, and its weakest step decides.
        </p>
      </Card>
      <Card>
        <h2 className="text-base">Tips</h2>
        <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-sm">
          <li>Jobs where a need is not available are hidden. Use “Show excluded jobs” to see them.</li>
          <li>Hybrid jobs still need a commute on office days.</li>
          <li>Open “Why this match?” to see the reason behind every badge.</li>
          <li>Every job, employer and route here is sample data.</li>
        </ul>
      </Card>
    </>
  );
}
