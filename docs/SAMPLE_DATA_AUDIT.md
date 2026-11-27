# Sample-data audit

Everything in this table is invented or unverified. "Labeled" means the person using the site is told so where they meet it.
The check was automated (33 checks in a real browser covering all 8 feed cards, all 8 job pages, the home page, the Method page, the employer preview,
the account menu and the footer) and none failed.

| # | Item | Count | Defined in | Where the person sees the label |
|---|---|---|---|---|
| 1 | Employers (fictional names) | 5 | `src/data/employers.ts` | "Sample" tag beside every employer name (feed cards, job page, employer preview); every record carries `isSample: true`, enforced by the type system and a test |
| 2 | Jobs (titles, summaries) | 8 | `src/data/jobs.ts` | Header "Sample jobs matched to your needs. Every job, employer and route here is sample data"; Sample tag on each card and job page; `isSample: true` |
| 3 | Areas (real city names for invented jobs) | 6 | `src/data/jobs.ts` | Method page says "Area names such as Pasig are real places, but the jobs and employers located there are not" |
| 4 | Workplace accessibility statements | 52 stated + 4 missing | `src/data/jobs.ts` | Checklist text "What the employer has stated about the workplace (sample data)"; missing ones are shown as **Not confirmed**, never accessible |
| 5 | Commute steps (stops, routes, times) | 21 steps (11 walk, 4 LRT/MRT, 4 bus, 1 tricycle, 1 jeepney) | `src/data/jobs.ts` | "Every stop, route and time is fictional"; "(sample estimate)" beside the total; "sample location" at the destination; "Sample starting point" in step names |
| 6 | Commute accessibility statements | 51 | `src/data/jobs.ts` | Same commute notices as #5 |
| 7 | Jobs with no commute information | 1 (Records Clerk) | `src/data/jobs.ts` | Job page says the sample data has no commute steps, so the commute is not confirmed |
| 8 | Match scores and badges | derived | `src/domain/matching.ts` | Always shown under the "sample data" header; "Why this match?" explains each; Method page explains the rules |
| 9 | Needs rules (what each need checks) | 8 needs | `src/data/needs.ts` | Method page table, generated from the same file |
| 10 | The 45-minute "short commute" limit | 1 rule | `src/domain/rules.ts` | Need description says "a prototype rule, using sample times"; Method page lists it under "Rules used for matching" |
| 11 | Demo persona "Maria (demo)" | 1 account | `src/services/auth.ts` | Name "(demo)", "Demo persona (fictional)" in the menu and Account page, notice on arrival, email ends in `.sample` |
| 12 | Built-in demo admin | 1 account | `src/services/auth.ts` | "Admin (demo)", "Built-in demo account" in the menu and Account page; password disclosed on the Account page |
| 13 | Employer profiles typed by users | n/a (user input, unverified) | browser storage | Notice "Use a made-up workplace, not a real company"; Sample tag on the preview; "not published, job seekers do not see it" |
| 14 | The home-page example job | 1 | computed from #2 | Tagged "Example" and "Sample"; the page says everything is made up |
| 15 | Accounts created by visitors | n/a | browser storage | Sign-up notice: "Prototype: no real account is created. Please don't use a real password." |
| 16 | Footer on every page | all pages | `src/components/Footer.tsx` | "Every employer, job and route is sample data" |

## Not in the data, but worth knowing
- **No statistics are used anywhere** in the interface, the README or the demo script.
- **No legal claims.** The Method page says WorkRoute gives no legal advice and checks nothing against any law or standard.
- **Employer names were invented** (Tigib Data Works, Hanay Customer Care, Lambat Print Studio, Pinto Learning Hub, Sinag Accounts Desk). Search each once to be sure none matches a real company.
- **The SDG pages linked** are the UN's own. SDG 8 and SDG 11 addresses were confirmed in a web search; the SDG 10 address follows the same pattern, so click it once.
