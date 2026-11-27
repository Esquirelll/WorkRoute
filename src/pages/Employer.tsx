import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorSummary, type SummaryItem } from '../components/ErrorSummary';
import { FormField } from '../components/FormField';
import { Notice } from '../components/Notice';
import { PageHeader } from '../components/PageHeader';
import { ProfilePreview } from '../components/ProfilePreview';
import { StatusChoice } from '../components/StatusChoice';
import { StatusIcon } from '../components/StatusIcon';
import { TextAreaField } from '../components/TextAreaField';
import { WORKPLACE_FEATURE_HELP, WORKPLACE_FEATURE_LABEL } from '../data/features';
import {
  emptyProfile,
  NOTE_MAX,
  validateProfile,
  WORKPLACE_FEATURES,
  type EmployerProfile,
  type ProfileField,
} from '../domain/employerProfile';
import type { Status } from '../domain/types';
import { useAuth } from '../hooks/useAuth';
import { getEmployerProfile, saveEmployerProfile } from '../services/employerProfile';

const ID = { workplaceName: 'emp-workplaceName', area: 'emp-area', note: 'emp-note' } as const;
const FIELD_ORDER: ProfileField[] = ['workplaceName', 'area', 'note'];

export function Employer() {
  const user = useAuth();
  return user ? <EmployerForm userId={user.id} /> : null;
}

function EmployerForm({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<EmployerProfile>(() => getEmployerProfile(userId) ?? emptyProfile());
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState('');
  const [focusTick, setFocusTick] = useState(0);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusTick > 0) summaryRef.current?.focus();
  }, [focusTick]);

  const errors = attempted ? validateProfile(profile) : {};
  const summaryItems: SummaryItem[] = FIELD_ORDER.filter((f) => errors[f]).map((f) => ({ fieldId: ID[f], message: errors[f]! }));

  function edit(patch: Partial<EmployerProfile>) {
    setProfile((p) => ({ ...p, ...patch }));
    setStatus(''); // changed since the last save, so the "Saved" message no longer applies
  }

  function setFeature(feature: (typeof WORKPLACE_FEATURES)[number], next: Status) {
    setProfile((p) => ({ ...p, features: { ...p.features, [feature]: next } }));
    setStatus('');
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setAttempted(true);
    if (Object.keys(validateProfile(profile)).length > 0) {
      setFocusTick((t) => t + 1);
      return;
    }
    saveEmployerProfile(userId, profile);
    setStatus('Saved in this browser.');
  }

  return (
    <>
      <PageHeader title="Employer: workplace accessibility">
        Describe your workplace. The preview shows how a job seeker would see it.
      </PageHeader>

      <div className="mb-4 max-w-3xl">
        <Notice tone="prototype">
          Prototype: this profile is saved only in this browser and is not shown to job seekers. Please use a made-up workplace, not a real company.
        </Notice>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <Card>
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <ErrorSummary items={summaryItems} summaryRef={summaryRef} />

            <FormField id={ID.workplaceName} label="Workplace name" autoComplete="organization" value={profile.workplaceName} onChange={(e) => edit({ workplaceName: e.target.value })} error={errors.workplaceName} />
            <FormField id={ID.area} label="Area" hint="A city or district, for example Pasig." value={profile.area} onChange={(e) => edit({ area: e.target.value })} error={errors.area} />

            <div>
              <h2 className="text-xl">Accessibility at your workplace</h2>
              <p className="mt-1 text-sm text-muted">
                Choose <b>Confirmed</b> only if it is true today. If you do not know, leave <b>Not confirmed</b>: job seekers will be told to ask you. Choose{' '}
                <b>Not available</b> if it is not there. Nothing here is checked against any law or standard.
              </p>
              <div className="mt-2 divide-y divide-line">
                {WORKPLACE_FEATURES.map((feature) => (
                  <StatusChoice
                    key={feature}
                    name={`feature-${feature}`}
                    legend={WORKPLACE_FEATURE_LABEL[feature]}
                    help={WORKPLACE_FEATURE_HELP[feature]}
                    value={profile.features[feature]}
                    onChange={(next) => setFeature(feature, next)}
                  />
                ))}
              </div>
            </div>

            <TextAreaField
              id={ID.note}
              label="Anything else job seekers should know (optional)"
              hint="For example, how to arrive or who to contact. Please do not enter personal details."
              max={NOTE_MAX}
              value={profile.note}
              onChange={(e) => edit({ note: e.target.value })}
              error={errors.note}
            />

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit">Save profile</Button>
              <p role="status" className="flex min-h-6 items-center gap-1.5 text-sm font-bold text-ok">
                {status && <StatusIcon status="confirmed" className="size-4" />}
                {status}
              </p>
            </div>
          </form>
        </Card>

        {/* Sticky only when the screen is tall enough to show the whole preview. */}
        <div className="top-20 [@media(min-width:64rem)_and_(min-height:60rem)]:sticky">
          <ProfilePreview profile={profile} />
        </div>
      </div>
    </>
  );
}
