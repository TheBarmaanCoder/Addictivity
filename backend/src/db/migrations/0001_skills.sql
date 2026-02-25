CREATE TABLE IF NOT EXISTS "skills" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "external_id" text NOT NULL,
  "name" text NOT NULL,
  "is_custom" boolean NOT NULL,
  "color" text NOT NULL,
  "icon" text NOT NULL,
  "total_minutes" integer DEFAULT 0 NOT NULL,
  "total_points" integer DEFAULT 0 NOT NULL,
  "points_per_minute" integer DEFAULT 10 NOT NULL,
  "streak" integer DEFAULT 0 NOT NULL,
  "last_skill_completed_at" timestamp with time zone,
  "importance" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "skills_user_id_external_id_idx" ON "skills" ("user_id","external_id");
