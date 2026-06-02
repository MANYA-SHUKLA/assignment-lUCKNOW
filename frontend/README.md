# Bulk Email Sender — Frontend

Next.js 16 web UI for the Bulk Email Sender API. Built with the App Router, React 19, TypeScript, Tailwind CSS 4, and Zod.

## Prerequisites

- Node.js 18+
- [Bun](https://bun.sh) for the API (run from the repo root)

The API must be running before you use the UI.

## Quick start

```bash
# From this directory (frontend/)
npm install

npm run dev
```

Open **http://localhost:3001**

### Environment variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Hono API base URL (default `http://localhost:3000`) |

On the API, set `FRONTEND_URL=http://localhost:3001` in the root `.env` so CORS allows cookies.

### Run with the API

**Terminal 1 — API (repo root):**

```bash
bun install
cp .env.example .env
bun run dev
```

**Terminal 2 — Frontend (this folder):**

```bash
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port **3001** |
| `npm run build` | Production build |
| `npm run start` | Serve production build (use `-p 3001` if API uses 3000) |
| `npm run lint` | ESLint |

From the **repo root**, `npm test` runs frontend lint + build.

## Routes

| Path | Description |
|------|-------------|
| `/login` | Sign in / sign up |
| `/compose` | Create campaigns (Excel, HTML, batch, schedule) |
| `/reports` | Email logs, stats, export |
| `/configs` | SMTP configuration CRUD |

Unauthenticated users are redirected to `/login`. `/` redirects to `/compose`.

## Project structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout, toasts
│   ├── globals.css          # Tailwind CSS 4
│   ├── login/page.tsx
│   └── (dashboard)/         # Auth-protected pages
│       ├── layout.tsx
│       ├── compose/page.tsx
│       ├── reports/page.tsx
│       └── configs/page.tsx
├── components/
│   ├── AppNavbar.tsx
│   ├── AuthGuard.tsx
│   ├── JobDashboard.tsx
│   ├── SiteFooter.tsx
│   └── ToastProvider.tsx
└── lib/
    ├── api/                 # API client (cookie auth)
    ├── types.ts
    └── validation.ts        # Zod schemas
```

## Styling

Styling uses **Tailwind CSS 4 only** (`@import "tailwindcss"` in `globals.css`). PostCSS is configured via `@tailwindcss/postcss` in `postcss.config.mjs`.

## API integration

All requests go through `src/lib/api/client.ts` with `credentials: "include"` so the `session_token` cookie from the Hono API is sent automatically.

Example:

```typescript
import { authApi } from "@/lib/api";

const res = await authApi.me();
```

## Production build

```bash
npm run build
NEXT_PUBLIC_API_URL=https://api.yourdomain.com npm run start -- -p 3001
```

Deploy to [Vercel](https://vercel.com) or any Next.js host. Set `NEXT_PUBLIC_API_URL` in the host environment and allow your frontend origin in the API `FRONTEND_URL` / CORS settings.

## Troubleshooting

**CORS or 401 errors** — Confirm the API is up, `NEXT_PUBLIC_API_URL` is correct, and `FRONTEND_URL` on the API matches `http://localhost:3001`.

**Cookies not persisting** — API and browser must treat the API host consistently; avoid mixing `localhost` and `127.0.0.1`.

**Port in use** — Frontend dev uses 3001 so the API can use 3000.

MANYA SHUKLA
