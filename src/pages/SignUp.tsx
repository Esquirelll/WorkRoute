import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { homeFor } from '../app/access';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorSummary, type SummaryItem } from '../components/ErrorSummary';
import { FormField } from '../components/FormField';
import { Notice } from '../components/Notice';
import { PageHeader } from '../components/PageHeader';
import { PasswordField } from '../components/PasswordField';
import { StatusIcon } from '../components/StatusIcon';
import { useAuth } from '../hooks/useAuth';
import { PASSWORD_MIN, validateSignUp, type FieldErrors, type SignUpField } from '../domain/validation';
import { getCurrentUser, signUp, type AuthError } from '../services/auth';
import { isStoragePersistent } from '../services/storage';

const ACCOUNT_OPTIONS = [
  { value: 'seeker', title: 'Job seeker', text: 'I am looking for work where the workplace and the commute both work for me.' },
  { value: 'employer', title: 'Employer', text: 'I am hiring and want to describe how accessible my workplace is.' },
];

// Field ids. The error summary uses these to jump to the right field.
const ID = { accountType: 'signup-accountType', name: 'signup-name', email: 'signup-email', password: 'signup-password' } as const;
const FIELD_ORDER: SignUpField[] = ['accountType', 'name', 'email', 'password'];

export function SignUp() {
  const user = useAuth();
  const navigate = useNavigate();
  // Remember whether someone was ALREADY logged in when this page opened. (After a successful
  // sign-up the user becomes logged in too, and we do not want that to trigger this redirect.)
  const [alreadyLoggedIn] = useState(() => getCurrentUser() !== null);

  const [values, setValues] = useState({ accountType: '', name: '', email: '', password: '' });
  const [attempted, setAttempted] = useState(false); // errors only appear after the first submit
  const [serverError, setServerError] = useState<AuthError | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [focusTick, setFocusTick] = useState(0); // bump this to move focus to the error summary
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusTick > 0) summaryRef.current?.focus();
  }, [focusTick]);

  if (alreadyLoggedIn && user) return <Navigate to={homeFor(user)} replace />;

  // After a failed submit the messages update live as the person fixes each field.
  const errors: FieldErrors<SignUpField> = {
    ...(attempted ? validateSignUp(values) : {}),
    ...(serverError?.field ? { [serverError.field]: serverError.message } : {}),
  };
  const summaryItems: SummaryItem[] = FIELD_ORDER.filter((f) => errors[f]).map((f) => ({ fieldId: ID[f], message: errors[f]! }));
  if (serverError && !serverError.field) summaryItems.unshift({ fieldId: ID.accountType, message: serverError.message });

  function change(field: SignUpField, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    if (serverError?.field === field) setServerError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setAttempted(true);
    setServerError(null);
    if (Object.keys(validateSignUp(values)).length > 0) {
      setFocusTick((t) => t + 1);
      return;
    }
    setSubmitting(true);
    const result = await signUp(values);
    setSubmitting(false);
    if (!result.ok) {
      setServerError(result.error);
      setFocusTick((t) => t + 1);
      return;
    }
    navigate(homeFor(result.user), {
      replace: true,
      state: { notice: `Welcome, ${result.user.name}. Your prototype account is ready.` },
    });
  }

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Create a prototype account">Pick the account type that fits you. You can try the other one with a second account.</PageHeader>

      <div className="mb-4 flex flex-col gap-3">
        <Notice tone="prototype">Prototype: no real account is created. Please don't use a real password.</Notice>
        {!isStoragePersistent() && (
          <Notice tone="info">Your browser is blocking storage, so this account will disappear when you close the tab.</Notice>
        )}
      </div>

      <Card>
        {/* noValidate: we show our own clear messages instead of the browser's pop-up bubbles. */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <ErrorSummary items={summaryItems} summaryRef={summaryRef} />
          <p className="text-sm text-muted">All fields are required.</p>

          <fieldset aria-describedby={errors.accountType ? `${ID.accountType}-error` : undefined} className="flex flex-col gap-2">
            <legend className="mb-1.5 text-sm font-bold">Account type</legend>
            {ACCOUNT_OPTIONS.map((option, index) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-start gap-3 rounded-card border-2 border-line-strong bg-surface p-3 hover:bg-brand-50 has-checked:border-brand-600 has-checked:bg-brand-50"
              >
                <input
                  id={index === 0 ? ID.accountType : undefined}
                  type="radio"
                  name="accountType"
                  value={option.value}
                  checked={values.accountType === option.value}
                  onChange={() => change('accountType', option.value)}
                  className="mt-0.5 size-5 shrink-0 accent-brand-600"
                />
                <span>
                  <span className="block font-bold">{option.title}</span>
                  <span className="block text-sm text-muted">{option.text}</span>
                </span>
              </label>
            ))}
            {errors.accountType && (
              <p id={`${ID.accountType}-error`} className="flex items-start gap-1.5 text-sm font-bold text-no">
                <StatusIcon status="not-available" className="mt-0.5 size-4" />
                <span>{errors.accountType}</span>
              </p>
            )}
          </fieldset>

          <FormField id={ID.name} label="Your name" autoComplete="name" value={values.name} onChange={(e) => change('name', e.target.value)} error={errors.name} />
          <FormField
            id={ID.email}
            label="Email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            value={values.email}
            onChange={(e) => change('email', e.target.value)}
            error={errors.email}
          />
          <PasswordField
            id={ID.password}
            label="Password"
            hint={`Use at least ${PASSWORD_MIN} characters. A few words in a row is easy to remember and hard to guess. Tap Show to check what you typed.`}
            autoComplete="new-password"
            value={values.password}
            onChange={(e) => change('password', e.target.value)}
            error={errors.password}
          />

          <Button type="submit" aria-disabled={submitting} className="w-full">
            {submitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      </Card>

      <p className="mt-2 flex flex-wrap items-center gap-x-2 text-base">
        Already have an account?
        <Link to="/login" className="inline-flex min-h-11 items-center font-bold text-brand-700 underline underline-offset-4">
          Log in
        </Link>
      </p>
    </div>
  );
}
