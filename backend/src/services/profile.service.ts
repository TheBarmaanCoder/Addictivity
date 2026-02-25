import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { profiles } from '../db/schema/profiles.js';
import { users } from '../db/schema/users.js';
import { BadRequestError, NotFoundError } from '../lib/errors.js';
import { sanitizeText } from '../lib/sanitize.js';

export interface ProfileResponse {
  userId: string;
  userName: string;
  themeId: string;
  onboardingCompleted: boolean;
  currentTitle: string;
  totalGems: number;
  lifetimeGems: number;
  totalGemsSpent: number;
  parkLevel: number;
  parkXp: number;
  totalMinutesSpent: number;
  unlockedParkItemIds: string[];
  selectedParkItemIds: string[];
  unlockedAchievementIds: string[];
  unlockedTitles: string[];
}

function toProfileResponse(row: typeof profiles.$inferSelect, userId: string): ProfileResponse {
  return {
    userId,
    userName: row.userName,
    themeId: row.themeId,
    onboardingCompleted: row.onboardingCompleted,
    currentTitle: row.currentTitle,
    totalGems: row.totalGems,
    lifetimeGems: row.lifetimeGems,
    totalGemsSpent: row.totalGemsSpent,
    parkLevel: row.parkLevel,
    parkXp: Number(row.parkXp),
    totalMinutesSpent: row.totalMinutesSpent,
    unlockedParkItemIds: row.unlockedParkItemIds ?? [],
    selectedParkItemIds: row.selectedParkItemIds ?? [],
    unlockedAchievementIds: row.unlockedAchievementIds ?? [],
    unlockedTitles: row.unlockedTitles ?? [],
  };
}

export async function getProfileByUserId(userId: string): Promise<ProfileResponse | null> {
  const [row] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  if (!row) return null;
  return toProfileResponse(row, userId);
}

export interface PatchProfileInput {
  userName?: string;
  themeId?: string;
  currentTitle?: string;
  selectedParkItemIds?: string[];
  onboardingCompleted?: boolean;
}

export async function patchProfile(userId: string, input: PatchProfileInput): Promise<ProfileResponse> {
  const [existing] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  if (!existing) throw new NotFoundError('Profile not found');

  const updates: Partial<typeof profiles.$inferInsert> = {};
  if (input.userName !== undefined) {
    const name = sanitizeText(input.userName);
    if (!name || name.length > 200) throw new BadRequestError('User name must be 1–200 characters');
    updates.userName = name;
    await db.update(users).set({ name: name, updatedAt: new Date() }).where(eq(users.id, userId));
  }
  if (input.themeId !== undefined) {
    if (!input.themeId.trim() || input.themeId.length > 50) throw new BadRequestError('Invalid theme_id');
    updates.themeId = input.themeId.trim();
  }
  if (input.currentTitle !== undefined) {
    if (!input.currentTitle.trim() || input.currentTitle.length > 100) throw new BadRequestError('Invalid current_title');
    updates.currentTitle = input.currentTitle.trim();
  }
  if (input.selectedParkItemIds !== undefined) {
    if (!Array.isArray(input.selectedParkItemIds)) throw new BadRequestError('selectedParkItemIds must be an array');
    updates.selectedParkItemIds = input.selectedParkItemIds;
  }
  if (input.onboardingCompleted !== undefined) {
    updates.onboardingCompleted = input.onboardingCompleted;
  }

  if (Object.keys(updates).length === 0) {
    return toProfileResponse(existing, userId);
  }

  const [updated] = await db
    .update(profiles)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(profiles.userId, userId))
    .returning();

  if (!updated) throw new Error('Update failed');
  return toProfileResponse(updated, userId);
}
