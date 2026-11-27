import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ScopeGlyph } from '../components/AccessBadge';
import { ButtonLink } from '../components/Button';
import { Card } from '../components/Card';
import { ClearDataControl } from '../components/ClearDataControl';
import { PageHeader } from '../components/PageHeader';
import { NEEDS } from '../data/needs';
import { SCOPE_LABEL, type Need, type NeedId, type Scope } from '../domain/types';
import { useAuth } from '../hooks/useAuth';
import { useNeeds } from '../hooks/useNeeds';
import { saveNeeds } from '../services/needs';

/** Which halves of the journey does this need look at? (Shown to the person as "We check: ...") */
function scopesOf(need: Need): Scope[] {
  const scopes = new Set<Scope>();
  for (const req of need.requirements) scopes.add(req.kind === 'workplace-feature' ? 'workplace' : 'commute');
  return (['workplace', 'commute'] as Scope[]).filter((s) => scopes.has(s));
}

function countText(count: number): string {
  return count === 0 ? 'No needs selected' : `${count} of ${NEEDS.length} needs selected`;
}

export function Needs() {
  const user = useAuth();
  // The route guard guarantees a user. This keeps TypeScript (and a stray edge case) happy.
  return user ? <NeedsForm userId={user.id} /> : null;
}

function NeedsForm({ userId }: { userId: string }) {
  const selected = useNeeds(userId);
  const [status, setStatus] = useState(''); // text for the screen-reader announcement

  function toggle(id: NeedId) {
    const next = selected.includes(id) ? selected.filter((n) => n !== id) : [...selected, id];
    saveNeeds(userId, next); // saved straight away: no Save button to forget
    setStatus(`Saved. ${countText(next.length)}.`);
  }

  return (
    <>
      <PageHeader title="My needs">
        Choose what helps you work and get to work. You never need to share a diagnosis.
      </PageHeader>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="flex flex-col gap-6">
          <Card>
            <fieldset>
              <legend className="text-xl font-bold">What do you need?</legend>
              <p className="mb-3 mt-1 text-sm text-muted">Choose all that apply. Changes are saved as you go, and you can change them any time.</p>
              <ul className="flex flex-col gap-2">
                {NEEDS.map((need) => (
                  <li key={need.id}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-card border-2 border-line-strong bg-surface p-3 hover:bg-brand-50 has-checked:border-brand-600 has-checked:bg-brand-50">
                      <input
                        type="checkbox"
                        checked={selected.includes(need.id)}
                        onChange={() => toggle(need.id)}
                        className="mt-0.5 size-5 shrink-0 accent-brand-600"
                      />
                      <span className="flex flex-col gap-1">
                        <span className="font-bold">{need.label}</span>
                        <span className="text-sm text-muted">{need.description}</span>
                        <span className="flex flex-wrap items-center gap-x-3 text-xs font-bold text-ink">
                          <span className="text-muted">We check:</span>
                          {scopesOf(need).map((scope) => (
                            <span key={scope} className="inline-flex items-center gap-1">
                              <ScopeGlyph scope={scope} />
                              {SCOPE_LABEL[scope]}
                            </span>
                          ))}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
          </Card>

          <Card>
            <h2 className="text-lg">Your data on this device</h2>
            <p className="mb-3 mt-1 text-sm text-muted">
              Your chosen needs and saved jobs are stored only in this browser, under your account. Nothing is sent to any server. “Clear my data”
              removes them. Your account stays, so you can still log in.
            </p>
            <Link to="/account" className="mb-2 inline-flex min-h-11 items-center font-bold text-brand-700 underline underline-offset-4">
              More privacy controls
            </Link>
            <ClearDataControl userId={userId} onCleared={() => setStatus('Your saved needs and saved jobs were cleared from this browser.')} />
          </Card>
        </div>

        <aside aria-label="Summary" className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <p className="text-lg font-bold">{countText(selected.length)}</p>
            {/* Always on the page, so screen readers announce changes written into it. */}
            <p role="status" className="mt-1 min-h-6 text-sm font-bold text-ok">
              {status}
            </p>
            <ButtonLink to="/jobs" className="mt-3 w-full">
              See matching jobs
            </ButtonLink>
            <p className="mt-3 text-sm text-muted">
              Jobs are matched with simple, transparent rules and sample data.
            </p>
            <Link to="/method" className="inline-flex min-h-11 items-center font-bold text-brand-700 underline underline-offset-4">
              How matching works
            </Link>
          </Card>
        </aside>
      </div>
    </>
  );
}
