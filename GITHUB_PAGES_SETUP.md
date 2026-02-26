# GitHub Pages Deployment Setup

This project is configured to deploy to **GitHub Pages** at:
`https://milan-kruger.github.io/milan-kruger-magna/`

---

## How it works

| Part | Details |
|------|---------|
| **Vite base URL** | `base: '/milan-kruger-magna/'` in `vite.config.ts` |
| **Source branch** | `main` |
| **Deployment branch** | `gh-pages` (orphan branch, managed automatically) |
| **CI/CD** | `.github/workflows/deploy-gh-pages.yml` (GitHub Actions) |

Every push to `main` triggers the workflow which:
1. Installs dependencies (`npm ci`)
2. Builds the app (`npm run build`)
3. Force-pushes the `dist/` output to the `gh-pages` branch via [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)

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

