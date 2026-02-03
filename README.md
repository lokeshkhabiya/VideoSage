This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Variables

Copy `.env.example` to `.env` and set the required values.

- `OPENAI_API_KEY`
- `OPENAI_CHAT_MODEL` (default: `gpt-5-mini`)
- `OPENAI_FALLBACK_CHAT_MODEL` (default: `gpt-4o-mini`)
- `OPENAI_EMBED_MODEL` (default: `text-embedding-3-small`)
- `PINECONE_API_KEY`, `PINECONE_INDEX`, `PINECONE_NAMESPACE`
- `YOUTUBE_APIKEY`, `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `REDIS_URL`

Note: the Pinecone index dimension must match the embedding model (1536 for `text-embedding-3-small`).

## Redis + Workers (Docker)

The app uses **BullMQ** with Redis for the `content-processing` queue. To run jobs in the background instead of inline, use Redis via Docker.

### Step 1: Install Docker

- **macOS/Windows:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Linux:** `sudo apt install docker.io docker-compose-plugin` (or your distro’s package)

Ensure Docker is running: `docker info`.

### Step 2: Start Redis with Docker Compose

From the project root:

```bash
docker compose up -d redis
```

This starts Redis 7 on `localhost:6379` with persistence (`redis_data` volume). Check it’s up:

```bash
docker compose ps
docker compose exec redis redis-cli ping
# Should print: PONG
```

### Step 3: Configure environment

In `.env`:

- Set **REDIS_URL** (or REDIS_HOST + REDIS_PORT):

  ```env
  REDIS_URL="redis://localhost:6379"
  ```

- To use the **queue** instead of inline processing, either remove `CONTENT_PROCESSING_MODE` or set:

  ```env
  CONTENT_PROCESSING_MODE=queue
  ```

  If both `REDIS_URL` and `REDIS_HOST` are unset, the app falls back to inline processing (no worker needed).

### Step 4: Run the content worker

In a separate terminal:

```bash
pnpm worker:content
```

The worker processes jobs from the `content-processing` queue. Keep it running while you want background processing.

### Step 5: Run the app

```bash
pnpm dev
```

New content will be enqueued to Redis and processed by the worker.

### Useful commands

| Command | Description |
|--------|-------------|
| `docker compose up -d redis` | Start Redis in the background |
| `docker compose down` | Stop Redis (data in volume is kept) |
| `docker compose down -v` | Stop Redis and remove the `redis_data` volume |
| `docker compose logs -f redis` | Follow Redis logs |
| `pnpm worker:content` | Start the content-processing worker |

### Summary

1. **Docker running** → `docker compose up -d redis`
2. **`.env`** → `REDIS_URL="redis://localhost:6379"` and optionally `CONTENT_PROCESSING_MODE=queue`
3. **Terminal 1** → `pnpm dev`
4. **Terminal 2** → `pnpm worker:content`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
