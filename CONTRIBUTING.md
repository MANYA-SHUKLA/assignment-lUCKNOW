# Contributing to Bulk Email Sender

Thank you for your interest in contributing. We welcome contributions from everyone.

## Project overview

This repo is split into two apps:

| Part | Stack | Dev URL |
|------|--------|---------|
| **API** | Hono, Bun, SQLite, Nodemailer | http://localhost:3000 |
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4 | http://localhost:3001 |

Do not change backend business logic or the database schema unless explicitly discussed in an issue. Frontend changes live under `frontend/`.

## How to contribute

### 1. Fork the repository

- Fork the repo on GitHub
- Clone your fork: `git clone https://github.com/YOUR_USERNAME/assignment.git`

### 2. Set up your development environment

**Prerequisites:** [Bun](https://bun.sh) >= 1.0, Node.js >= 18

**Backend (API):**

```bash
bun install
cp .env.example .env
# Set FRONTEND_URL=http://localhost:3001
bun run dev
```

**Frontend (separate terminal):**

```bash
cd frontend
npm install
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3000
npm run dev
```

Open the UI at http://localhost:3001. The API runs at http://localhost:3000.

### 3. Create a branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix-name
```

Branch naming:

- `feature/add-export-format` — new features
- `fix/login-redirect` — bug fixes
- `docs/update-readme` — documentation
- `refactor/api-client` — refactoring

### 4. Make your changes

- Write clear, readable TypeScript
- Match existing patterns in the area you edit
- Keep commits focused and atomic
- Use meaningful commit messages
- Prefer self-explanatory code; comment only non-obvious logic

#### Commit message format

```
type(scope): brief description

Detailed explanation if needed

Closes #issue_number
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:

```
feat(frontend): add provider limit warning on compose page

- Fetch provider info when SMTP host changes
- Show daily limit in compose UI

Closes #123
```

### 5. Test your changes

From the repo root:

```bash
npm test
```

This runs frontend ESLint and a production build (`lint:frontend` + `build:frontend`).

From `frontend/`:

```bash
npm run lint
npm run build
```

Manually verify flows in the browser (login, SMTP configs, compose, reports) with both API and frontend running.

### 6. Submit a pull request

1. Push your branch: `git push origin feature/your-feature-name`
2. Open a pull request against `main` (or the default branch)
3. Fill out the PR template: description, testing steps, screenshots for UI changes
4. Address review feedback

## Pull request guidelines

### Before submitting

- [ ] Code follows project conventions
- [ ] Self-review completed
- [ ] Documentation updated if behavior or setup changed
- [ ] `npm test` passes from the repo root
- [ ] No new ESLint or TypeScript errors in `frontend/`
- [ ] Branch is up to date with the base branch
- [ ] Backend schema and core API behavior unchanged (unless the PR is scoped to that)

### PR requirements

- **Clear title** — one-line summary
- **Description** — what, why, and how
- **Linked issues** — reference related issues
- **Testing** — steps to verify
- **Screenshots** — for UI changes

### Code review

1. Maintainers review the PR
2. You address requested changes
3. After approval, the PR is merged

## Coding standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any`; define types in `src/types.ts` (API) or `frontend/src/lib/types.ts` (UI)
- Use `async/await` instead of raw promise chains

### Backend (`src/`)

- **Routes** — `src/routes/` (Hono handlers; thin, delegate to services)
- **Services** — `src/services/` (business logic)
- **Middleware** — `src/middleware/` (auth, etc.)
- **Types** — `src/types.ts`

### Frontend (`frontend/src/`)

- **App routes** — `frontend/src/app/` (Next.js App Router)
- **Components** — `frontend/src/components/`
- **API client** — `frontend/src/lib/api/`
- **Validation** — `frontend/src/lib/validation.ts` (Zod)
- **Styling** — Tailwind CSS 4 only (no Bootstrap or other CSS frameworks)

### Style

- 2-space indentation
- Meaningful names for variables and functions
- Small, focused functions
- Avoid deep nesting where possible

## What to contribute

### Good first issues

Look for labels such as `good first issue` or `help wanted`.

### Ideas

- Bug fixes
- Frontend UX improvements (Tailwind only)
- Documentation
- Test coverage
- Performance and security improvements

### Major changes

For large or breaking changes:

1. Open an issue first
2. Wait for maintainer feedback
3. Implement after alignment

## Getting help

- Read the root [README.md](./README.md)
- Search existing issues
- Open a new issue for questions

## Code of conduct

### Our standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what is best for the project

### Unacceptable behavior

- Harassment or discriminatory language
- Personal or political attacks
- Trolling or insulting comments
- Publishing others' private information
- Unprofessional conduct

See [.github/CODE_OF_CONDUCT.md](./.github/CODE_OF_CONDUCT.md) if present.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).

## Recognition

Contributors are appreciated. Thank you for improving this project.
