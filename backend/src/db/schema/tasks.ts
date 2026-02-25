import { pgTable, uuid, text, timestamp, boolean, integer, date, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { skills } from './skills.js';

export const recurrenceConfigSchema = { value: 1, unit: 'Days' as const } as const;
export type RecurrenceUnit = 'Days' | 'Weeks' | 'Months';

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    skillId: uuid('skill_id')
      .notNull()
      .references(() => skills.id, { onDelete: 'cascade' }),
    dueDate: date('due_date'),
    recurrence: jsonb('recurrence').$type<{ value: number; unit: RecurrenceUnit } | null>(),
    completed: boolean('completed').notNull().default(false),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    minutesSpent: integer('minutes_spent'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('tasks_user_id_due_date_idx').on(table.userId, table.dueDate),
    index('tasks_user_id_completed_idx').on(table.userId, table.completed),
  ]
);

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
