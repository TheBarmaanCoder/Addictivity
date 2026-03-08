
export interface Skill {
  id: string;
  name: string;
  totalMinutes: number;
  totalPoints: number;
  pointsPerMinute: number;
  isCustom: boolean; 
  color: string;
  icon: string;
  streak: number;
  lastSkillCompletedAt?: string; 
  importance?: 'casual' | 'important' | 'core';
}

export interface RecurrenceConfig {
  value: number;
  unit: 'Days' | 'Weeks' | 'Months';
}

export interface Task {
  id: string;
  title: string;
  skillId: string;
  recurrence: RecurrenceConfig | null;
  dueDate: string | null; 
  completed: boolean;
  completedAt?: string; 
  minutesSpent?: number; 
}
import type { Theme } from './lib/theme';

export type { Theme };

export interface ShopItem {
  id: string;
  name: string;
  type: 'tree' | 'decoration' | 'structure' | 'pet' | 'path';
  icon: string;
  cost: number;
  minLevel: number;
  color: string;
  description?: string;
}

export type BoosterCategory = 'multiplier' | 'streak' | 'session' | 'challenge';

export interface BoosterShopItem {
  id: string;
  name: string;
  category: BoosterCategory;
  description: string;
  icon: string;
  cost: number;
  minLevel: number;
  color: string;
}

export type WeeklyGoalType = 'tasks' | 'minutes' | 'skills';

export interface WeeklyGoalTemplate {
  id: string;
  description: string;
  type: WeeklyGoalType;
  target: number;
  gemReward: number;
}

export interface WeeklyChallengeState {
  goalId: string;
  description: string;
  type: WeeklyGoalType;
  target: number;
  progress: number;
  skillsUsed: string[];
  startAt: string;
  expiresAt: string;
  gemReward: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'total_tasks' | 'total_minutes' | 'skill_level_any' | 'skill_level_count' | 'unique_skills' | 'global_level' | 'park_level' | 'items_unlocked' | 'gems_spent' | 'lifetime_gems' | 'unique_days' | 'streak_days' | 'daily_tasks' | 'daily_minutes' | 'inactivity_return';
  requirementValue: number;
  metaValue?: number; // Used for secondary requirements (e.g. "Level X" in "Y skills" -> metaValue = Level X)
  skillId?: string;
  gemReward: number;
  titleReward?: string;
}

export interface AppState {
  tasks: Task[];
  skills: Skill[];
  totalGems: number;
  lifetimeGems: number;    // New: Track total earned over time
  totalGemsSpent: number;  // New: Track spending
  quotes: string[];
  userName: string;
  themeId: string;
  onboardingCompleted: boolean;
  // Park Progression
  parkLevel: number;
  parkXP: number;
  totalMinutesSpent: number;
  unlockedParkItems: string[];
  selectedParkItems: string[]; // Items currently visible in the park
  // Achievement System
  unlockedAchievements: string[];
  unlockedTitles: string[];
  currentTitle: string;
  // Booster / Shop (consumables)
  activeBoosters: {
    xpMultiplier: { multiplier: number; expiresAt: string } | null;
    gemDoublerRemaining: number;
    firstWinOwned: boolean;
    firstWinUsedForDate: string | null;
    momentumOwned: boolean;
    momentumLastClaimedDate: string | null;
    secondChanceAvailable: boolean;
    skillFocus: { skillId: string; expiresAt: string } | null;
    weeklyChallenge: WeeklyChallengeState | null;
    gemRushRemaining: number;
    deepWorkUsesRemaining: number;
  };
}

export type ViewType = 'home' | 'profile' | 'shop' | 'settings' | 'addTask' | 'themeSelection' | 'editProfile' | 'contact';

export interface TaskCompletionData {
  minutes: number;
}
