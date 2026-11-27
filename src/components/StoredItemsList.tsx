import { STORED_ITEMS } from '../services/storageRegistry';
import { Card } from './Card';

/** The complete list of what WorkRoute stores in the browser, printed from the registry (see storageRegistry.ts). */
export function StoredItemsList() {
  return (
    <ul className="flex flex-col gap-3">
      {STORED_ITEMS.map((item) => (
        <li key={item.name}>
          <Card className="!p-3">
            <p className="break-all font-bold">
              <code>{item.name}</code>
            </p>
            <dl className="mt-1.5 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[9rem_1fr]">
              <dt className="font-bold">Holds</dt>
              <dd>{item.holds}</dd>
              <dt className="font-bold">Personal details</dt>
              <dd>{item.personal === 'yes' ? 'Yes' : 'No'}</dd>
              <dt className="font-bold">Written</dt>
              <dd>{item.written}</dd>
              <dt className="font-bold">Removed</dt>
              <dd>{item.removed}</dd>
            </dl>
          </Card>
        </li>
      ))}
    </ul>
  );
}
