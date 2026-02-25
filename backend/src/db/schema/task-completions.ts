import { pgTable, uuid, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { skills } from './skills.js';
import { tasks } from './tasks.js';

export const taskCompletions = pgTable(
  'task_completions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    taskId: uuid('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    skillId: uuid('skill_id')
      .notNull()
      .references(() => skills.id, { onDelete: 'cascade' }),
    completedAt: timestamp('completed_at', { withTimezone: true }).notNull(),
    minutesSpent: integer('minutes_spent').notNull(),
    xpEarned: integer('xp_earned').notNull(),
    gemsEarned: integer('gems_earned').notNull(),
  },
  (table) => [
    index('task_completions_user_id_completed_at_idx').on(table.userId, table.completedAt),
    index('task_completions_skill_id_completed_at_idx').on(table.skillId, table.completedAt),
  ]
);

export type TaskCompletion = typeof taskCompletions.$inferSelect;
export type NewTaskCompletion = typeof taskCompletions.$inferInsert;
