# Bulk Email Sender — Next.js Frontend Migration Project

## Project overview

This is a **Bulk Email Sender** application with a **Hono API** (Bun) and a legacy vanilla **HTML/CSS/JavaScript** frontend. Your assignment is to **migrate the frontend to Next.js** while keeping the **existing Hono backend logic and SQLite schema unchanged**.

### Current tech stack

- **Backend**: Hono (Bun runtime)
- **Frontend**: Vanilla HTML/CSS/JS with Bootstrap 5, Quill Editor
- **Database**: SQLite (via `bun:sqlite`)
- **Authentication**: Argon2 password hashing with session tokens
- **Email**: Nodemailer with SMTP

### Target tech stack

- **Backend**: Hono on Bun (keep routes and business logic as-is)
- **Frontend**: **Next.js 16** (App Router), **React 19**, **TypeScript**
- **Styling**: **Tailwind CSS 4 only** (no Bootstrap or other CSS frameworks)
- **Validation**: Zod (recommended)
- **Database**: SQLite (unchanged schema)
- **Authentication**: Same session cookie flow, adapted for Next.js client-side API calls

---

## Assignment objectives

### 1. Understand the existing system

Analyze and document:

- Backend API endpoints and routes
- Database schema and user management
- Authentication flow (login, register, sessions)
- Email sending logic (single, batch, scheduled)
- SMTP configuration management
- File upload handling (Excel contacts, HTML templates)
- Reporting and analytics features

### 2. Keep the backend unchanged

- Do **not** modify backend business logic or database structure
- Keep all Hono routes and services intact
- API remains on port **3000** in development
- Configure **CORS** with `credentials: true` for the Next.js dev origin

### 3. Implement Next.js frontend

- Create a **modern, clean UI** using Next.js App Router
- Implement all existing features with improved UX
- Use a clear folder structure (`app/`, `components/`, `lib/`)
- Centralize API calls in `lib/api/`
- Add client-side validation (Zod) and error handling
- Implement responsive design (mobile-friendly)
- Style with **Tailwind CSS 4 only**

### 4. Remove old frontend

- Delete the `public/` folder (HTML, CSS, JS)
- Remove static file serving from the backend (API only)
- Ensure no dependency on legacy frontend code

### 5. Update documentation

- Update root `README.md` with new architecture
- Document setup for API and frontend
- Add API endpoint reference
- Update `CONTRIBUTING.md` if needed

---

## Current project structure

```
assignment/
├── src/                          # Hono API (Bun)
│   ├── app.ts                      # Main app, CORS, routes
│   ├── types.ts                    # TypeScript interfaces
│   ├── middleware/
│   │   └── auth.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── config.ts
│   │   ├── dashboard.ts
│   │   ├── report.ts
│   │   └── send.ts
│   └── services/
│       ├── batchService.ts
│       ├── emailService.ts
│       ├── fileService.ts
│       ├── logService.ts
│       ├── notificationService.ts
│       ├── providerLimits.ts
│       ├── schedulerService.ts
│       └── userDatabase.ts
├── frontend/                     # Next.js app (NEW)
│   ├── src/
│   │   ├── app/                  # App Router pages
│   │   ├── components/
│   │   └── lib/
│   │       ├── api/
│   │       ├── types.ts
│   │       └── validation.ts
│   ├── package.json
│   ├── next.config.ts
│   └── postcss.config.mjs        # Tailwind CSS 4
├── data/                         # SQLite databases
├── uploads/
├── logs/
├── package.json                  # Backend
└── tsconfig.json
```

---

## Key features to implement

### 1. Authentication

- Login / register with validation
- Session via HTTP-only `session_token` cookie
- Protected routes (redirect to `/login` if unauthenticated)
- User display in navbar (name, email)
- Logout

**API endpoints:**

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /user/info`

### 2. SMTP configuration

- List, add, edit, delete configs
- Set default configuration
- Test SMTP connection
- Multiple accounts per user

**API endpoints:**

- `GET /config/smtp`
- `POST /config/smtp`
- `PUT /config/smtp/:configId`
- `DELETE /config/smtp/:configId`
- `POST /config/smtp/:configId/default`
- `POST /config/smtp/test`

### 3. Email sending

- Upload Excel contacts
- HTML content (textarea or rich editor)
- Optional HTML template file upload
- Subject with placeholders (`{{FirstName}}`, `{{Company}}`, etc.)
- Send immediately, batch, or schedule
- Email range selection (all / first N / row range)
- Real-time job dashboard

**API endpoints:**

- `POST /send` (multipart form data)
- `POST /parse-excel`
- `GET /batch-status`
- `POST /batch-pause` | `POST /batch-resume` | `DELETE /batch-cancel`
- `GET /scheduled-jobs`
- `DELETE /scheduled-jobs/:id`
- `POST /test-notification`

### 4. Dashboard and monitoring

- Active batch jobs with pause / resume / cancel
- Scheduled jobs list with cancel
- Smart polling via `/dashboard/poll-status`

**API endpoints:**

- `GET /dashboard/poll-status`
- `GET /dashboard/data`

### 5. Reports

- Logs table with status filter
- Statistics cards
- Export CSV / JSON
- Clear logs

**API endpoints:**

- `GET /report`
- `GET /report/export/csv` | `/json`
- `DELETE /report/clear`

---

## Database schema

### users

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_login TEXT,
  is_active INTEGER DEFAULT 1
);
```

### user_sessions

```sql
CREATE TABLE user_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

### smtp_configs

```sql
CREATE TABLE smtp_configs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  host TEXT NOT NULL,
  port INTEGER NOT NULL,
  secure INTEGER DEFAULT 0,
  user TEXT NOT NULL,
  pass TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  is_default INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

### scheduled_jobs

```sql
CREATE TABLE scheduled_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  email_job TEXT NOT NULL,
  batch_config TEXT,
  scheduled_time TEXT NOT NULL,
  notify_email TEXT,
  notify_browser INTEGER DEFAULT 0,
  status TEXT DEFAULT 'scheduled',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  started_at TEXT,
  completed_at TEXT,
  contact_count INTEGER,
  subject TEXT,
  use_batch INTEGER DEFAULT 0,
  config_name TEXT
);
```

---

## UI/UX requirements

### Design principles

- Clean, modern layout
- Clear navigation (Compose, Reports, SMTP Configs)
- Responsive (mobile, tablet, desktop)
- Accessible (labels, ARIA, keyboard-friendly controls)
- Loading and error states on all async actions

### Styling

- **Tailwind CSS 4** via `@import "tailwindcss"` in `globals.css`
- Use `@tailwindcss/postcss` in `postcss.config.mjs`
- Suggested palette: indigo/violet primary (`#4f46e5` → `#7c3aed`), emerald success, red danger

### UI components

1. Navigation bar with user menu
2. Cards for forms and statistics
3. Tables for logs and configs
4. Forms with validation messages
5. Toast notifications for success/error
6. Job dashboard for batch and scheduled work
7. Status badges (Sent, Failed, Error)

---

## Suggested Next.js folder structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout + ToastProvider
│   │   ├── globals.css             # Tailwind CSS 4
│   │   ├── page.tsx                # Redirect to /compose
│   │   ├── icon.svg                # Favicon
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── (dashboard)/
│   │       ├── layout.tsx          # AuthGuard + shell
│   │       ├── compose/
│   │       │   └── page.tsx
│   │       ├── reports/
│   │       │   └── page.tsx
│   │       └── configs/
│   │           └── page.tsx
│   ├── components/
│   │   ├── AppNavbar.tsx
│   │   ├── AuthGuard.tsx
│   │   ├── JobDashboard.tsx
│   │   ├── SiteFooter.tsx
│   │   └── ToastProvider.tsx
│   └── lib/
│       ├── api/
│       │   ├── client.ts           # fetch + credentials
│       │   └── index.ts            # auth, config, send, report, dashboard
│       ├── types.ts
│       └── validation.ts           # Zod schemas
├── .env.example                    # NEXT_PUBLIC_API_URL
├── next.config.ts
├── postcss.config.mjs
├── package.json
└── tsconfig.json
```

---

## Development setup

### Backend (port 3000)

```bash
bun install
cp .env.example .env
# FRONTEND_URL=http://localhost:3001
bun run dev
```

### Frontend (port 3001)

```bash
cd frontend
npm install
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3000
npm run dev
```

Open **http://localhost:3001** for the UI.

### API client example

```typescript
// frontend/src/lib/api/client.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function api<T>(path: string, options: RequestInit & { json?: unknown } = {}) {
  const { json, headers, ...rest } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      ...(json ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: json ? JSON.stringify(json) : rest.body,
    ...rest,
  });
  return res.json() as Promise<T>;
}
```

### Backend CORS (already required)

```typescript
app.use("*", cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3001",
  credentials: true,
}));
```

---

## Implementation checklist

### Phase 1: Backend review

- [ ] Document all API endpoints
- [ ] Confirm CORS and cookie settings
- [ ] Remove static `public/` serving
- [ ] Verify auth middleware on protected routes

### Phase 2: Next.js setup

- [ ] `npx create-next-app@latest frontend` with TypeScript + Tailwind CSS 4
- [ ] Configure `NEXT_PUBLIC_API_URL`
- [ ] Dev server on port 3001 (`next dev -p 3001`)
- [ ] API client with `credentials: "include"`

### Phase 3: Authentication

- [ ] `/login` page (sign in + sign up tabs)
- [ ] `AuthGuard` for `(dashboard)` routes
- [ ] Redirect unauthenticated users to `/login`

### Phase 4: SMTP configuration

- [ ] List / add / edit / delete configs
- [ ] Test connection
- [ ] Set default config

### Phase 5: Compose and sending

- [ ] Excel upload and preview
- [ ] HTML content + optional template file
- [ ] Batch and schedule options
- [ ] Send form → `POST /send`
- [ ] Job dashboard polling

### Phase 6: Reports

- [ ] Stats cards and logs table
- [ ] Filter by status
- [ ] Export CSV / JSON
- [ ] Clear logs

### Phase 7: Polish

- [ ] Responsive layout
- [ ] Toasts and loading states
- [ ] ESLint clean (`npm run lint`)
- [ ] Production build (`npm run build`)
- [ ] Update README and CONTRIBUTING

---

## Testing

### From repo root

```bash
npm test
```

Runs frontend ESLint and production build.

### Manual testing

- [ ] Register and login
- [ ] CRUD SMTP configs and test connection
- [ ] Parse Excel and send / schedule / batch
- [ ] Pause / resume / cancel batch
- [ ] View reports and export
- [ ] Logout and session expiry

---

## Deployment

### Backend

- Bun or Node host (Railway, Render, VPS)
- Persistent `data/`, `uploads/`, `logs/`
- Set `FRONTEND_URL` to production UI origin

### Frontend

- **Vercel** (recommended for Next.js) or similar
- Set `NEXT_PUBLIC_API_URL` to production API URL
- Ensure API CORS allows the deployed frontend origin

---

## Resources

### Next.js

- [Next.js Documentation](https://nextjs.org/docs)
- [App Router](https://nextjs.org/docs/app)

### React

- [React Documentation](https://react.dev/)

### Tailwind CSS 4

- [Tailwind CSS v4](https://tailwindcss.com/docs)

### Other

- [Zod](https://zod.dev/)
- [Hono](https://hono.dev/)

---

## Evaluation criteria

### Code quality (30%)

- Clean TypeScript
- Reusable components
- Centralized API layer
- Error handling

### Functionality (40%)

- All features work against the existing API
- Auth, configs, send, batch, schedule, reports
- File uploads and polling

### UI/UX (20%)

- Modern Tailwind UI
- Responsive layout
- Clear feedback (loading, errors, toasts)

### Documentation (10%)

- README setup instructions
- API reference
- Clear repo structure

---

## Deliverables

1. **Next.js frontend** in `frontend/`
2. **Unchanged Hono backend** (logic and schema)
3. **Updated README.md**
4. **No legacy `public/` frontend**
5. Screenshots or short demo (optional)

---

## Pro tips

1. Use TypeScript strictly in `frontend/`
2. Keep API calls in `lib/api/` — one place for cookies and base URL
3. Validate forms with Zod before submit
4. Use `"use client"` only where needed (forms, polling, auth guard)
5. Run `npm run lint` and `npm run build` before submitting
6. Test on mobile viewport sizes
7. Do not change backend routes or SQLite schema for this assignment

---

## Common issues

### CORS errors

Set `FRONTEND_URL=http://localhost:3001` in backend `.env` and use `credentials: "include"` in fetch.

### Session cookies not sent

Same-site cookies require correct origins; use `NEXT_PUBLIC_API_URL` pointing directly at the API (not a mismatched host).

### Port conflict

API on **3000**, Next.js on **3001**.

### ESLint `set-state-in-effect`

Load data in `useEffect` with async IIFE + `cancelled` flag, not by calling a function that synchronously sets state from the effect body.

---

## Success indicators

- Authentication works (login, register, logout, protected routes)
- SMTP configs fully manageable
- Emails send (immediate, batch, scheduled)
- Job dashboard updates via polling
- Reports and export work
- Responsive Tailwind UI
- `public/` legacy frontend removed
- `npm test` passes from repo root

---

## Questions?

1. Read backend route handlers in `src/routes/`
2. Check `src/types.ts` for data shapes
3. Test APIs with Postman or Thunder Client
4. Read [Next.js App Router docs](https://nextjs.org/docs/app)
5. Use browser DevTools → Network for cookie and CORS issues

---

**Good luck — build something production-ready.**
