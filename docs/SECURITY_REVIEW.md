# Privacy and security review (final)

Reviewed: 24 November 2026, on the production build. This is a student prototype with sample data and **simulated** accounts.

## 1. Exactly what is stored in the browser

All of it is in the browser's `localStorage`, under keys that start with `workroute.`. Nothing is sent to any server. The same list is printed for
users on the "Account and privacy" page, generated from `src/services/storageRegistry.ts`; a test (`accountLifecycle.test.ts`) performs every action in the
app and fails if any key is created that the registry does not describe.

| Key | Holds | Personal |
|---|---|---|
| `workroute.accounts` | For each account: random id, name, email, account type, salt, salted password hash, iteration count, created time. Includes the built-in demo admin and, once used, the demo persona | Yes |
| `workroute.session` | The id of the logged-in account | No |
| `workroute.needs.<account id>` | Chosen needs, as short codes | Yes |
| `workroute.saved.<account id>` | Saved job ids | Yes |
| `workroute.employerProfile.<account id>` | Employer's workplace name, area, note, status per item | Yes |

Also: filter and sort choices are kept in memory only (lost when the tab closes). A temporary test item is written and removed immediately to check that
storage works. No cookies, no sessionStorage, no IndexedDB, no analytics or tracking, no third-party scripts, fonts or images.

Observed in the real browser during the final test run: only `workroute.accounts`, `workroute.session`, `workroute.needs.*` and `workroute.saved.*`
were present; all 30 network requests were `GET` requests to the site itself.

## 2. Passwords

- **No plain-text passwords are stored.** In the final test run, five different passwords typed during the tests were searched for in every stored value: none appeared.
  The account record has these fields only: `accountType, createdAt, email, hash, id, isDemo, iterations, name, passwordless, salt, username`. There is no `password` field.
- Method: PBKDF2 with SHA-512, 210,000 iterations, a random 16-byte salt per account, using the browser's built-in Web Crypto. Hash comparison is constant-time.
- Log-in gives one message for "no such account" and "wrong password" and does the same slow work in both cases, so neither the words nor the timing reveal which.
- **Two deliberate exceptions, both disclosed in the interface:**
  1. The demo admin's password (`123456`) is written in the source code (`src/services/auth.ts`) and therefore in the downloadable JavaScript. It is stored hashed like any other,
     but anyone can read it in the code. It exists for the course demo. Never reuse that password anywhere.
  2. The demo persona (Maria) has **no password at all** (`passwordless`). The log-in form can never open her account; only the "Try demo persona" button does.

## 3. What the simulated login does NOT protect

Say this plainly in the video or the write-up if asked:

- **Anyone who can use this browser can read, edit or delete everything.** Open developer tools, Application, Local Storage, and the accounts are right there.
  The hashes make passwords unreadable at a glance, but the code that checks them lives in the same browser, so an attacker on the device can guess passwords offline with no rate limit.
- **Nothing is checked by a server.** Route guards (`RequireAuth`) only decide what the screen shows. All pages and all sample data are inside the downloaded JavaScript for everyone.
  Someone can edit local storage to become an "admin" or an "employer" on their own browser, and nothing is harmed because nothing is shared.
- **No limit on guesses, no lock-out, no session expiry, no "forgot password", no email verification, no two-factor.**
- **No protection from other sites on the same address.** Browsers keep storage per web address. On GitHub Pages every project under `username.github.io` shares one address,
  so another project of yours could read `workroute.*` items. (The prefix prevents accidental clashes, not snooping.)
- **No protection if the device itself is compromised** (malware, browser extensions with page access, a shared computer).
- **Deleting an account removes data from this browser only.** There is nowhere else the data goes, but copies someone made themselves are out of reach.

A real service needs a server that checks passwords, enforces who may see what, rate-limits attempts and stores data on its side. See "How to replace the simulated auth" in the README.

## 4. Dependency audit

- `npm audit` (all dependencies) and `npm audit --omit=dev` (what ships): **0 vulnerabilities**.
- `npm outdated`: nothing outdated at the time of review.
- 6 runtime libraries: react, react-dom, react-router-dom, framer-motion, @fontsource-variable/atkinson-hyperlegible-next (self-hosted font). The rest are build and test tools that do not ship.
- Re-run `npm audit` before submitting. New advisories appear over time.

## 5. Other findings

| Check | Result |
|---|---|
| `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, `document.write` in the source | None. Everything typed by a user (names, employer notes) is rendered by React as text, which escapes it |
| External links | Three (SDG pages at sdgs.un.org), all with `rel="noopener noreferrer"` and a "(opens in a new tab)" notice for screen readers |
| Third-party requests at runtime | None observed. The font file is bundled and served from the site |
| Content-Security-Policy | Added to the built site (`default-src 'self'`; scripts, fonts, images and requests only from the site itself; no objects; forms only to itself). Delivered by a `<meta>` tag because GitHub Pages cannot set headers, so `frame-ancestors` and some rules cannot be enforced. It did block my own test tool's injected script during testing, which shows it is active. `style-src` needs `'unsafe-inline'` for the boot loader and Framer Motion's inline styles |
| Referrer policy | `no-referrer` (the sdgs.un.org links do not learn which page you came from) |
| Storage failure (private mode, blocked, full) | Falls back to memory and the sign-up page warns that data will disappear when the tab closes |
| Corrupted or hand-edited stored data | Parsed defensively; bad records are ignored instead of crashing |
| Cross-tab changes | Logging in or out in another tab is followed here |
| Web Crypto unavailable (opened over plain `http://` on a network address) | Sign-up and log-in show a clear message. `localhost` and `https://` are fine |

## 6. Left as is (accepted for a prototype)

1. The demo admin password in the code (disclosed on the Account and privacy page).
2. No rate limiting or session expiry (impossible without a server).
3. `style-src 'unsafe-inline'` (needed by the loader and the animation library).
4. A `<meta>` CSP instead of real headers (GitHub Pages limitation).
