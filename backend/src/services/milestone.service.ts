import { ACHIEVEMENTS, type Achievement } from '../constants/achievements.js';
import { getSkillLevel, getGlobalLevel } from '../lib/levels.js';

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
