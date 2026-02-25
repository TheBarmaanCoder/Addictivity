-- Change park_xp from real to numeric(12,2) to avoid floating-point precision drift
ALTER TABLE "profiles" ALTER COLUMN "park_xp" TYPE numeric(12,2) USING "park_xp"::numeric(12,2);
