# Deploy Solid One website to Vercel

Repository: https://github.com/solidone-io/Solid-One-Website.git

## Vercel (Hobby)

1. **Delete** any failed import, then go to [vercel.com/new](https://vercel.com/new).
2. Import **solidone-io/Solid-One-Website**.
3. **Root Directory:** leave **empty** (do not set `artifacts/...`).
4. **Framework Preset:** **Other**.
5. Environment variables:
   - `ADMIN_PASSWORD`
   - `MONGODB_URI` — same connection string as auth-api on Railway
   - `MONGODB_DB` — usually `solidone`
6. **Deploy** (Blob is optional; Mongo replaces it).

## Local dev

```bash
pnpm install
pnpm run dev
```

Copy `.env.example` to `.env` at the repo root.

Web: http://localhost:5173 · API: http://localhost:3001
