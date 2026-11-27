import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ClearDataControl } from '../components/ClearDataControl';
import { PageHeader } from '../components/PageHeader';
import { Reveal } from '../components/Reveal';
import { StoredItemsList } from '../components/StoredItemsList';
import { ACCOUNT_TYPE_LABEL, type User } from '../domain/types';
import { useAuth } from '../hooks/useAuth';
import { useNeeds } from '../hooks/useNeeds';
import { useSavedJobs } from '../hooks/useSavedJobs';
import { deleteAccount, startDemoPersona } from '../services/auth';
import { getEmployerProfile } from '../services/employerProfile';
import { listStoredKeys } from '../services/storage';

/**
 * Account and privacy. Logged-in people only, but this page handles that itself (instead of the
 * route guard) so that deleting an account can finish its own goodbye without being bounced to Log in.
 */
export function Account() {
  const user = useAuth();
  const navigate = useNavigate();
  const leaving = useRef(false); // true while we are deliberately leaving after a deletion

  useEffect(() => {
    if (!user && !leaving.current) {
      navigate('/login', { replace: true, state: { from: '/account', reason: 'login-required' } });
    }
  }, [user, navigate]);

  function handleDelete(): boolean {
    leaving.current = true;
    const result = deleteAccount();
    if (!result.ok) {
      leaving.current = false;
      return false;
    }
    navigate('/', { replace: true, state: { notice: 'Your account and all saved data were deleted from this browser.' } });
    return true;
  }

  return user ? <AccountDetails user={user} onDelete={handleDelete} /> : null;
}

function AccountDetails({ user, onDelete }: { user: User; onDelete: () => boolean }) {
  const needs = useNeeds(user.id);
  const saved = useSavedJobs(user.id);
  const [, refresh] = useState(0); // re-read the employer profile after "Clear my data"
  const hasEmployerProfile = getEmployerProfile(user.id) !== null;
  const showsEmployer = user.accountType !== 'seeker';

  const rawKeys = listStoredKeys().filter((k) => k.key === 'accounts' || k.key === 'session' || k.key.endsWith(`.${user.id}`));
  const protectedAccount = user.isDemo || user.accountType === 'admin';

  return (
    <>
      <PageHeader title="Account and privacy">See what is stored for your account, and remove it whenever you like.</PageHeader>

      <div className="flex max-w-3xl flex-col gap-6">
        <Card>
          <h2 className="text-xl">Your account</h2>
          <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-[8rem_1fr]">
            <dt className="font-bold">Name</dt>
            <dd>{user.name}</dd>
            <dt className="font-bold">Email</dt>
            <dd className="break-all">{user.email}</dd>
            <dt className="font-bold">Account type</dt>
            <dd>{user.isDemo ? 'Demo persona (fictional)' : ACCOUNT_TYPE_LABEL[user.accountType]}</dd>
          </dl>
          {user.isDemo && <p className="mt-3 text-sm text-muted">Maria is a fictional person. Her account has no password and can only be opened with “Try demo persona”.</p>}
          {user.accountType === 'admin' && <p className="mt-3 text-sm text-muted">The built-in demo admin account can open every page.</p>}
        </Card>

        <Card>
          <h2 className="text-xl">Stored on this device for your account</h2>
          <p className="mt-1 text-sm text-muted">Everything below is kept only in this browser. Nothing is sent to any server.</p>
          <ul className="mt-3 divide-y divide-line">
            <li className="flex flex-wrap justify-between gap-x-4 py-2">
              <span className="font-bold">Account record</span>
              <span className="text-muted">{user.isDemo ? 'Name and email (no password exists)' : 'Name, email, and a salted password hash'}</span>
            </li>
            <li className="flex flex-wrap justify-between gap-x-4 py-2">
              <span className="font-bold">Chosen needs</span>
              <span className="text-muted tnum">{needs.length === 0 ? 'None' : `${needs.length} chosen`}</span>
            </li>
            <li className="flex flex-wrap justify-between gap-x-4 py-2">
              <span className="font-bold">Saved jobs</span>
              <span className="text-muted tnum">{saved.length === 0 ? 'None' : `${saved.length} saved`}</span>
            </li>
            {showsEmployer && (
              <li className="flex flex-wrap justify-between gap-x-4 py-2">
                <span className="font-bold">Employer profile</span>
                <span className="text-muted">{hasEmployerProfile ? 'Saved' : 'None'}</span>
              </li>
            )}
          </ul>

          <details className="mt-3 rounded-control border border-line">
            <summary className="flex min-h-11 cursor-pointer items-center px-3 text-sm font-bold text-brand-700">Show the technical storage items</summary>
            <div className="border-t border-line px-3 py-2 text-sm">
              <p className="text-muted">The “accounts” item holds every account created in this browser, not only yours. Sizes are in characters.</p>
              <ul className="mt-2 flex flex-col gap-1">
                {rawKeys.map((k) => (
                  <li key={k.key} className="flex justify-between gap-3">
                    <code className="break-all">workroute.{k.key}</code>
                    <span className="tnum text-muted">{k.size}</span>
                  </li>
                ))}
              </ul>
            </div>
          </details>
        </Card>

        <Card>
          <h2 className="text-xl">Clear my data</h2>
          <p className="mb-3 mt-1 text-sm text-muted">Removes your chosen needs, saved jobs and employer profile from this browser. Your account stays.</p>
          <ClearDataControl userId={user.id} onCleared={() => refresh((n) => n + 1)} />
        </Card>

        <Card>
          <h2 className="text-xl">{user.isDemo ? 'Reset the demo persona' : 'Delete my account'}</h2>
          {user.isDemo ? (
            <DemoReset />
          ) : protectedAccount ? (
            <p className="mt-1 text-sm text-muted">The built-in demo admin account cannot be deleted. It is created again automatically whenever the site opens.</p>
          ) : (
            <DeleteControl onDelete={onDelete} />
          )}
        </Card>

        <Card>
          <h2 className="text-xl">Everything WorkRoute stores in this browser</h2>
          <p className="mb-3 mt-1 text-sm">
            WorkRoute has no server and sends your information nowhere. The only things it keeps are the items below, in your browser’s own storage (called <i>localStorage</i>). This is
            the complete list, and a test in the code checks that nothing else is stored.
          </p>
          <StoredItemsList />
          <h3 className="mt-4 text-lg">Also good to know</h3>
          <ul className="mt-1 flex list-disc flex-col gap-1.5 pl-5 text-sm">
            <li>
              <b>Memory only:</b> your filter and sort choices on the Jobs page are kept while the tab is open and are not saved.
            </li>
            <li>
              <b>Briefly:</b> the site writes a tiny test item and removes it straight away, to check whether storage works.
            </li>
            <li>
              <b>Not used:</b> cookies, analytics, tracking, advertising, and any request that sends your information to a server. The font is served from this site.
            </li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-xl">How accounts work here</h2>
          <p className="mt-1 text-sm">
            Sign-up and log-in are <b>simulated</b>. Passwords are never stored as text: each is turned into a salted hash, a one-way scrambled value, using your browser’s built-in
            tools. That keeps passwords unreadable in storage, but it is <b>not real security</b>. Anyone who can open this browser’s developer tools can read, change or delete the
            data, and nothing limits repeated guesses. That is why the sign-up page asks you not to use a real password.
          </p>
          <p className="mt-2 text-sm">
            Two built-in demo accounts exist. The <b>demo admin</b> has a password that is written in the site’s code, so anyone can read it: never reuse it anywhere. The{' '}
            <b>demo persona, Maria</b>, is fictional and has no password at all.
          </p>
        </Card>
      </div>
    </>
  );
}

function DemoReset() {
  const [message, setMessage] = useState('');
  return (
    <>
      <p className="mb-3 mt-1 text-sm text-muted">Puts Maria back to her starting point: her needs chosen, no saved jobs. Useful before recording a demo.</p>
      <Button
        variant="secondary"
        onClick={() => {
          startDemoPersona();
          setMessage('The demo persona was reset.');
        }}
      >
        Reset the demo persona
      </Button>
      <p role="status" className="mt-2 min-h-6 text-sm font-bold text-ok">
        {message}
      </p>
    </>
  );
}

/** Delete with a confirmation step. Focus goes to Cancel (the safe choice) first. */
function DeleteControl({ onDelete }: { onDelete: () => boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [failed, setFailed] = useState(false);
  const [returnFocus, setReturnFocus] = useState(0);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (confirming) cancelRef.current?.focus();
  }, [confirming]);
  useEffect(() => {
    if (returnFocus > 0) openRef.current?.focus();
  }, [returnFocus]);

  return (
    <>
      <p className="mb-3 mt-1 text-sm text-muted">
        Removes your account <b>and</b> everything saved for it (needs, saved jobs, employer profile) from this browser, then logs you out. You can sign up again later with the same email.
      </p>
      {!confirming ? (
        <Button ref={openRef} variant="secondary" onClick={() => setConfirming(true)}>
          Delete my account
        </Button>
      ) : (
        <Reveal role="group" aria-labelledby="delete-title" className="rounded-card border-2 border-no bg-no-bg p-3">
          <p id="delete-title" className="font-bold">
            Delete your account and all your saved data?
          </p>
          <p className="mt-1 text-sm">This cannot be undone. A real service would also ask for your password here; this prototype keeps it simple.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              ref={cancelRef}
              variant="secondary"
              onClick={() => {
                setConfirming(false);
                setReturnFocus((n) => n + 1);
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={() => setFailed(!onDelete())}>
              Yes, delete my account
            </Button>
          </div>
        </Reveal>
      )}
      {failed && <p role="alert" className="mt-2 text-sm font-bold text-no">This account could not be deleted.</p>}
    </>
  );
}
