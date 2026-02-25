import { pgTable, uuid, text, timestamp, boolean, integer, numeric } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users.js';

/**
 * 1:1 with user; denormalized for read-heavy mobile. No auth fields.
 */
export const profiles = pgTable('profiles', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  userName: text('user_name').notNull(),
  themeId: text('theme_id').notNull().default('p1'),
  onboardingCompleted: boolean('onboarding_completed').notNull().default(false),
  currentTitle: text('current_title').notNull().default('Explorer'),
  totalGems: integer('total_gems').notNull().default(50),
  lifetimeGems: integer('lifetime_gems').notNull().default(50),
  totalGemsSpent: integer('total_gems_spent').notNull().default(0),
  parkLevel: integer('park_level').notNull().default(1),
  parkXp: numeric('park_xp', { precision: 12, scale: 2 }).notNull().default('0'),
  totalMinutesSpent: integer('total_minutes_spent').notNull().default(0),
  unlockedParkItemIds: text('unlocked_park_item_ids').array().notNull().default(sql`ARRAY['tree_basic']::text[]`),
  selectedParkItemIds: text('selected_park_item_ids').array().notNull().default(sql`ARRAY['tree_basic']::text[]`),
  unlockedAchievementIds: text('unlocked_achievement_ids').array().notNull().default(sql`ARRAY[]::text[]`),
  unlockedTitles: text('unlocked_titles').array().notNull().default(sql`ARRAY['Explorer']::text[]`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
