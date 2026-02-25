CREATE TABLE IF NOT EXISTS "task_completions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "task_id" uuid NOT NULL REFERENCES "tasks"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "skill_id" uuid NOT NULL REFERENCES "skills"("id") ON DELETE CASCADE,
  "completed_at" timestamp with time zone NOT NULL,
  "minutes_spent" integer NOT NULL,
  "xp_earned" integer NOT NULL,
  "gems_earned" integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_completions_user_id_completed_at_idx" ON "task_completions" ("user_id","completed_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "task_completions_skill_id_completed_at_idx" ON "task_completions" ("skill_id","completed_at");
