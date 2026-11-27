import { summarize, type EmployerProfile } from '../domain/employerProfile';
import { STATUS_LABEL, type Status } from '../domain/types';
import { SampleTag } from './AccessBadge';
import { Card } from './Card';
import { Notice } from './Notice';
import { StatusIcon } from './StatusIcon';
import { ChecklistRows } from './WorkplaceChecklist';

const ORDER: Status[] = ['confirmed', 'not-confirmed', 'not-available'];

/**
 * "What job seekers would see": the employer's profile drawn like a job page's workplace section.
 * It updates live while the employer types. It is NOT published anywhere: nothing here reaches the Jobs feed.
 */
export function ProfilePreview({ profile }: { profile: EmployerProfile }) {
  const counts = summarize(profile.features);
  const name = profile.workplaceName.trim();

  return (
    <Card className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-bold text-muted">Accessibility profile preview</p>
        <h2 className="mt-0.5 flex flex-wrap items-center gap-2 text-xl">
          {name || <span className="text-muted">Your workplace name</span>}
          <SampleTag />
        </h2>
        <p className="text-sm text-muted">{profile.area.trim() || 'Area not entered yet'}</p>
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold" aria-label="Summary of statuses">
        {ORDER.map((status) => (
          <li key={status} className="inline-flex items-center gap-1.5">
            <StatusIcon status={status} className="size-4" />
            <span className="tnum">{counts[status]}</span> {STATUS_LABEL[status].toLowerCase()}
          </li>
        ))}
      </ul>

      <ChecklistRows workplace={profile.features} />

      {profile.note.trim() && (
        <div className="rounded-control border border-line bg-page px-3 py-2 text-sm">
          <p className="font-bold">Note from the employer</p>
          <p className="whitespace-pre-line">{profile.note.trim()}</p>
        </div>
      )}

      <Notice tone="prototype">Prototype: this preview and your saved profile stay in this browser. Nothing is published, and job seekers do not see it.</Notice>
    </Card>
  );
}
