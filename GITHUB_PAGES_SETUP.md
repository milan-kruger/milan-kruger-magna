# GitHub Pages Deployment Setup

This project is configured to deploy to **GitHub Pages** at:
`https://milan-kruger.github.io/milan-kruger-magna/`

---

## How it works

| Part | Details |
|------|---------|
| **Vite base URL** | `base: '/transgressions/'` in `vite.config.ts` (overridden by `--base` at build time) |
| **Source branch** | `main` |
| **Deployment branch** | `gh-pages` (orphan branch, managed automatically) |
| **CI/CD** | `.github/workflows/deploy-gh-pages.yml` (GitHub Actions) |

Every push to `main` triggers the workflow which:
1. Installs dependencies (`npm ci`)
2. Builds the app with `vite build --base=/milan-kruger-magna/` so all asset paths and the router basename are correct
3. Copies `dist/index.html` → `dist/404.html` so GitHub Pages returns the SPA shell for deep-linked URLs instead of a real 404
4. Adds a `.nojekyll` file so GitHub Pages serves `_` prefixed asset chunks
5. Force-pushes the `dist/` output to the `gh-pages` branch via [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)

---

## How routing works

| Environment | Vite `base` | `BASE_URL` (router basename) |
|-------------|---------------|------------------------------|
| Local dev   | `/transgressions/` (from config) | `/transgressions`            |
| GitHub Pages | `/milan-kruger-magna/` (via `--base`) | `/milan-kruger-magna` |

`src/framework/const.ts` reads `import.meta.env.BASE_URL` at build time.
The `base` in `vite.config.ts` defaults to `/transgressions/` for local dev;
CI overrides it with `--base=/milan-kruger-magna/` for GitHub Pages, keeping
both environments working without any code change.

GitHub Pages doesn't support HTML5 `pushState` routing natively — the
`404.html` copy ensures refreshes/deep-links load the SPA shell, which then
lets React Router handle the path client-side.

---

## One-time GitHub repository setup

1. Go to **Settings → Pages** in your GitHub repository.
2. Under **Build and deployment** set:
   - **Source**: `Deploy from a branch`
   - **Branch**: `gh-pages` / `/ (root)`
3. Click **Save**.

> No personal access token is required — the workflow uses the built-in `GITHUB_TOKEN`.

---

## Manual deployment (optional)

You can also trigger a deployment manually from the **Actions** tab by selecting
**"Deploy to GitHub Pages"** and clicking **"Run workflow"**.

Or build and push locally:

```bash
npm run build
# then push dist/ to gh-pages branch however you prefer
```

---

## Verifying the deployment

After the first successful workflow run visit:
`https://milan-kruger.github.io/milan-kruger-magna/`

