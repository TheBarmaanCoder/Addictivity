CREATE TABLE IF NOT EXISTS "tasks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "skill_id" uuid NOT NULL REFERENCES "skills"("id") ON DELETE CASCADE,
  "due_date" date,
  "recurrence" jsonb,
  "completed" boolean DEFAULT false NOT NULL,
  "completed_at" timestamp with time zone,
  "minutes_spent" integer,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tasks_user_id_due_date_idx" ON "tasks" ("user_id","due_date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tasks_user_id_completed_idx" ON "tasks" ("user_id","completed");
