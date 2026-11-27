# WorkRoute

A website that helps persons with disabilities in Metro Manila find jobs where **both the workplace and the commute** are accessible.
For every job it shows a workplace badge and a commute badge side by side, a step-by-step commute, and a plain-language
"Why this match?". Built for GED104 (SDG 8, 10 and 11).

**All employers, jobs, routes and accessibility statements are invented sample data.** Accounts are simulated and live only in the browser.

Stack: React 19, TypeScript, Vite, Tailwind CSS 4, Framer Motion, React Router (HashRouter), Vitest. No backend.

## Run it

You need [Node.js](https://nodejs.org) (the LTS version, 22 or newer).

```
npm install        # once: downloads the libraries
npm run dev        # development server at http://localhost:5173
npm test           # runs all tests (about 130)
npm run typecheck  # TypeScript check only
npm run build      # type-check + production build into /dist
npm run preview    # serve the production build at http://localhost:4173
```

Handy during development: `/?slow#/` shows the first-load loader, and `/?slowjobs#/jobs` shows the jobs loader.
Demo logins: click **Try demo persona** (Maria, no password), or log in as username `admin` / password `123456` (built-in demo admin).

## Where things live

| Folder | What is in it |
|---|---|
| `src/data/` | **All sample content**: `employers.ts`, `jobs.ts`, `needs.ts` (what each need checks), `features.ts` (labels and help text) |
| `src/domain/` | Pure logic with tests, no React: `matching.ts` (the matching engine), `feed.ts` (filters and sorting), `validation.ts`, `employerProfile.ts`, `rules.ts` |
| `src/services/` | Everything that touches the browser's storage: `auth.ts`, `needs.ts`, `savedJobs.ts`, `employerProfile.ts`, `catalog.ts`, plus `storageRegistry.ts` (the list of what is stored) |
| `src/components/` | Reusable interface pieces (buttons, form fields, badges, job card, commute stepper ...) |
| `src/pages/` | One file per screen |
| `src/app/` | The shell (navigation, footer), routes, route guards, lazy loading |
| `src/motion/` | `motion.ts` is the ONE place for animation numbers. See `src/motion/README.md` |
| `src/styles/index.css` | Design tokens: colors, type scale, radii |
| `docs/` | Demo script, deployment guide, checklist, sample-data audit, security review |

## How to edit the content

**Change or add a job** (`src/data/jobs.ts`). Copy an existing job and change it. Each workplace feature is `OK` (confirmed),
`UNSURE` (not confirmed) or `NO` (not available). A feature you leave out counts as *not confirmed*, never as accessible.
A commute is a list of steps made with `walk(...)` and `ride(...)`. Keep `isSample: true`. Run `npm test`: the data tests catch typos
(unknown employer, a feature that makes no sense for a transport type, a missing Sample flag).

**Change what a need checks** (`src/data/needs.ts`). Each need is a list of requirements. The Method page table is built from the same file,
so it updates itself.

**Change a prototype rule.** The 45-minute "short commute" limit is `SHORT_COMMUTE_MAX_MINUTES` in `src/domain/rules.ts`.

**Add a new workplace feature.** (1) add its name to the `WorkplaceFeature` type in `src/domain/types.ts`, (2) add a label and a help sentence in
`src/data/features.ts`, (3) use it in a need in `src/data/needs.ts`, (4) give it a status in the jobs. TypeScript will point at anything you forget.

**Change colors or fonts.** Edit the tokens at the top of `src/styles/index.css`. `npm test` checks the contrast of the important pairs.
**Change animation feel.** Edit `src/motion/motion.ts` only; a test stops private numbers from appearing in components.

## What the matching does (short version)

1. Each chosen need becomes a list of checks. 2. Every check is *confirmed*, *not confirmed* or *not available*; missing information is *not confirmed*.
3. The commute is judged step by step and the **weakest step decides**. 4. A need takes the worst status of its checks.
5. A job where any chosen need is *not available* is excluded (hidden by default, with a switch). 6. Score = percent of chosen needs fully confirmed.
No AI or machine learning. The code is `src/domain/matching.ts`; the tests are `matching.test.ts`.

## How to replace the simulated auth with a real backend

The screens never touch accounts directly. They only call `src/services/auth.ts`, which promises this:

| Function | Today | With a real backend |
|---|---|---|
| `signUp(input)` | validates, hashes, saves in localStorage | `POST /accounts`; the **server** validates and hashes (Argon2 or bcrypt) |
| `logIn(identifier, password)` | checks the hash in the browser | `POST /sessions`; the server sets an `HttpOnly`, `Secure` cookie |
| `logOut()` | removes the local session | `DELETE /sessions` |
| `getCurrentUser()` | reads the local session | `GET /me` (cache the result so the same object is returned until it changes) |
| `subscribe(listener)` | notifies on changes | keep: call the listeners after login/logout |
| `deleteAccount()` | removes local records | `DELETE /me` |

Steps: (1) keep the exported names and return types, rewrite the insides to call your API with `fetch`; (2) delete `crypto.ts` and the demo admin and
`passwordless` logic (the demo persona can stay as a server-side seeded account); (3) make the **server** enforce who may see what: `RequireAuth` only
changes what the screen shows; (4) move the other per-account data the same way: `needs.ts`, `savedJobs.ts`, `employerProfile.ts` (same function names, API
inside) and `catalog.ts` (`fetch` the jobs instead of importing the sample files); (5) update `storageRegistry.ts` and the "Account and privacy" text to
match what is really stored and where; (6) in `vite.config.ts` add your API address to `connect-src`; (7) if you move to a host with real
routing, you may swap `HashRouter` for `BrowserRouter` in `src/main.tsx` (GitHub Pages needs the hash).

## Deploying

See `docs/DEPLOY.md` (step by step for beginners) and `docs/CHECKLIST.md` (before you submit).
The site is static and works from any sub-folder, such as `username.github.io/workroute/`.

## What this prototype does NOT do

No real security (see `docs/SECURITY_REVIEW.md`), no real jobs or routes, no verification of any statement, no legal advice, no "forgot password",
social login or email verification, and the employer profile is not shown to job seekers.
