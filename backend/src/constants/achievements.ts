/**
 * Achievement catalog aligned with frontend constants.ts.
 */
export type AchievementCategory =
  | 'total_tasks'
  | 'total_minutes'
  | 'skill_level_any'
  | 'skill_level_count'
  | 'unique_skills'
  | 'global_level'
  | 'park_level'
  | 'items_unlocked'
  | 'gems_spent'
  | 'lifetime_gems'
  | 'unique_days'
  | 'streak_days'
  | 'daily_tasks'
  | 'daily_minutes'
  | 'inactivity_return'
  | 'all_active_skills_used';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirementValue: number;
  metaValue?: number;
  skillId?: string;
  gemReward: number;
  titleReward?: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', title: 'Deep Roots', description: 'Spend 25 hours of focused time on tasks in total.', icon: 'hourglass_bottom', category: 'total_minutes', requirementValue: 1500, gemReward: 120 },
  { id: 'a2', title: 'Relentless', description: 'Complete 100 tasks.', icon: 'task_alt', category: 'total_tasks', requirementValue: 100, gemReward: 150 },
  { id: 'a3', title: 'Ascendant', description: 'Reach level 10 in any single skill.', icon: 'military_tech', category: 'skill_level_any', requirementValue: 10, gemReward: 200 },
  { id: 'a4', title: 'Wide Net', description: 'Log time in 5 different skills (lifetime).', icon: 'category', category: 'unique_skills', requirementValue: 5, gemReward: 175 },
  { id: 'a5', title: 'Full Radar', description: 'Every skill you currently track has logged at least one minute.', icon: 'radar', category: 'all_active_skills_used', requirementValue: 1, gemReward: 100, titleReward: 'Polymath' },
  { id: 'a6', title: 'World Stage', description: 'Reach global level 20.', icon: 'public', category: 'global_level', requirementValue: 20, gemReward: 250, titleReward: 'Elite' },
  { id: 'a7', title: 'Park Keeper', description: 'Reach park level 12.', icon: 'park', category: 'park_level', requirementValue: 12, gemReward: 180 },
  { id: 'a8', title: 'Curator', description: 'Unlock 4 park pieces (including your starter tree).', icon: 'museum', category: 'items_unlocked', requirementValue: 4, gemReward: 130 },
  { id: 'a9', title: 'Iron Calendar', description: 'Complete tasks on 30 different days.', icon: 'calendar_month', category: 'unique_days', requirementValue: 30, gemReward: 200 },
  { id: 'a10', title: 'Unbroken', description: 'Maintain a 21-day activity streak.', icon: 'whatshot', category: 'streak_days', requirementValue: 21, gemReward: 220, titleReward: 'Unstoppable' },
  { id: 'a11', title: 'Patron', description: 'Spend 800 gems total in the shop.', icon: 'payments', category: 'gems_spent', requirementValue: 800, gemReward: 160 },
  { id: 'a12', title: 'Long Absence', description: 'Return and complete a task after at least 14 days without one.', icon: 'history_toggle_off', category: 'inactivity_return', requirementValue: 14, gemReward: 100 },
];
