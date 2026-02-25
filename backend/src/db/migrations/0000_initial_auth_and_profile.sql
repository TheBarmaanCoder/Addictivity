-- Phase 1: users, auth_providers, profiles, refresh_tokens
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_providers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "provider" text NOT NULL,
  "provider_user_id" text NOT NULL,
  "email" text,
  "password_hash" text,
  "meta" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "auth_providers_provider_provider_user_id_idx" ON "auth_providers" ("provider","provider_user_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
  "user_id" uuid PRIMARY KEY NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "user_name" text NOT NULL,
  "theme_id" text DEFAULT 'p1' NOT NULL,
  "onboarding_completed" boolean DEFAULT false NOT NULL,
  "current_title" text DEFAULT 'Explorer' NOT NULL,
  "total_gems" integer DEFAULT 50 NOT NULL,
  "lifetime_gems" integer DEFAULT 50 NOT NULL,
  "total_gems_spent" integer DEFAULT 0 NOT NULL,
  "park_level" integer DEFAULT 1 NOT NULL,
  "park_xp" real DEFAULT 0 NOT NULL,
  "total_minutes_spent" integer DEFAULT 0 NOT NULL,
  "unlocked_park_item_ids" text[] DEFAULT ARRAY['tree_basic']::text[] NOT NULL,
  "selected_park_item_ids" text[] DEFAULT ARRAY['tree_basic']::text[] NOT NULL,
  "unlocked_achievement_ids" text[] DEFAULT ARRAY[]::text[] NOT NULL,
  "unlocked_titles" text[] DEFAULT ARRAY['Explorer']::text[] NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token_hash" text NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "refresh_tokens_token_hash_idx" ON "refresh_tokens" ("token_hash");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "refresh_tokens_user_id_idx" ON "refresh_tokens" ("user_id");
