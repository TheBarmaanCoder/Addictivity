import { eq, and, lt } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { users, authProviders, profiles, refreshTokens, skills } from '../db/schema/index.js';
import { DEFAULT_SKILLS } from '../constants/default-skills.js';
import { PROVIDER_EMAIL } from '../db/schema/auth-providers.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import * as jwt from '../lib/jwt.js';
import { hashRefreshToken } from '../lib/refresh-token.js';
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
} from '../lib/errors.js';
import { sanitizeText } from '../lib/sanitize.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: { id: string; name: string; email: string };
}

export interface RefreshResult {
  accessToken: string;
  expiresIn: number;
  user: { id: string; name: string; email: string };
}

/**
 * Register with email/password. Creates user, profile, default skills, and one auth_provider (email).
 */
export async function register(input: RegisterInput): Promise<AuthResult> {
  const email = normalizeEmail(input.email);
  if (!EMAIL_REGEX.test(email)) {
    throw new BadRequestError('Invalid email address');
  }
  const name = sanitizeText(input.name ?? '');
  if (!name) {
    throw new BadRequestError('Name is required');
  }
  if (input.password.length < 6) {
    throw new BadRequestError('Password must be at least 6 characters');
  }

  const existing = await db
    .select()
    .from(authProviders)
    .where(and(eq(authProviders.provider, PROVIDER_EMAIL), eq(authProviders.providerUserId, email)))
    .limit(1);

  if (existing.length > 0) {
    throw new ConflictError('An account with this email already exists. Please log in.');
  }

  const userId = uuidv4();
  const passwordHash = await hashPassword(input.password);
  const now = new Date();

  await db.transaction(async (tx) => {
    await tx.insert(users).values({
      id: userId,
      name,
      createdAt: now,
      updatedAt: now,
    });

    await tx.insert(authProviders).values({
      userId,
      provider: PROVIDER_EMAIL,
      providerUserId: email,
      email,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    });

    await tx.insert(profiles).values({
      userId,
      userName: name,
      updatedAt: now,
    });

    for (const s of DEFAULT_SKILLS) {
      await tx.insert(skills).values({
        userId,
        externalId: s.externalId,
        name: s.name,
        isCustom: false,
        color: s.color,
        icon: s.icon,
        importance: s.importance,
        sortOrder: s.sortOrder,
        createdAt: now,
        updatedAt: now,
      });
    }
  });

  const refreshToken = jwt.signRefreshToken(userId, uuidv4());
  const expiresAt = jwt.getRefreshTokenExpiry();

  await db.insert(refreshTokens).values({
    userId,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt,
  });

  const accessToken = jwt.signAccessToken(userId);

  return {
    accessToken,
    refreshToken,
    expiresIn: 900, // 15 min in seconds
    user: { id: userId, name, email },
  };
}

/**
 * Login with email/password. Looks up auth_provider by email, verifies password, issues tokens.
 */
export async function login(email: string, password: string): Promise<AuthResult> {
  const normalized = normalizeEmail(email);
  if (!normalized || !password) {
    throw new BadRequestError('Email and password are required');
  }

  const rows = await db
    .select({
      userId: authProviders.userId,
      passwordHash: authProviders.passwordHash,
      userName: users.name,
    })
    .from(authProviders)
    .innerJoin(users, eq(users.id, authProviders.userId))
    .where(and(eq(authProviders.provider, PROVIDER_EMAIL), eq(authProviders.providerUserId, normalized)))
    .limit(1);

  if (rows.length === 0) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const row = rows[0];
  if (!row.passwordHash) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const valid = await verifyPassword(row.passwordHash, password);
  if (!valid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const refreshToken = jwt.signRefreshToken(row.userId, uuidv4());
  const expiresAt = jwt.getRefreshTokenExpiry();

  await db.insert(refreshTokens).values({
    userId: row.userId,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt,
  });

  const accessToken = jwt.signAccessToken(row.userId);

  return {
    accessToken,
    refreshToken,
    expiresIn: 900,
    user: { id: row.userId, name: row.userName, email: normalized },
  };
}

/**
 * Exchange refresh token for new access token (and optionally new refresh token).
 * Invalidates the old refresh token (one-time use).
 */
export async function refresh(refreshToken: string): Promise<RefreshResult> {
  if (!refreshToken?.trim()) {
    throw new BadRequestError('Refresh token is required');
  }

  let payload: jwt.RefreshPayload;
  try {
    payload = jwt.verifyRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const tokenHash = hashRefreshToken(refreshToken);
  const rows = await db
    .select({ id: refreshTokens.id, userId: refreshTokens.userId, expiresAt: refreshTokens.expiresAt })
    .from(refreshTokens)
    .where(eq(refreshTokens.tokenHash, tokenHash))
    .limit(1);

  if (rows.length === 0) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const row = rows[0];
  if (row.expiresAt < new Date()) {
    await db.delete(refreshTokens).where(eq(refreshTokens.id, row.id));
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
  if (row.userId !== payload.sub) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  // One-time use: delete this refresh token
  await db.delete(refreshTokens).where(eq(refreshTokens.id, row.id));

  // Get user email for response (from any linked provider that has email)
  const providers = await db
    .select({ email: authProviders.email })
    .from(authProviders)
    .where(eq(authProviders.userId, row.userId))
    .limit(1);
  const email = providers[0]?.email ?? '';

  const [userRow] = await db.select({ name: users.name }).from(users).where(eq(users.id, row.userId)).limit(1);
  const name = userRow?.name ?? '';

  const accessToken = jwt.signAccessToken(row.userId);

  return {
    accessToken,
    expiresIn: 900,
    user: { id: row.userId, name, email },
  };
}

/**
 * Logout: invalidate the given refresh token.
 */
export async function logout(refreshToken: string): Promise<void> {
  if (!refreshToken?.trim()) return;

  const tokenHash = hashRefreshToken(refreshToken);
  await db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash));
}

/**
 * Delete expired refresh tokens. Call periodically (e.g. on startup and every hour).
 */
export async function cleanupExpiredRefreshTokens(): Promise<number> {
  const deleted = await db
    .delete(refreshTokens)
    .where(lt(refreshTokens.expiresAt, new Date()))
    .returning({ id: refreshTokens.id });
  return deleted.length;
}

/**
 * Load user by id (for auth middleware). Returns null if not found.
 */
export async function getUserById(userId: string): Promise<{ id: string; name: string; email: string } | null> {
  const [u] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!u) return null;

  const [ap] = await db
    .select({ email: authProviders.email })
    .from(authProviders)
    .where(eq(authProviders.userId, userId))
    .limit(1);
  const email = ap?.email ?? '';

  return { id: u.id, name: u.name, email };
}
