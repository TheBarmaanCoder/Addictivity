import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * User identity. No credentials here — auth is in auth_providers.
 * One user can have multiple linked auth providers (e.g. email + Google).
 */
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
