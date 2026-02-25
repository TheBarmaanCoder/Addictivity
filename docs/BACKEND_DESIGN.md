# Addictivity Backend Design (Production-Ready)

Mobile-first backend for auth, profiles, tasks, time tracking, XP/gems, skills, park, shop, and milestones.

---

## 1. Recommended Tech Stack

| Layer | Choice | Rationale |
|-------|--------|------------|
| **Runtime** | Node.js (LTS) | Same language as frontend, large ecosystem, good for I/O-heavy APIs. |
| **Framework** | Fastify or Express + TypeScript | Fastify: performance, schema validation (e.g. JSON Schema), TypeScript-first. Express: familiarity, middleware ecosystem. |
| **Database** | PostgreSQL 15+ | ACID, JSONB for flexible fields (e.g. recurrence, theme), strong consistency for gems/XP, good indexing and scaling. |
| **ORM / Query** | Drizzle ORM or Prisma | Type-safe schema, migrations, good DX. Drizzle is lighter; Prisma has richer tooling. |
| **Auth** | JWT (access + refresh) or session-based | Stateless JWT fits mobile (store refresh server-side or in DB for revoke). Email + password only; no social login required here. |
| **Validation** | Zod (or JSON Schema) | Shared types with frontend, request/response validation. |
| **Background jobs** | BullMQ + Redis (optional) | For milestone evaluation if deferred, or analytics. Can start without; evaluate in request first. |
| **Hosting** | Any (Railway, Render, Fly.io, AWS) | REST API + Postgres; deploy as single service initially. |

**Why not GraphQL here:** REST is sufficient for mobile-first CRUD + a few clear mutations (complete task, purchase). Simpler caching, fewer round-trips, and easier to add HTTP caching and conditional requests later. GraphQL can be added later if the client needs flexible queries.

---

## 2. Database Schema

### 2.1 Core Tables

**users**
- `id` UUID PK
- `email` TEXT UNIQUE NOT NULL (normalized lowercase)
- `password_hash` TEXT NOT NULL (bcrypt/argon2)
- `name` TEXT NOT NULL
- `created_at` TIMESTAMPTZ
- `updated_at` TIMESTAMPTZ

**profiles** (1:1 with user; denormalized for read-heavy mobile)
- `user_id` UUID PK FK(users.id) ON DELETE CASCADE
- `user_name` TEXT NOT NULL (display name; editable)
- `theme_id` TEXT NOT NULL DEFAULT 'p1'
- `onboarding_completed` BOOLEAN NOT NULL DEFAULT false
- `current_title` TEXT NOT NULL DEFAULT 'Explorer'
- `total_gems` INT NOT NULL DEFAULT 50 CHECK (total_gems >= 0)
- `lifetime_gems` INT NOT NULL DEFAULT 50
- `total_gems_spent` INT NOT NULL DEFAULT 0
- `park_level` INT NOT NULL DEFAULT 1
- `park_xp` NUMERIC(12,2) NOT NULL DEFAULT 0
- `total_minutes_spent` INT NOT NULL DEFAULT 0
- `unlocked_park_item_ids` TEXT[] NOT NULL DEFAULT ARRAY['tree_basic']
- `selected_park_item_ids` TEXT[] NOT NULL DEFAULT ARRAY['tree_basic']
- `unlocked_achievement_ids` TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]
- `unlocked_titles` TEXT[] NOT NULL DEFAULT ARRAY['Explorer']::TEXT[]
- `updated_at` TIMESTAMPTZ

**skills** (per-user; fixed + custom)
- `id` UUID PK
- `user_id` UUID NOT NULL FK(users.id) ON DELETE CASCADE
- `external_id` TEXT NOT NULL (e.g. 's1', 's2', 's3', 'custom-0'; client-facing stable id)
- `name` TEXT NOT NULL
- `is_custom` BOOLEAN NOT NULL
- `color` TEXT NOT NULL
- `icon` TEXT NOT NULL
- `total_minutes` INT NOT NULL DEFAULT 0
- `total_points` INT NOT NULL DEFAULT 0
- `points_per_minute` INT NOT NULL DEFAULT 10
- `streak` INT NOT NULL DEFAULT 0
- `last_skill_completed_at` TIMESTAMPTZ
- `importance` TEXT (e.g. 'casual','important','core') — nullable
- `sort_order` INT NOT NULL DEFAULT 0 (for stable ordering)
- `created_at` TIMESTAMPTZ
- `updated_at` TIMESTAMPTZ  
- UNIQUE(user_id, external_id)

**tasks**
- `id` UUID PK
- `user_id` UUID NOT NULL FK(users.id) ON DELETE CASCADE
- `title` TEXT NOT NULL
- `skill_id` UUID NOT NULL FK(skills.id) — references skills.id
- `due_date` DATE
- `recurrence` JSONB (e.g. `{ "value": 1, "unit": "Days" }`) — nullable
- `completed` BOOLEAN NOT NULL DEFAULT false
- `completed_at` TIMESTAMPTZ
- `minutes_spent` INT (set on complete)
- `created_at` TIMESTAMPTZ
- `updated_at` TIMESTAMPTZ  
- Index: (user_id, due_date), (user_id, completed)

**task_completions** (optional; for analytics and streak/date logic without scanning tasks)
- `id` UUID PK
- `task_id` UUID NOT NULL FK(tasks.id)
- `user_id` UUID NOT NULL FK(users.id)
- `skill_id` UUID NOT NULL FK(skills.id)
- `completed_at` TIMESTAMPTZ NOT NULL
- `minutes_spent` INT NOT NULL
- `xp_earned` INT NOT NULL
- `gems_earned` INT NOT NULL
- Index: (user_id, completed_at), (skill_id, completed_at)

Use this if you want to keep `tasks` rows immutable for completed state and query completions for milestones/streaks. Otherwise you can derive from `tasks WHERE completed = true`.

**shop_items** (catalog; read-only by app)
- `id` TEXT PK (e.g. 'tree_basic', 'bench_wood')
- `name` TEXT NOT NULL
- `type` TEXT NOT NULL ('tree','decoration','structure','pet','path')
- `icon` TEXT NOT NULL
- `cost` INT NOT NULL
- `min_level` INT NOT NULL
- `color` TEXT NOT NULL
- `description` TEXT
- `sort_order` INT

**achievements** (catalog; read-only by app)
- `id` TEXT PK (e.g. 'm1')
- `title` TEXT NOT NULL
- `description` TEXT NOT NULL
- `icon` TEXT NOT NULL
- `category` TEXT NOT NULL (e.g. 'total_tasks','skill_level_any',…)
- `requirement_value` INT NOT NULL
- `meta_value` INT (for e.g. skill_level_count)
- `skill_id` TEXT (optional; for skill-specific)
- `gem_reward` INT NOT NULL
- `title_reward` TEXT

**refresh_tokens** (if using JWT with refresh)
- `id` UUID PK
- `user_id` UUID NOT NULL FK(users.id) ON DELETE CASCADE
- `token_hash` TEXT NOT NULL (hash of refresh token)
- `expires_at` TIMESTAMPTZ NOT NULL
- `created_at` TIMESTAMPTZ
- Index: (token_hash), (user_id)

### 2.2 Derived / No Extra Tables

- **Global level:** Computed from `SUM(skills.total_points)` and level formula (e.g. `floor(sqrt(totalXP/40)) + 1`). Do not store; compute in API or in application layer from profile + skills.
- **Park level:** Stored on `profiles.park_level` and `profiles.park_xp`; level derived from XP in app or in DB function.
- **Skill level:** Computed from `skills.total_points` (e.g. `floor(sqrt(xp/120)) + 1`). No separate table.

### 2.3 Reference Data

- **themes:** Can stay in app config (no DB) or in a small `themes` table (id, name, colors JSONB). Same for **quotes** (optional app config).
- **shop_items** and **achievements:** Seed via migrations from current constants; API returns from DB or from config for simplicity.

---

## 3. Core API Endpoints (REST)

Base path: `/api/v1`. All authenticated routes use header: `Authorization: Bearer <access_token>`.

### Auth
- `POST /auth/register` — Body: `{ email, password, name }`. Creates user, profile, default skills. Returns tokens + minimal user.
- `POST /auth/login` — Body: `{ email, password }`. Returns access_token, refresh_token, expires_in.
- `POST /auth/refresh` — Body: `{ refresh_token }`. Returns new access_token (and optionally refresh_token).
- `POST /auth/logout` — Body: `{ refresh_token }`. Invalidates refresh token (if stored).

### Profile
- `GET /profile` — Returns full profile + gems, park, titles, etc. (single read-optimized payload for app load).
- `PATCH /profile` — Body: partial `{ user_name?, theme_id?, current_title?, selected_park_item_ids? }`. Idempotent.

### Skills
- `GET /skills` — List skills for user (fixed + custom).
- `POST /skills` — Create custom skill (onboarding or later). Body: `{ name, icon, color?, importance? }`.
- `PATCH /skills/:id` — Update skill (name, icon, color, importance). Only custom skills or allow name/icon for fixed.

### Tasks
- `GET /tasks` — Query: `?due_date=YYYY-MM-DD&completed=false`. List tasks for user.
- `POST /tasks` — Body: `{ title, skill_id, due_date?, recurrence? }`. Returns created task.
- `PATCH /tasks/:id` — Partial update (e.g. title, due_date, recurrence). Do not use for completion.
- `DELETE /tasks/:id` — Soft-delete or hard delete.
- `POST /tasks/:id/complete` — **Primary mutation for completion.** Body: `{ minutes_spent, intensity_multiplier? }`. Runs event flow below; returns updated profile summary + any new achievements.

### Park / Shop
- `GET /shop/items` — Catalog of shop items (or serve from static config).
- `POST /shop/purchase` — Body: `{ item_id }`. Validates level, cost, not already owned; deducts gems; adds to unlocked + optionally selected; runs milestone check; returns updated profile + achievement if any.
- `PATCH /profile` — For `selected_park_item_ids` (equip/unequip). Enforce max 2 trees in app or in API.

### Milestones
- `GET /milestones` — List achievements with `unlocked: true/false` per user (or include in profile).
- No direct “trigger” endpoint; milestones are triggered inside complete-task and purchase flows.

### App Bootstrap (mobile-first)
- `GET /app/state` — Optional single endpoint that returns everything the app needs to render home: profile, skills, tasks (e.g. today’s incomplete), gems, park, unlocked achievements. Reduces round-trips on cold start.

---

## 4. Event Flows

### 4.1 Completing a Task

1. **Request:** `POST /tasks/:id/complete` with `{ minutes_spent, intensity_multiplier }`.
2. **Validate:** Task exists, belongs to user, not already completed.
3. **Load:** Task, skill, profile. Start DB transaction.
4. **Streak (skill):** From `skill.last_skill_completed_at` and `skill.streak`, compute new streak (e.g. +1 if yesterday, reset or decay per your rules). Update `skill.streak`, `skill.last_skill_completed_at`, `skill.total_minutes`, `skill.total_points` (XP from minutes × multiplier × streak multiplier).
5. **Task:** Set `task.completed = true`, `task.completed_at = now()`, `task.minutes_spent = minutes_spent`. If task has recurrence, insert next occurrence as new task.
6. **Gems:** `gems_earned = floor(minutes_spent)` (or your rule). Update profile: `total_gems += gems_earned`, `lifetime_gems += gems_earned`, `total_minutes_spent += minutes_spent`.
7. **Park XP:** Add park XP (e.g. time-based + level-up bonus). Recompute `park_level` from `park_xp`; update `profile.park_level`, `profile.park_xp`.
8. **Milestones:** Run milestone evaluation (see 4.4). Append any newly unlocked achievement ids and title to profile; add bonus gems to `total_gems` and `lifetime_gems`.
9. **Optional:** Insert row into `task_completions` for analytics.
10. **Commit** transaction.
11. **Response:** 200 with updated task, profile summary (gems, park_level, park_xp), and list of newly unlocked achievements (for UI celebration).

### 4.2 Leveling a Skill

- **No separate API.** Level is derived from `skill.total_points` (e.g. `level = floor(sqrt(total_points/120)) + 1`).
- When **completing a task**, you update `skills.total_points`. If you need to emit “skill leveled up” for UI or analytics, compute old level vs new level in the same transaction and include in response (e.g. `skill_level_ups: [{ skill_id, new_level }]`).
- **Global level:** Same idea: compute from `SUM(skills.total_points)` before/after and optionally return `global_level_rank` or delta in bootstrap/profile.

### 4.3 Unlocking a Park Item

1. **Request:** `POST /shop/purchase` with `{ item_id }`.
2. **Validate:** Item exists in catalog; user’s `park_level >= item.min_level`; user does not already have `item_id` in `unlocked_park_item_ids`; `profile.total_gems >= item.cost`.
3. **Transaction:** Deduct `item.cost` from `total_gems`; add `item.cost` to `total_gems_spent`; append `item_id` to `unlocked_park_item_ids`; optionally append to `selected_park_item_ids` (or let client send follow-up PATCH). If “max 2 trees” and item is tree, enforce in same transaction (e.g. replace oldest selected tree or append up to 2).
4. **Milestones:** Run milestone evaluation (e.g. `items_unlocked`, `gems_spent`).
5. **Commit.** Response: updated profile + newly unlocked achievements.

### 4.4 Triggering a Milestone

- **When:** After task completion (4.1) and after shop purchase (4.3). Optionally after any mutation that changes profile/skills/tasks (e.g. batch-evaluate on profile read); for simplicity, **evaluate only in those two flows**.
- **How:** In the same transaction:
  1. Load current profile + aggregates: total_tasks (count completed), total_minutes_spent, per-skill total_points and levels, park_level, unlocked_park_item_ids length, total_gems_spent, lifetime_gems, unique_days (from task_completions or tasks), max streak, daily_tasks/minutes, inactivity gap, etc.
  2. For each achievement in catalog where `achievement.id NOT IN profile.unlocked_achievement_ids`, evaluate condition (e.g. `total_tasks >= requirement_value`, `skill_levels.some(l >= requirement_value)`).
  3. For each newly satisfied achievement: append to `unlocked_achievement_ids`; append `title_reward` to `unlocked_titles` if present; add `gem_reward` to `total_gems` and `lifetime_gems`.
  4. Return list of newly unlocked achievements in API response so the app can show celebration modal.
- **Idempotency:** Milestone evaluation is deterministic from current state; no separate “milestone event” table required unless you want an audit log. For audit, add a `milestone_unlocks` table (user_id, achievement_id, unlocked_at) and insert in the same transaction.

---

## 5. Scalability and Data Integrity

### 5.1 Consistency

- **Gems and XP:** All gem/XP updates happen inside a single DB transaction (complete task, purchase). Use row-level locking on `profiles` for the current user in that transaction if you expect concurrent requests from the same user (e.g. `SELECT ... FOR UPDATE` on profile row).
- **Streaks and dates:** Compute in application code from `last_skill_completed_at` and task completion dates; use UTC and user’s “day” boundary (or store timezone in profile) for consistency.
- **Park level:** Recompute from `park_xp` on every task completion; do not maintain a separate “level” table that can drift.

### 5.2 Mobile-First

- **One bootstrap endpoint:** `GET /app/state` returns profile + skills + today’s tasks (and optionally recent completions). Reduces latency on app open.
- **Conditional requests:** Support `If-None-Match` / `ETag` or `If-Modified-Since` on `GET /profile` and `GET /tasks` to avoid re-downloading when unchanged.
- **Pagination:** `GET /tasks` with `?limit=50&offset=0` or cursor; limit default to 20–50.
- **Offline:** Design for “last write wins” or version field on profile/tasks so future offline-first clients can sync. Not required for MVP; add `updated_at` and optional `version` for later.

### 5.3 Security

- **Passwords:** Hash with argon2id (or bcrypt); never log or return passwords.
- **Tokens:** Short-lived access token (e.g. 15 min); refresh token stored hashed in DB with expiry; revoke on logout.
- **Rate limiting:** Per IP and per user on auth and sensitive endpoints (e.g. complete, purchase).
- **Input validation:** Zod (or JSON Schema) on all bodies; reject invalid skill_id, task_id, item_id.

### 5.4 Scaling

- **Read replicas:** Use for `GET /profile`, `GET /tasks`, `GET /skills`; write to primary. Single primary is enough for a long time.
- **Caching:** Cache catalog (shop_items, achievements) in app memory or Redis; invalidate on deploy. Optionally cache profile by user_id with short TTL (e.g. 30s) if read-heavy.
- **Background jobs:** Move milestone evaluation to a job queue only if the synchronous transaction becomes too slow (e.g. many achievements). Prefer synchronous for correctness and simpler UX (immediate celebration).

### 5.5 Data Integrity

- **Foreign keys:** Enforce user_id and skill_id on tasks; cascade delete profile/skills/tasks when user is deleted.
- **Check constraints:** `total_gems >= 0`, `minutes_spent > 0` on complete.
- **Unique:** (user_id, external_id) on skills; unique task id.
- **Idempotency:** `POST /tasks/:id/complete` should be idempotent: if already completed, return 409 or 200 with current state and no double credit.

---

## 6. Summary Diagram (Event Flow)

```
Complete Task Request
    → Validate task/user
    → Begin transaction
    → Update skill (streak, XP, total_minutes)
    → Mark task completed; create recurrence if needed
    → Update profile (gems, park_xp, park_level, total_minutes_spent)
    → Evaluate milestones → update profile (achievements, titles, bonus gems)
    → Commit
    → Return task + profile delta + new achievements

Purchase Request
    → Validate item, level, gems, not owned
    → Begin transaction
    → Deduct gems; add to unlocked (and optionally selected)
    → Evaluate milestones → update profile
    → Commit
    → Return profile delta + new achievements
```

This design keeps the backend aligned with your existing Addictivity domain (tasks, skills, park, gems, milestones) and stays production-ready with clear schema, REST API, and transactional event flows suitable for a mobile-first app.
