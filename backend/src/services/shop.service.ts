import { eq, asc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { profiles } from '../db/schema/profiles.js';
import { taskCompletions } from '../db/schema/task-completions.js';
import { skills } from '../db/schema/skills.js';
import { SHOP_ITEMS } from '../constants/shop-items.js';
import { evaluateMilestones } from './milestone.service.js';
import { BadRequestError, ForbiddenError } from '../lib/errors.js';

export type ShopItemResponse = (typeof SHOP_ITEMS)[number];

export function listShopItems(): ShopItemResponse[] {
  return [...SHOP_ITEMS];
}

export interface PurchaseResult {
  profile: {
    totalGems: number;
    lifetimeGems: number;
    totalGemsSpent: number;
    parkLevel: number;
    parkXp: number;
    unlockedParkItemIds: string[];
    selectedParkItemIds: string[];
    unlockedAchievementIds: string[];
    unlockedTitles: string[];
  };
  newlyUnlockedAchievements: Array<{ id: string; title: string; description: string; icon: string; gemReward: number; titleReward?: string }>;
}

export async function purchaseItem(userId: string, itemId: string): Promise<PurchaseResult> {
  const item = SHOP_ITEMS.find((i) => i.id === itemId);
  if (!item) {
    throw new BadRequestError('Item not found');
  }

  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  if (!profile) throw new Error('Profile not found');

  if (profile.parkLevel < item.minLevel) {
    throw new ForbiddenError(`Park level ${item.minLevel} required`);
  }
  if (profile.unlockedParkItemIds.includes(itemId)) {
    throw new BadRequestError('Item already owned');
  }
  if (profile.totalGems < item.cost) {
    throw new BadRequestError('Insufficient gems');
  }

  const newTotalGems = profile.totalGems - item.cost;
  const newTotalGemsSpent = profile.totalGemsSpent + item.cost;
  const newUnlocked = [...(profile.unlockedParkItemIds ?? []), itemId];
  const newSelected = [...(profile.selectedParkItemIds ?? []), itemId];

  const allSkills = await db.select().from(skills).where(eq(skills.userId, userId));
  const skillTotalPoints = allSkills.map((s) => s.totalPoints);
  const skillTotalMinutes = allSkills.map((s) => s.totalMinutes);

  const allCompletions = await db
    .select({ completedAt: taskCompletions.completedAt, minutesSpent: taskCompletions.minutesSpent })
    .from(taskCompletions)
    .where(eq(taskCompletions.userId, userId))
    .orderBy(asc(taskCompletions.completedAt));

  const uniqueDays = new Set(allCompletions.map((c) => new Date(c.completedAt).toDateString())).size;
  const sortedDates = Array.from(new Set(allCompletions.map((c) => new Date(c.completedAt).toDateString())))
    .map((s) => new Date(s))
    .sort((a, b) => a.getTime() - b.getTime());
  let maxStreak = 0;
  let cur = 0;
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) cur = 1;
    else {
      const diff = (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
      cur = Math.round(diff) === 1 ? cur + 1 : 1;
    }
    if (cur > maxStreak) maxStreak = cur;
  }
  const now = new Date();
  const todayStr = now.toDateString();
  const dailyTasksCount = allCompletions.filter((c) => new Date(c.completedAt).toDateString() === todayStr).length;
  const dailyMinutesCount = allCompletions
    .filter((c) => new Date(c.completedAt).toDateString() === todayStr)
    .reduce((a, c) => a + c.minutesSpent, 0);
  let maxInactivityGap = 0;
  if (allCompletions.length >= 2) {
    const latest = new Date(allCompletions[allCompletions.length - 1].completedAt);
    const prev = new Date(allCompletions[allCompletions.length - 2].completedAt);
    maxInactivityGap = (latest.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
  }

  const milestoneCtx = {
    unlockedAchievementIds: profile.unlockedAchievementIds,
    unlockedTitles: profile.unlockedTitles,
    totalGems: newTotalGems,
    lifetimeGems: profile.lifetimeGems,
    totalGemsSpent: newTotalGemsSpent,
    totalMinutesSpent: profile.totalMinutesSpent,
    parkLevel: profile.parkLevel,
    unlockedParkItemIds: newUnlocked,
    skillTotalPoints,
    skillTotalMinutes,
    totalTasks: allCompletions.length,
    uniqueDays,
    maxStreakDays: maxStreak,
    dailyTasksCount,
    dailyMinutesCount,
    maxInactivityGapDays: maxInactivityGap,
  };
  const milestoneResult = evaluateMilestones(milestoneCtx);

  const finalGems = newTotalGems + milestoneResult.bonusGems;
  const finalLifetime = profile.lifetimeGems + milestoneResult.bonusGems;

  await db
    .update(profiles)
    .set({
      totalGems: finalGems,
      totalGemsSpent: newTotalGemsSpent,
      unlockedParkItemIds: newUnlocked,
      selectedParkItemIds: newSelected,
      unlockedAchievementIds: milestoneResult.unlockedAchievementIds,
      unlockedTitles: milestoneResult.unlockedTitles,
      updatedAt: now,
    })
    .where(eq(profiles.userId, userId));

  const [updated] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  if (!updated) throw new Error('Profile update failed');

  return {
    profile: {
      totalGems: updated.totalGems,
      lifetimeGems: updated.lifetimeGems,
      totalGemsSpent: updated.totalGemsSpent,
      parkLevel: updated.parkLevel,
      parkXp: Number(updated.parkXp),
      unlockedParkItemIds: updated.unlockedParkItemIds ?? [],
      selectedParkItemIds: updated.selectedParkItemIds ?? [],
      unlockedAchievementIds: updated.unlockedAchievementIds ?? [],
      unlockedTitles: updated.unlockedTitles ?? [],
    },
    newlyUnlockedAchievements: milestoneResult.newlyUnlocked.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      icon: a.icon,
      gemReward: a.gemReward,
      titleReward: a.titleReward,
    })),
  };
}
