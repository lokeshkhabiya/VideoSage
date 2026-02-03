# Deploy VideoSage on Vercel

Step-by-step guide to deploy the full VideoSage app on Vercel.

---

## Prerequisites

- [Vercel account](https://vercel.com/signup)
- [GitHub](https://github.com) (or GitLab/Bitbucket) with this repo pushed
- API keys and services below (see **Step 2**)

---

## Step 1: Push your code to Git

1. Commit and push your project to GitHub (or your Git provider):

   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. Ensure the repo is the one you’ll connect in Vercel.

---

## Step 2: Set up external services (before first deploy)

VideoSage needs a **PostgreSQL database**, and optionally **Redis** (or use inline processing). Other env vars are required for AI/APIs.

### 2.1 PostgreSQL database

Use one of these (all work with Prisma):

| Provider        | Notes |
|----------------|--------|
| **Vercel Postgres** | Easiest: same dashboard, automatic env vars. |
| **Neon**       | Free tier, serverless Postgres. |
| **Supabase**   | Free tier, Postgres + extras. |
| **Railway / Render** | Simple managed Postgres. |

- Create a new Postgres project.
- Copy **two** URLs:
  - **Pooled / connection string** (for app runtime) → use as `DATABASE_URL`.
  - **Direct** (for migrations) → use as `DIRECT_URL`.

Example format:

```text
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
DIRECT_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

You’ll add these in **Step 4** as Vercel environment variables.

### 2.2 Redis (optional – background worker)

- **Without Redis**: content processing runs **inline** in API routes (simpler, no worker). Set `CONTENT_PROCESSING_MODE=inline` and leave `REDIS_URL` unset.
- **With Redis**: use a hosted Redis (e.g. [Upstash](https://upstash.com) – serverless, free tier) and set `REDIS_URL`. Note: the **worker** (`pnpm worker:content`) does **not** run on Vercel; you’d need to run it elsewhere (e.g. Railway, Render) and point it to the same Redis and DB.

For a first deploy, **recommended**: use **inline** (no Redis, no worker).

### 2.3 Other API keys

Have these ready (from `.env.example`):

- `JWT_SECRET` – long random string (e.g. `openssl rand -base64 32`)
- `OPENAI_API_KEY` – from [OpenAI](https://platform.openai.com/api-keys)
- `YOUTUBE_APIKEY` – from [Google Cloud Console](https://console.cloud.google.com/) (YouTube Data API)
- `PINECONE_API_KEY`, `PINECONE_INDEX`, `PINECONE_NAMESPACE` – from [Pinecone](https://www.pinecone.io/)

Optional: `OPENAI_CHAT_MODEL`, `OPENAI_EMBED_MODEL`, etc. (defaults in code are fine if unset).

---

## Step 3: Create the Vercel project

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **Add New…** → **Project**.
3. **Import** your Git repository (e.g. `videosage`).
4. **Configure project**:
   - **Framework Preset**: Next.js (auto-detected).
   - **Root Directory**: `./` (leave default).
   - **Build Command**: `pnpm run build` (or leave default if it runs `build` from `package.json`).
   - **Output Directory**: leave default (Vercel uses Next.js output).
   - **Install Command**: `pnpm install` (or leave default).
5. Do **not** deploy yet – add environment variables first.

---

## Step 4: Add environment variables

In the Vercel project: **Settings → Environment Variables**. Add these for **Production** (and optionally Preview/Development):

| Name | Value | Required |
|------|--------|----------|
| `DATABASE_URL` | Pooled Postgres URL (for runtime) | Yes |
| `DIRECT_URL` | Direct Postgres URL (for migrations) | Yes |
| `JWT_SECRET` | Strong random secret | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `YOUTUBE_APIKEY` | YouTube Data API key | Yes |
| `PINECONE_API_KEY` | Pinecone API key | Yes |
| `PINECONE_INDEX` | Pinecone index name | Yes |
| `PINECONE_NAMESPACE` | Pinecone namespace | Yes |
| `CONTENT_PROCESSING_MODE` | `inline` (no Redis/worker) | Recommended for Vercel-only |
| `LOG_LEVEL` | `info` (or `debug`) | Optional |

Optional (override defaults):

- `OPENAI_CHAT_MODEL`, `OPENAI_FALLBACK_CHAT_MODEL`, `OPENAI_EMBED_MODEL`

If you use Redis + external worker:

- `REDIS_URL` (and run the worker elsewhere).

Save all variables.

---

## Step 5: Deploy

1. Go to the **Deployments** tab.
2. Click **Redeploy** on the latest deployment, or push a new commit to trigger a deploy.
3. Build will:
   - Run `pnpm install` → `postinstall` runs `prisma generate`.
   - Run `prisma migrate deploy` (applies migrations).
   - Run `next build`.
4. Wait for the build to finish. If it fails, check **Build Logs** and fix env or code (see **Troubleshooting** below).

---

## Step 6: Verify

1. Open the deployment URL (e.g. `https://videosage-xxx.vercel.app`).
2. Test:
   - Sign up / sign in
   - Create a space and add content (e.g. a YouTube URL)
   - With `CONTENT_PROCESSING_MODE=inline`, processing runs in the API; wait for summary/quiz etc. to appear.

---

## Summary of changes made for Vercel

- **next.config.ts**: Removed `output: 'standalone'` (Vercel uses its own output). Kept `serverExternalPackages: ['sharp']`; removed `onnxruntime-node` to avoid native binary issues.
- **package.json**: Build script is `prisma migrate deploy && next build` so migrations run on every deploy.

---

## Troubleshooting

### Build fails: "Prisma migrate" or "DATABASE_URL"

- Ensure `DATABASE_URL` and `DIRECT_URL` are set in Vercel for the same environment you’re building (e.g. Production).
- Prisma 7 reads the URL from `prisma.config.ts` (which uses `DIRECT_URL` for migrations). Ensure `DIRECT_URL` is the direct connection string (not pooled) if your provider distinguishes.

### Build fails: "Cannot find module" or "sharp"

- If you see errors about `sharp` or other native modules, ensure **Node.js version** in Vercel is 18 or 20 (Project Settings → General → Node.js Version).

### Runtime errors: "Redis" or "connection refused"

- If you didn’t set up Redis, set `CONTENT_PROCESSING_MODE=inline` so the app never tries to connect to Redis.
- If you do use Redis, ensure `REDIS_URL` is set and reachable from Vercel (e.g. Upstash allows serverless access).

### Migrations out of sync

- Run migrations locally first: `pnpm prisma migrate deploy` (with the same `DIRECT_URL` / DB as production), then push and redeploy.
- Or run from your machine against production DB (use production `DIRECT_URL` in a one-off env):  
  `DIRECT_URL="postgresql://..." pnpm prisma migrate deploy`

### Need the background worker (Redis + queue)

- Deploy the **Next.js app** on Vercel as above.
- Run the **worker** on a service that supports long-running processes (e.g. Railway, Render, a small VPS).
- In that environment set: `DATABASE_URL`, `REDIS_URL`, and all the same API keys. Run: `pnpm worker:content` (or `pnpm run worker:content`).
- In Vercel, set `CONTENT_PROCESSING_MODE=queue` and `REDIS_URL` so the app enqueues jobs; the external worker will process them.

---

## Optional: Custom domain and env for Preview

- **Custom domain**: Project **Settings → Domains** → add your domain and follow DNS instructions.
- **Preview env**: Use the same variable names in the **Preview** environment so branch deployments use a separate DB/Redis if you want (e.g. a separate Neon DB for previews).

You’re done. For a minimal setup you only need: **Git repo + Vercel project + Postgres (DATABASE_URL + DIRECT_URL) + env vars above + deploy.**
