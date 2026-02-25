# Agents

## Cursor Cloud specific instructions

### Project overview

Addictivity is a gamified productivity app with two independent services:

| Service | Directory | Port | Command |
|---------|-----------|------|---------|
| Frontend (Vite + React) | `/workspace` | 3000 | `npm run dev` |
| Backend (Fastify + TypeScript) | `/workspace/backend` | 3001 | See below |

### Running the backend

The backend does **not** use `dotenv`. Use Node's `--env-file` flag to load `.env`:

```bash
cd /workspace/backend
node --env-file=.env node_modules/.bin/tsx watch src/index.ts
```

The same applies to migrations:

```bash
cd /workspace/backend
node --env-file=.env node_modules/.bin/tsx src/db/migrate.ts
```

### PostgreSQL

The backend requires PostgreSQL. After installing, create the database:

```bash
sudo pg_ctlcluster 16 main start
sudo -u postgres psql -c "CREATE USER addictivity WITH PASSWORD 'addictivity';"
sudo -u postgres psql -c "CREATE DATABASE addictivity OWNER addictivity;"
```

Then configure `backend/.env` with `DATABASE_URL=postgresql://addictivity:addictivity@localhost:5432/addictivity`.

### Frontend environment

Copy `.env.example` to `.env.local` at the project root. The example file already contains working Firebase config values for the dev project.

### Type checking

- Backend: `cd backend && npx tsc --noEmit` — passes cleanly.
- Frontend: `npx tsc --noEmit` from root — has pre-existing type errors related to Vite env types and Drizzle ORM schema inference; these do not affect runtime.

### Build

- Frontend: `npm run build` (Vite)
- Backend: `cd backend && npm run build` (tsc)

### Key gotchas

- The two `package.json` files (root and `backend/`) use separate `npm install` runs.
- No ESLint or Prettier is configured in either project.
- No automated test suites exist; testing is done via API calls and manual UI testing.
- The frontend uses Firebase Auth/Firestore (external SaaS); the backend uses JWT + PostgreSQL. These are independent auth systems.
