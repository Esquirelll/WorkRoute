# Publishing WorkRoute on GitHub Pages (beginner guide)

GitHub Pages hosts a website for free from a GitHub repository. WorkRoute is a "static" site (no server), so it fits perfectly.
The project is already set up for it: it uses relative file paths and `#` addresses, so it works from `https://YOUR-USERNAME.github.io/workroute/`.

## What you need

1. A free account at <https://github.com>.
2. **Node.js** (LTS, version 22 or newer): <https://nodejs.org>. Check with `node -v` in a terminal.
3. **Git**: <https://git-scm.com/downloads>. Check with `git --version`.
4. Optional but easier for beginners: **GitHub Desktop** (<https://desktop.github.com>), which replaces the Git commands below with buttons.

## Step 0: make sure it works on your computer

Open a terminal in the project folder (the one containing `package.json`) and run:

```
npm install
npm test
npm run build
npm run preview
```
Open the address it prints (usually <http://localhost:4173>) and click around. If all of that works, you are ready.

## Option A (recommended): automatic publishing with GitHub Actions

The file `.github/workflows/deploy.yml` is already in the project. It runs the tests, builds the site and publishes it every time you push.

1. **Create the repository.** On github.com click **+** (top right) then **New repository**. Name: `workroute`. Choose **Public** (free Pages needs public on a free account). Do **not** tick "Add a README". Click **Create repository**.
2. **Send your project to GitHub.** In the terminal, inside the project folder:
   ```
   git init
   git add .
   git commit -m "WorkRoute prototype"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/workroute.git
   git push -u origin main
   ```
   Replace `YOUR-USERNAME`. If Git asks you to log in, follow the browser prompt, or use a **personal access token** as the password
   (GitHub: Settings, Developer settings, Personal access tokens). With GitHub Desktop instead: File, Add local repository, then Publish repository.
   The file `.gitignore` already keeps `node_modules` and `dist` out of GitHub; that is correct.
3. **Turn on Pages.** In the repository: **Settings** then **Pages** (left menu) then under **Build and deployment** set **Source** to **GitHub Actions**.
4. **Run it.** Open the **Actions** tab. The workflow "Deploy to GitHub Pages" starts after your push (if it ran before you did step 3, click it and press **Re-run all jobs**).
   Wait for two green ticks (about 1–2 minutes).
5. **Open your site:** `https://YOUR-USERNAME.github.io/workroute/`. The exact link is also shown in the deploy job and under Settings, Pages.
6. **To update it later:** change something, then
   ```
   git add .
   git commit -m "Describe what you changed"
   git push
   ```
   and wait for the green ticks again.

## Option B (no Git, no Actions): upload the built files

1. Run `npm run build`. This creates a `dist` folder.
2. Create the repository (step 1 above), then on its page click **Add file** then **Upload files**.
3. Open the `dist` folder and drag **its contents** (`index.html`, `assets`, `favicon.svg`) into the page, not the `dist` folder itself. Click **Commit changes**.
4. **Settings**, **Pages**, **Source: Deploy from a branch**, Branch: `main`, folder `/ (root)`, **Save**. Wait a minute and open the link.
5. Every time you change the project, build again and upload the new contents.

## If something goes wrong

| Problem | Fix |
|---|---|
| Blank page | Press Ctrl+Shift+R (hard refresh). Open the browser console (F12) for red errors. Check that you uploaded the **contents** of `dist` (Option B). |
| Actions shows "Pages not enabled" or a permissions error | Do step 3 (Source: GitHub Actions), then re-run the workflow. |
| The workflow fails at "npm test" | A test is failing. Run `npm test` locally and fix it. The site is intentionally not published while tests fail. |
| The workflow fails at "npm ci" | Make sure `package-lock.json` was committed. |
| An old version still shows | Hard refresh. GitHub Pages can take a minute or two to update. |
| A step in the workflow warns an action is outdated | Open the workflow file and raise the version number it names (for example `actions/checkout@v4` to the newer one). |
| Fonts or styles missing | Do not open `dist/index.html` by double-clicking. Use `npm run preview`, or the GitHub link. |

## Good to know before you share the link

- **Everything stays in the visitor's own browser.** There is no server and no database. Nobody (including you) can see anyone's data.
- **Pages from the same account share one browser "origin".** Browsers keep storage per web address, and every project on `YOUR-USERNAME.github.io` shares it. WorkRoute prefixes all its items with `workroute.`, but another project of yours on the same address could read them. Do not enter real personal data.
- The built site includes a Content-Security-Policy `<meta>` tag. GitHub Pages cannot send real security headers, so this is a partial but useful protection.
- Search engines and anyone with the link can open a public Pages site. It contains only sample data and the code is public in your repository.
