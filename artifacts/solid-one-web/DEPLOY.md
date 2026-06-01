# Deploy Solid One website to Vercel + GitHub

## GitHub

Repository: https://github.com/Solid-One/Solid-One-Website.git

From the monorepo root (`Solid-One-Solana`):

```bash
git init
git add .
git commit -m "Solid One marketing site"
git branch -M main
git remote add origin https://github.com/Solid-One/Solid-One-Website.git
git push -u origin main
```

Do **not** commit `.env` (secrets). Only commit `.env.example`.

## Vercel project settings

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new).
2. Set **Root Directory** to: `artifacts/solid-one-web`
3. Framework Preset: **Other** (uses `vercel.json`).
4. Add environment variables (Production + Preview):

| Variable | Required | Notes |
|----------|----------|--------|
| `ADMIN_PASSWORD` | Yes | Strong password for `/admin1855` |
| `BLOB_READ_WRITE_TOKEN` | Yes on Vercel | Storage → Blob → Connect to project |

5. Deploy.

## After deploy

- Site: `https://your-project.vercel.app`
- Admin: `https://your-project.vercel.app/admin1855`

Blog posts, newsletter signups, support forms, and store notify emails are stored in **Vercel Blob** (JSON files + uploaded images). Local dev uses the `data/` folder instead.

## Custom domain

In Vercel → Project → Settings → Domains, add `solidone.io` and follow DNS instructions.

## Local development

```bash
pnpm install
pnpm run dev
```

Web: http://localhost:5173 · API: http://localhost:3001
