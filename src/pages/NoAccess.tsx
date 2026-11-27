import { ButtonLink } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { ACCOUNT_TYPE_LABEL, type AccountType, type User } from '../domain/types';
import { homeFor } from '../app/access';

/** Shown when someone is logged in but this page is meant for the other account type. */
export function NoAccess({ user, allow }: { user: User; allow: AccountType[] }) {
  const forSeekers = allow.includes('seeker');
  return (
    <>
      <PageHeader title={forSeekers ? 'This page is for job seekers' : 'This page is for employers'}>
        You are logged in as {ACCOUNT_TYPE_LABEL[user.accountType].toLowerCase()}.
      </PageHeader>
      <p className="mb-4 text-muted">
        {forSeekers
          ? 'Job seeker accounts choose their needs and browse jobs.'
          : 'Employer accounts describe their workplace accessibility.'}{' '}
        To use this page, log out and sign up with the other account type.
      </p>
      <ButtonLink to={homeFor(user)}>Go to my page</ButtonLink>
    </>
  );
}
