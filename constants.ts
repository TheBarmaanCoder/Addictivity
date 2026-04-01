import { Skill, AppState, ShopItem, Achievement, BoosterShopItem, WeeklyGoalTemplate } from './types';
import { THEMES } from './lib/theme';

export { THEMES };

// Exported skill foundations
export const INITIAL_SKILLS: Skill[] = [
  { id: 's1', name: 'Wisdom', totalMinutes: 0, totalPoints: 0, pointsPerMinute: 10, isCustom: false, color: '#3a6b46', icon: 'school', streak: 0, importance: 'important', tracking: 'active' },
  { id: 's2', name: 'Discipline', totalMinutes: 0, totalPoints: 0, pointsPerMinute: 10, isCustom: false, color: '#e89635', icon: 'self_improvement', streak: 0, importance: 'important', tracking: 'active' },
  { id: 's3', name: 'Body', totalMinutes: 0, totalPoints: 0, pointsPerMinute: 10, isCustom: false, color: '#f58c63', icon: 'fitness_center', streak: 0, importance: 'important', tracking: 'active' },
];

// Defined and exported INITIAL_STATE for app initialization
export const INITIAL_STATE: AppState = {
  tasks: [],
  skills: INITIAL_SKILLS,
  totalGems: 50,
  lifetimeGems: 50,
  totalGemsSpent: 0,
  quotes: ["Small steps lead to great distances.", "The best time to plant a tree was 20 years ago. The second best time is now."],
  userName: 'Explorer',
  themeId: 'p1',
  onboardingCompleted: false,
  parkLevel: 1,
  parkXP: 0,
  totalMinutesSpent: 0,
  unlockedParkItems: ['tree_basic'],
  selectedParkItems: ['tree_basic'],
  unlockedAchievements: [],
  unlockedTitles: ['Explorer'],
  currentTitle: 'Explorer',
  activeBoosters: {
    xpMultiplier: null,
    gemDoublerRemaining: 0,
    firstWinOwned: false,
    firstWinUsedForDate: null,
    momentumOwned: false,
    momentumLastClaimedDate: null,
    secondChanceAvailable: false,
    skillFocus: null,
    weeklyChallenge: null,
    gemRushRemaining: 0,
    deepWorkUsesRemaining: 0,
  },
};

// Booster shop items (multipliers, streak, session, challenges)
export const BOOSTER_SHOP_ITEMS: BoosterShopItem[] = [
  { id: 'double_gems_1x', name: 'Double Gems', category: 'multiplier', description: '2× gems on your next task completion', icon: 'diamond', cost: 55, minLevel: 1, color: '#e89635' },
  { id: 'focus_burst', name: 'Focus Burst', category: 'multiplier', description: '1.5× XP for the next 60 minutes', icon: 'bolt', cost: 90, minLevel: 3, color: '#3a6b46' },
  { id: 'weekly_challenge', name: 'Weekly Challenge', category: 'challenge', description: 'Random 7-day goal — big gem payout if you finish', icon: 'flag', cost: 140, minLevel: 5, color: '#ef4444' },
  { id: 'skill_focus_7d', name: 'Skill Focus', category: 'challenge', description: '1.2× XP on one skill you choose for 7 days', icon: 'star', cost: 220, minLevel: 8, color: '#8b5cf6' },
  { id: 'second_chance', name: 'Second Chance', category: 'streak', description: 'Next time you miss a day, keep your streak (one use)', icon: 'restart_alt', cost: 350, minLevel: 12, color: '#059669' },
];

// Weekly goal templates (random one assigned when user buys Weekly Challenge)
export const WEEKLY_GOALS: WeeklyGoalTemplate[] = [
  { id: 'wg1', description: 'Complete 18 tasks this week', type: 'tasks', target: 18, gemReward: 80 },
  { id: 'wg2', description: 'Complete 28 tasks this week', type: 'tasks', target: 28, gemReward: 120 },
  { id: 'wg3', description: 'Log 180 minutes this week', type: 'minutes', target: 180, gemReward: 70 },
  { id: 'wg4', description: 'Log 360 minutes this week', type: 'minutes', target: 360, gemReward: 110 },
  { id: 'wg5', description: 'Use 4 different skills this week', type: 'skills', target: 4, gemReward: 65 },
  { id: 'wg6', description: 'Use 5 different skills this week', type: 'skills', target: 5, gemReward: 90 },
];

/** Small park catalog — each item fills a distinct role (starter tree, upgrade tree, path, seat, water, companion). */
export const SHOP_ITEMS: ShopItem[] = [
  { id: 'tree_basic', name: 'Basic Oak', type: 'tree', icon: 'park', cost: 0, minLevel: 1, color: '#4ade80', description: 'Your first tree — sturdy and green.' },
  { id: 'tree_maple', name: 'Maple Tree', type: 'tree', icon: 'nature', cost: 450, minLevel: 8, color: '#ef4444', description: 'Bold color — a real park centerpiece.' },
  { id: 'path_dirt', name: 'Dirt Path', type: 'path', icon: 'edit_road', cost: 220, minLevel: 5, color: '#a16207', description: 'A worn trail through your space.' },
  { id: 'bench_wood', name: 'Wood Bench', type: 'decoration', icon: 'chair', cost: 120, minLevel: 3, color: '#78350f', description: 'Somewhere to pause and reflect.' },
  { id: 'pond', name: 'Koi Pond', type: 'structure', icon: 'water_drop', cost: 950, minLevel: 12, color: '#3b82f6', description: 'Still water and calm vibes.' },
  { id: 'companion_bird', name: 'Songbird', type: 'pet', icon: 'nest_eco', cost: 280, minLevel: 6, color: '#0ea5e9', description: 'A small companion that visits often.' },
];

/** Fewer, harder milestones — each should feel earned. */
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

// Defined and exported AVAILABLE_ICONS for onboarding
export const AVAILABLE_ICONS: string[] = [
  'school', 'self_improvement', 'fitness_center', 'palette', 'book', 'terminal', 'language', 'music_note', 'code', 'menu_book', 'science', 'psychology', 'sports_esports', 'hiking', 'brush', 'theater_comedy', 'mic', 'camera_enhance', 'edit', 'auto_stories', 'groups', 'restaurant', 'water_drop'
];
