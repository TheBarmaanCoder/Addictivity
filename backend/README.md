# Addictivity Backend

Phase 1: Multi-provider auth (email only) and user model.  
Phase 2: Skill system (default skills on register, list/create/update).  
Phase 3: Tasks and task completion (CRUD, complete flow with streak, gems, park XP, milestones).

## Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and `JWT_SECRET`.
2. Create a PostgreSQL database and run migrations:

   ```bash
   npm run db:migrate
   ```

3. Start the server:

   ```bash
   npm run dev
   ```

## API (Phase 1)

Base URL: `http://localhost:3001/api/v1`

### Auth

- **POST /auth/register** — Body: `{ "email", "password", "name" }`  
  Returns: `{ accessToken, refreshToken, expiresIn, user: { id, name, email } }`

- **POST /auth/login** — Body: `{ "email", "password" }`  
  Returns: same as register.

- **POST /auth/refresh** — Body: `{ "refresh_token" }`  
  Returns: `{ accessToken, expiresIn, user }` (no new refresh token in this implementation; one-time use).

- **POST /auth/logout** — Body: `{ "refresh_token" }`  
  Returns: 204 No Content.

### Skills (authenticated: `Authorization: Bearer <access_token>`)

- **GET /skills** — List all skills for the current user.  
  Returns: `[{ id, externalId, name, isCustom, color, icon, totalMinutes, totalPoints, pointsPerMinute, streak, lastSkillCompletedAt, importance, sortOrder }, ...]`

- **POST /skills** — Create a custom skill. Body: `{ "name", "icon", "color?", "importance?" }`  
  Returns: 201 with the created skill. `externalId` is assigned as `custom-0`, `custom-1`, etc.

- **PATCH /skills/:id** — Update a skill (name, icon, color, importance). `:id` is the skill UUID.  
  Returns: 200 with the updated skill.

### Tasks (authenticated)

- **GET /tasks** — List tasks. Query: `?due_date=YYYY-MM-DD&completed=true|false`.  
  Returns: 200 with array of tasks.

- **POST /tasks** — Create task. Body: `{ "title", "skillId", "dueDate?", "recurrence?" }`.  
  Returns: 201 with created task.

- **PATCH /tasks/:id** — Update task (title, dueDate, recurrence). Cannot update completed tasks.  
  Returns: 200 with updated task.

- **DELETE /tasks/:id** — Delete task. Returns: 204.

- **POST /tasks/:id/complete** — Complete task. Body: `{ "minutes_spent", "intensity_multiplier?" }`.  
  Runs full flow: streak, XP, gems, park XP, recurrence (creates next occurrence), milestone evaluation.  
  Returns: 200 with `{ task, nextTask?, profile, newlyUnlockedAchievements }`.

## Architecture

- **users** — Identity only (id, name). No credentials.
- **auth_providers** — One row per linked login method (e.g. email, future Google).  
  Email/password uses `provider: "email"`, `provider_user_id` = normalized email, `password_hash` set.
- **profiles** — 1:1 with user; app state (gems, park, titles, etc.).
- **refresh_tokens** — Stored hashed; one-time use (deleted on refresh).

- **skills** — Per-user; fixed (s1, s2, s3) created on register plus custom (custom-0, custom-1, …). Level is derived from `total_points` in app.

- **tasks** — Per-user; optional due_date, recurrence (JSONB). Completion sets completed_at and minutes_spent; recurrence creates next task.

- **task_completions** — One row per completion (task_id, user_id, skill_id, completed_at, minutes_spent, xp_earned, gems_earned). Used for milestone stats (unique_days, streak_days, daily_*, inactivity_return).

- **Milestones** — Evaluated on complete; achievements catalog in code; bonus gems and titles applied to profile.

Adding Google later: insert a new row in `auth_providers` with `provider: "google"` and link to the same `user_id`; no user data migration.
