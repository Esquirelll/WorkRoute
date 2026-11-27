import type { Employer } from '../domain/types';

/**
 * SAMPLE DATA. Every employer is invented. Names were made up for this prototype;
 * check that none matches a real company before publishing or recording the demo.
 */
export const EMPLOYERS: Employer[] = [
  { id: 'tigib', name: 'Tigib Data Works', about: 'A made-up office that processes records and checks quality for fictional clients.', isSample: true },
  { id: 'hanay', name: 'Hanay Customer Care', about: 'A made-up customer support team that works in chat and by email.', isSample: true },
  { id: 'lambat', name: 'Lambat Print Studio', about: 'A made-up print and layout studio.', isSample: true },
  { id: 'pinto', name: 'Pinto Learning Hub', about: 'A made-up tutoring center that coordinates classes for fictional learners.', isSample: true },
  { id: 'sinag', name: 'Sinag Accounts Desk', about: 'A made-up bookkeeping and records office.', isSample: true },
];
