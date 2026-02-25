import { pgTable, uuid, text, timestamp, jsonb, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const PROVIDER_EMAIL = 'email' as const;
export const PROVIDER_GOOGLE = 'google' as const;
export type AuthProviderType = typeof PROVIDER_EMAIL | typeof PROVIDER_GOOGLE;

/**
 * Linked auth accounts per user. One user can have multiple providers (email, Google, etc.).
 * - For email: provider='email', provider_user_id = normalized email, password_hash set.
 * - For Google: provider='google', provider_user_id = Google sub, password_hash null.
 */
export const authProviders = pgTable(
  'auth_providers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(), // 'email' | 'google'
    providerUserId: text('provider_user_id').notNull(), // email for email; sub for Google
    email: text('email'), // normalized email for lookups; set for email, optional for Google
    passwordHash: text('password_hash'), // only for provider = 'email'
    meta: jsonb('meta'), // optional provider-specific payload (e.g. Google picture)
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('auth_providers_provider_provider_user_id_idx').on(table.provider, table.providerUserId),
  ]
);

export type AuthProvider = typeof authProviders.$inferSelect;
export type NewAuthProvider = typeof authProviders.$inferInsert;
