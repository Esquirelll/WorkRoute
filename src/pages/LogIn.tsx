import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { canOpen, homeFor } from '../app/access';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorSummary, type SummaryItem } from '../components/ErrorSummary';
import { FormField } from '../components/FormField';
import { Notice } from '../components/Notice';
import { PageHeader } from '../components/PageHeader';
import { PasswordField } from '../components/PasswordField';
import { useAuth } from '../hooks/useAuth';
import { useStartDemo } from '../hooks/useStartDemo';
import { validateLogIn, type FieldErrors, type LogInField } from '../domain/validation';
import { getCurrentUser, logIn, type AuthError } from '../services/auth';

const ID = { identifier: 'login-identifier', password: 'login-password' } as const;

export function LogIn() {
  const user = useAuth();
  const navigate = useNavigate();
  const startDemo = useStartDemo();
  const location = useLocation();
  const [alreadyLoggedIn] = useState(() => getCurrentUser() !== null);
  // RequireAuth sends logged-out visitors here and tells us where they were going.
  const redirect = location.state as { from?: string; reason?: string } | null;

  const [values, setValues] = useState({ identifier: '', password: '' });
  const [attempted, setAttempted] = useState(false);
  const [serverError, setServerError] = useState<AuthError | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [focusTick, setFocusTick] = useState(0);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusTick > 0) summaryRef.current?.focus();
  }, [focusTick]);

  if (alreadyLoggedIn && user) return <Navigate to={homeFor(user)} replace />;

  const errors: FieldErrors<LogInField> = {
    ...(attempted ? validateLogIn(values) : {}),
    // One message for "no such account" and "wrong password" on purpose (see auth.ts).
    ...(serverError ? { identifier: serverError.message } : {}),
  };
  const summaryItems: SummaryItem[] = (['identifier', 'password'] as LogInField[])
    .filter((f) => errors[f])
    .map((f) => ({ fieldId: ID[f], message: errors[f]! }));

  function change(field: LogInField, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    setServerError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setAttempted(true);
    setServerError(null);
    if (Object.keys(validateLogIn(values)).length > 0) {
      setFocusTick((t) => t + 1);
      return;
    }
    setSubmitting(true);
    const result = await logIn(values.identifier, values.password);
    setSubmitting(false);
    if (!result.ok) {
      setServerError(result.error);
      setFocusTick((t) => t + 1);
      return;
    }
    // Back to the page they wanted, but only if their account type may open it.
    const destination = redirect?.from && canOpen(result.user, redirect.from) ? redirect.from : homeFor(result.user);
    navigate(destination, { replace: true, state: { notice: `Welcome back, ${result.user.name}.` } });
  }

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Log in" />

      <div className="mb-4 flex flex-col gap-3">
        {redirect?.reason === 'login-required' && <Notice tone="info">Please log in to see that page. We will take you back to it.</Notice>}
        <Notice tone="prototype">Prototype: accounts exist only in this browser. Please don't use a real password.</Notice>
      </div>

      <Card>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <ErrorSummary items={summaryItems} summaryRef={summaryRef} />
          <FormField
            id={ID.identifier}
            label="Email or username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={values.identifier}
            onChange={(e) => change('identifier', e.target.value)}
            error={errors.identifier}
          />
          <PasswordField
            id={ID.password}
            label="Password"
            autoComplete="current-password"
            value={values.password}
            onChange={(e) => change('password', e.target.value)}
            error={errors.password}
          />
          <Button type="submit" aria-disabled={submitting} className="w-full">
            {submitting ? 'Logging in…' : 'Log in'}
          </Button>
        </form>
      </Card>

      <div className="mt-4 rounded-card border border-line bg-surface p-3">
        <p className="text-sm text-muted">Just looking around? Skip the login and see the site as Maria, a fictional wheelchair user.</p>
        <Button variant="secondary" onClick={startDemo} className="mt-2">
          Try demo persona
        </Button>
      </div>

      <p className="mt-2 flex flex-wrap items-center gap-x-2 text-base">
        New here?
        <Link to="/signup" className="inline-flex min-h-11 items-center font-bold text-brand-700 underline underline-offset-4">
          Create a prototype account
        </Link>
      </p>
    </div>
  );
}
