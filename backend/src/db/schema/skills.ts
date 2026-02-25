import { pgTable, uuid, text, timestamp, boolean, integer, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const skills = pgTable(
  'skills',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    externalId: text('external_id').notNull(), // client-facing: 's1', 's2', 's3', 'custom-0', etc.
    name: text('name').notNull(),
    isCustom: boolean('is_custom').notNull(),
    color: text('color').notNull(),
    icon: text('icon').notNull(),
    totalMinutes: integer('total_minutes').notNull().default(0),
    totalPoints: integer('total_points').notNull().default(0),
    pointsPerMinute: integer('points_per_minute').notNull().default(10),
    streak: integer('streak').notNull().default(0),
    lastSkillCompletedAt: timestamp('last_skill_completed_at', { withTimezone: true }),
    importance: text('importance'), // 'casual' | 'important' | 'core'
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('skills_user_id_external_id_idx').on(table.userId, table.externalId)]
);

export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;
