/**
 * Level/XP formulas aligned with frontend App.tsx.
 */

export function getStreakMultiplier(streak: number): number {
  if (streak >= 15) return 1.15;
  if (streak >= 8) return 1.1;
  if (streak >= 4) return 1.05;
  return 1;
}

export function getSkillLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 120)) + 1;
}

export function getParkLevelFromXP(xp: number): number {
  let level = 1;
  while (xp >= Math.floor(100 * Math.pow(level + 1, 1.5))) {
    level++;
  }
  return level;
}

export function getGlobalLevel(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP / 40)) + 1;
}
