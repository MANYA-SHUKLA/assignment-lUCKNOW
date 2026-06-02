# Bulk Email Sender

A production-oriented bulk email web application with a **Hono API** (Bun) and a **Next.js 16** frontend styled with **Tailwind CSS 4** only.

The backend logic and SQLite schema are unchanged from the original assignment.

## Architecture

| Layer | Stack |
|-------|--------|
| **API** | Hono, Bun, SQLite, Argon2, Nodemailer |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Zod |
| **Auth** | HTTP-only `session_token` cookie + CORS credentials |

```
frontend/     Next.js UI (port 3001 in dev)
src/          Hono API (port 3000)
data/         SQLite (unchanged schema)
```

## Quick start

### 1. Backend

```bash
cp .env.example .env
# FRONTEND_URL=http://localhost:3001

bun install
bun run dev
```

API: **http://localhost:3000**

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

UI: **http://localhost:3001**

## Features

- Login / register
- SMTP config CRUD, test connection, default config
- Compose: Excel upload, HTML content, batch & schedule, job dashboard
- Reports: stats, filter, CSV/JSON export
- Adaptive polling for batch & scheduled jobs

## Tailwind CSS 4

Configured via `@tailwindcss/postcss` and `@import "tailwindcss"` in `frontend/src/app/globals.css`. No Bootstrap or other CSS frameworks.

## Production

- `npm run build:frontend` — build Next.js app
- Set `NEXT_PUBLIC_API_URL` to your API origin
- Set `FRONTEND_URL` on the API for CORS

## API reference

See previous README sections — all `/auth`, `/config`, `/send`, `/report`, `/dashboard` endpoints are unchanged.

## License

MIT
