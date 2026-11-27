import { ButtonLink } from '../components/Button';
import { PageHeader } from '../components/PageHeader';

export function NotFound() {
  return (
    <>
      <PageHeader title="Page not found">
        That address doesn&rsquo;t match a page in WorkRoute.
      </PageHeader>
      <ButtonLink to="/">Go to the home page</ButtonLink>
    </>
  );
}
