import { eq, asc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { profiles } from '../db/schema/profiles.js';
import { skills } from '../db/schema/skills.js';
import { taskCompletions } from '../db/schema/task-completions.js';
import { ACHIEVEMENTS, type Achievement } from '../constants/achievements.js';
import { getSkillLevel, getGlobalLevel } from '../lib/levels.js';

export interface MilestoneResponse {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  requirementValue: number;
  gemReward: number;
  titleReward?: string;
  unlocked: boolean;
}

export interface MilestoneContext {
  unlockedAchievementIds: string[];
  unlockedTitles: string[];
  totalGems: number;
  lifetimeGems: number;
  totalGemsSpent: number;
  totalMinutesSpent: number;
  parkLevel: number;
  unlockedParkItemIds: string[];
  /** Per-skill total_points (for level calculation) */
  skillTotalPoints: number[];
  /** Per-skill total_minutes (for unique_skills count) */
  skillTotalMinutes: number[];
  totalTasks: number;
  uniqueDays: number;
  maxStreakDays: number;
  dailyTasksCount: number;
  dailyMinutesCount: number;
  maxInactivityGapDays: number;
}

export interface MilestoneResult {
  newlyUnlocked: Achievement[];
  bonusGems: number;
  unlockedAchievementIds: string[];
  unlockedTitles: string[];
}

/**
 * Evaluate achievements from current context. Returns newly unlocked achievements,
 * bonus gems, and updated unlocked ids/titles (caller applies to profile).
 */
export function evaluateMilestones(ctx: MilestoneContext): MilestoneResult {
  const unlockedIds = [...ctx.unlockedAchievementIds];
  const unlockedTitles = [...ctx.unlockedTitles];
  let bonusGems = 0;
  const newlyUnlocked: Achievement[] = [];

  const totalXP = ctx.skillTotalPoints.reduce((a, b) => a + b, 0);
  const globalLvl = getGlobalLevel(totalXP);
  const skillLevels = ctx.skillTotalPoints.map((xp) => getSkillLevel(xp));
  const skillsWithTime = ctx.skillTotalMinutes.filter((m) => m > 0).length;

  for (const ach of ACHIEVEMENTS) {
    if (unlockedIds.includes(ach.id)) continue;
    let isMet = false;
    switch (ach.category) {
      case 'total_tasks':
        isMet = ctx.totalTasks >= ach.requirementValue;
        break;
      case 'total_minutes':
        isMet = ctx.totalMinutesSpent >= ach.requirementValue;
        break;
      case 'skill_level_any':
        isMet = skillLevels.some((l) => l >= ach.requirementValue);
        break;
      case 'skill_level_count': {
        const count = skillLevels.filter((l) => l >= (ach.metaValue ?? 0)).length;
        isMet = count >= ach.requirementValue;
        break;
      }
      case 'unique_skills':
        isMet = skillsWithTime >= ach.requirementValue;
        break;
      case 'global_level':
        isMet = globalLvl >= ach.requirementValue;
        break;
      case 'park_level':
        isMet = ctx.parkLevel >= ach.requirementValue;
        break;
      case 'items_unlocked':
        isMet = ctx.unlockedParkItemIds.length >= ach.requirementValue;
        break;
      case 'gems_spent':
        isMet = ctx.totalGemsSpent >= ach.requirementValue;
        break;
      case 'lifetime_gems':
        isMet = ctx.lifetimeGems >= ach.requirementValue;
        break;
      case 'unique_days':
        isMet = ctx.uniqueDays >= ach.requirementValue;
        break;
      case 'streak_days':
        isMet = ctx.maxStreakDays >= ach.requirementValue;
        break;
      case 'daily_tasks':
        isMet = ctx.dailyTasksCount >= ach.requirementValue;
        break;
      case 'daily_minutes':
        isMet = ctx.dailyMinutesCount >= ach.requirementValue;
        break;
      case 'inactivity_return':
        isMet = ctx.maxInactivityGapDays >= ach.requirementValue;
        break;
      default:
        break;
    }
    if (isMet) {
      unlockedIds.push(ach.id);
      bonusGems += ach.gemReward;
      if (ach.titleReward && !unlockedTitles.includes(ach.titleReward)) {
        unlockedTitles.push(ach.titleReward);
      }
      newlyUnlocked.push(ach);
    }
  }

  return {
    newlyUnlocked,
    bonusGems,
    unlockedAchievementIds: unlockedIds,
    unlockedTitles,
  };
}

export async function listMilestonesForUser(userId: string): Promise<MilestoneResponse[]> {
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  const unlockedIds = profile?.unlockedAchievementIds ?? [];

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

  const ctx: MilestoneContext = {
    unlockedAchievementIds: unlockedIds,
    unlockedTitles: profile?.unlockedTitles ?? [],
    totalGems: profile?.totalGems ?? 0,
    lifetimeGems: profile?.lifetimeGems ?? 0,
    totalGemsSpent: profile?.totalGemsSpent ?? 0,
    totalMinutesSpent: profile?.totalMinutesSpent ?? 0,
    parkLevel: profile?.parkLevel ?? 1,
    unlockedParkItemIds: profile?.unlockedParkItemIds ?? [],
    skillTotalPoints,
    skillTotalMinutes,
    totalTasks: allCompletions.length,
    uniqueDays,
    maxStreakDays: maxStreak,
    dailyTasksCount,
    dailyMinutesCount,
    maxInactivityGapDays: maxInactivityGap,
  };

  return ACHIEVEMENTS.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    icon: a.icon,
    category: a.category,
    requirementValue: a.requirementValue,
    gemReward: a.gemReward,
    titleReward: a.titleReward,
    unlocked: ctx.unlockedAchievementIds.includes(a.id),
  }));
}
