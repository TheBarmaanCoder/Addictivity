import { Skill, AppState, Theme, ShopItem, Achievement, BoosterShopItem, WeeklyGoalTemplate } from './types';

// Exported skill foundations
export const INITIAL_SKILLS: Skill[] = [
  { id: 's1', name: 'Wisdom', totalMinutes: 0, totalPoints: 0, pointsPerMinute: 10, isCustom: false, color: '#3a6b46', icon: 'school', streak: 0, importance: 'important' },
  { id: 's2', name: 'Discipline', totalMinutes: 0, totalPoints: 0, pointsPerMinute: 10, isCustom: false, color: '#e89635', icon: 'self_improvement', streak: 0, importance: 'important' },
  { id: 's3', name: 'Body', totalMinutes: 0, totalPoints: 0, pointsPerMinute: 10, isCustom: false, color: '#f58c63', icon: 'fitness_center', streak: 0, importance: 'important' },
];

// Defined and exported THEMES for UI customization
export const THEMES: Theme[] = [
  { id: 'p1', name: 'Classic Forest', colors: { primary: '#3a6b46', secondary: '#e89635', background: '#f8f9fa', surface: '#ffffff' } },
  { id: 'p2', name: 'Violet Dusk', colors: { primary: '#71557A', secondary: '#3A345B', background: '#F3C8DD', surface: '#D183A9' } },
  { id: 'p3', name: 'Olive', colors: { primary: '#4C583E', secondary: '#2C3424', background: '#959581', surface: '#768064' } },
  { id: 'p4', name: 'Blush Rose', colors: { primary: '#E5A8B1', secondary: '#E1CADA', background: '#E3D5CA', surface: '#F8EDEB' } },
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
  { id: 'double_gems_1x', name: 'Double Gems (1x)', category: 'multiplier', description: '2× gems on next 1 completion', icon: 'diamond', cost: 40, minLevel: 1, color: '#e89635' },
  { id: 'focus_burst', name: 'Focus Burst', category: 'multiplier', description: '1.5× XP for next 60 min', icon: 'bolt', cost: 60, minLevel: 2, color: '#3a6b46' },
  { id: 'deep_work', name: 'Deep Work', category: 'session', description: '+10% XP for one task ≥ 25 min', icon: 'psychology', cost: 50, minLevel: 2, color: '#4C583E' },
  { id: 'xp_boost_1h', name: 'XP Boost (1h)', category: 'multiplier', description: '1.5× XP for 1 hour', icon: 'trending_up', cost: 80, minLevel: 3, color: '#71557A' },
  { id: 'first_win', name: 'First Win', category: 'session', description: 'Double gems on first task completed today', icon: 'emoji_events', cost: 100, minLevel: 4, color: '#fbbf24' },
  { id: 'gem_doubler_3x', name: 'Gem Doubler (3x)', category: 'multiplier', description: '2× gems on next 3 completions', icon: 'diamond', cost: 120, minLevel: 5, color: '#e89635' },
  { id: 'power_hour', name: 'Power Hour', category: 'multiplier', description: '1.25× XP for all tasks in next 1 hour', icon: 'schedule', cost: 90, minLevel: 5, color: '#3a6b46' },
  { id: 'weekly_challenge', name: 'Weekly Challenge', category: 'challenge', description: 'Complete a random weekly goal for bonus gems/XP', icon: 'flag', cost: 100, minLevel: 5, color: '#ef4444' },
  { id: 'momentum', name: 'Momentum', category: 'session', description: 'Bonus gems when you complete 2+ tasks in one day', icon: 'local_fire_department', cost: 140, minLevel: 7, color: '#f97316' },
  { id: 'xp_boost_24h', name: 'XP Boost (24h)', category: 'multiplier', description: '1.5× XP for 24 hours', icon: 'auto_awesome', cost: 200, minLevel: 8, color: '#71557A' },
  { id: 'skill_focus_7d', name: 'Skill Focus (7d)', category: 'challenge', description: '1.2× XP for one chosen skill for 7 days', icon: 'star', cost: 180, minLevel: 9, color: '#8b5cf6' },
  { id: 'gem_rush', name: 'Gem Rush', category: 'challenge', description: 'Next 5 completions give +5 bonus gems each', icon: 'savings', cost: 220, minLevel: 11, color: '#e89635' },
  { id: 'second_chance', name: 'Second Chance', category: 'streak', description: 'Restore streak after one broken day (single use)', icon: 'restart_alt', cost: 300, minLevel: 15, color: '#059669' },
];

// Weekly goal templates (random one assigned when user buys Weekly Challenge)
export const WEEKLY_GOALS: WeeklyGoalTemplate[] = [
  { id: 'wg1', description: 'Complete 10 tasks this week', type: 'tasks', target: 10, gemReward: 50 },
  { id: 'wg2', description: 'Complete 15 tasks this week', type: 'tasks', target: 15, gemReward: 75 },
  { id: 'wg3', description: 'Complete 20 tasks this week', type: 'tasks', target: 20, gemReward: 100 },
  { id: 'wg4', description: 'Log 60 minutes this week', type: 'minutes', target: 60, gemReward: 40 },
  { id: 'wg5', description: 'Log 120 minutes this week', type: 'minutes', target: 120, gemReward: 60 },
  { id: 'wg6', description: 'Log 180 minutes this week', type: 'minutes', target: 180, gemReward: 80 },
  { id: 'wg7', description: 'Log 300 minutes this week', type: 'minutes', target: 300, gemReward: 120 },
  { id: 'wg8', description: 'Use 3 different skills this week', type: 'skills', target: 3, gemReward: 45 },
  { id: 'wg9', description: 'Use 4 different skills this week', type: 'skills', target: 4, gemReward: 60 },
  { id: 'wg10', description: 'Use 5 different skills this week', type: 'skills', target: 5, gemReward: 80 },
];

// Completed SHOP_ITEMS array with missing properties and items (legacy park shop)
export const SHOP_ITEMS: ShopItem[] = [
  // Trees (Max 2 active)
  { id: 'tree_basic', name: 'Basic Oak', type: 'tree', icon: 'park', cost: 0, minLevel: 1, color: '#4ade80', description: 'A sturdy oak tree.' },
  { id: 'tree_pine', name: 'Pine Tree', type: 'tree', icon: 'forest', cost: 100, minLevel: 4, color: '#14532d', description: 'Evergreen pine.' },
  { id: 'tree_birch', name: 'Birch Tree', type: 'tree', icon: 'nature', cost: 300, minLevel: 7, color: '#fef3c7', description: 'White bark birch.' },
  { id: 'tree_maple', name: 'Maple Tree', type: 'tree', icon: 'nature', cost: 400, minLevel: 9, color: '#ef4444', description: 'Vibrant autumn colors.' },
  { id: 'tree_apple', name: 'Apple Tree', type: 'tree', icon: 'nutrition', cost: 600, minLevel: 14, color: '#84cc16', description: 'Fruit bearing tree.' },
  { id: 'tree_cherry', name: 'Cherry Blossom', type: 'tree', icon: 'filter_vintage', cost: 900, minLevel: 16, color: '#f472b6', description: 'Pink sakura petals.' },
  { id: 'tree_sakura_ancient', name: 'Ancient Sakura', type: 'tree', icon: 'local_florist', cost: 1500, minLevel: 19, color: '#db2777', description: 'A massive, old cherry tree.' },

  // Paths
  { id: 'path_dirt', name: 'Dirt Path', type: 'path', icon: 'edit_road', cost: 200, minLevel: 6, color: '#a16207', description: 'A simple worn path.' },
  { id: 'path_pebble', name: 'Pebble Path', type: 'path', icon: 'grain', cost: 400, minLevel: 10, color: '#94a3b8', description: 'Crunchy stone path.' },

  // Structures & Decor
  { id: 'bench_wood', name: 'Wood Bench', type: 'decoration', icon: 'chair', cost: 50, minLevel: 2, color: '#78350f', description: 'A place to rest.' },
  { id: 'bush_small', name: 'Small Bush', type: 'decoration', icon: 'grass', cost: 60, minLevel: 3, color: '#16a34a', description: 'Low lying shrubbery.' },
  { id: 'density_high', name: 'Dense Foliage', type: 'decoration', icon: 'grid_view', cost: 150, minLevel: 5, color: '#065f46', description: 'More trees in the park.' },
  { id: 'feeder', name: 'Bird Feeder', type: 'decoration', icon: 'inventory_2', cost: 150, minLevel: 6, color: '#b45309', description: 'Attracts local birds.' },
  { id: 'rock_decor', name: 'Decorative Rock', type: 'decoration', icon: 'landscape', cost: 200, minLevel: 8, color: '#57534e', description: 'A mossy boulder.' },
  { id: 'structure_chalet', name: 'Small Chalet', type: 'structure', icon: 'chalet', cost: 800, minLevel: 11, color: '#7c2d12', description: 'A cozy retreat.' },
  { id: 'lantern', name: 'Lantern Post', type: 'decoration', icon: 'light', cost: 400, minLevel: 12, color: '#fbbf24', description: 'Lights up the night.' },
  { id: 'pond', name: 'Koi Pond', type: 'structure', icon: 'water_drop', cost: 1000, minLevel: 13, color: '#3b82f6', description: 'Calm waters.' },
  { id: 'fireflies', name: 'Fireflies', type: 'decoration', icon: 'bug_report', cost: 500, minLevel: 13, color: '#facc15', description: 'Glowing insects.' },
  { id: 'lilypads', name: 'Lily Pads', type: 'decoration', icon: 'spa', cost: 300, minLevel: 14, color: '#22c55e', description: 'Greenery on water.' },
  { id: 'bench_stone', name: 'Stone Bench', type: 'decoration', icon: 'chair_alt', cost: 500, minLevel: 15, color: '#525252', description: 'Durable seating.' },
  { id: 'mat_sleeping', name: 'Sleeping Mat', type: 'decoration', icon: 'bed', cost: 400, minLevel: 16, color: '#fdba74', description: 'For outdoor naps.' },
  { id: 'structure_gazebo', name: 'Open Gazebo', type: 'structure', icon: 'deck', cost: 1200, minLevel: 17, color: '#fff7ed', description: 'Shelter from rain.' },
  { id: 'bridge', name: 'Wooden Bridge', type: 'decoration', icon: 'bridge', cost: 600, minLevel: 18, color: '#451a03', description: 'Cross the pond.' },
  { id: 'campfire', name: 'Campfire', type: 'decoration', icon: 'local_fire_department', cost: 1000, minLevel: 20, color: '#ef4444', description: 'Warm gathering spot.' },

  // Companions (pets)
  { id: 'companion_bird', name: 'Bird', type: 'pet', icon: 'nest_eco', cost: 80, minLevel: 5, color: '#0ea5e9', description: 'A friendly bird companion.' },
  { id: 'companion_bunny', name: 'Bunny', type: 'pet', icon: 'cruelty_free', cost: 150, minLevel: 10, color: '#a78bfa', description: 'A soft bunny companion.' },
  { id: 'companion_cat', name: 'Cat', type: 'pet', icon: 'pets', cost: 250, minLevel: 15, color: '#f97316', description: 'A cozy cat companion.' },
  { id: 'companion_dog', name: 'Dog', type: 'pet', icon: 'pets', cost: 400, minLevel: 20, color: '#b45309', description: 'A loyal dog companion.' },
];

// Defined and exported ACHIEVEMENTS constant
export const ACHIEVEMENTS: Achievement[] = [
  // Basics
  { id: 'm1', title: 'First Steps', description: 'Complete your first task.', icon: 'check_circle', category: 'total_tasks', requirementValue: 1, gemReward: 20 },
  { id: 'm2', title: 'In the Zone', description: 'Log your first minute of focused time.', icon: 'timer', category: 'total_minutes', requirementValue: 1, gemReward: 20 },
  
  // Skill Progression
  { id: 'm3', title: 'Level Up', description: 'Reach Level 2 in any skill.', icon: 'arrow_upward', category: 'skill_level_any', requirementValue: 2, gemReward: 50 },
  { id: 'm4', title: 'Gaining Momentum', description: 'Reach Level 3 in any skill.', icon: 'trending_up', category: 'skill_level_any', requirementValue: 3, gemReward: 75 },
  { id: 'm5', title: 'Mastery Begins', description: 'Reach Level 5 in any skill.', icon: 'military_tech', category: 'skill_level_any', requirementValue: 5, gemReward: 150 },
  
  // Time Milestones
  { id: 'm6', title: '30 Minutes In', description: 'Spend a total of 30 minutes on tasks.', icon: 'schedule', category: 'total_minutes', requirementValue: 30, gemReward: 30 },
  { id: 'm7', title: 'Hour of Power', description: 'Spend a total of 1 hour on tasks.', icon: 'hourglass_bottom', category: 'total_minutes', requirementValue: 60, gemReward: 50 },
  { id: 'm8', title: 'Deep Work', description: 'Spend a total of 3 hours on tasks.', icon: 'psychology', category: 'total_minutes', requirementValue: 180, gemReward: 100 },
  { id: 'm9', title: 'Committed', description: 'Spend a total of 5 hours on tasks.', icon: 'history', category: 'total_minutes', requirementValue: 300, gemReward: 150 },
  { id: 'm10', title: 'Ten Hours', description: 'Spend a total of 10 hours on tasks.', icon: 'workspace_premium', category: 'total_minutes', requirementValue: 600, gemReward: 300, titleReward: 'Dedicated' },

  // Task Counts
  { id: 'm11', title: 'High Five', description: 'Complete 5 total tasks.', icon: 'filter_5', category: 'total_tasks', requirementValue: 5, gemReward: 50 },
  { id: 'm12', title: 'Double Digits', description: 'Complete 10 total tasks.', icon: 'filter_9_plus', category: 'total_tasks', requirementValue: 10, gemReward: 100 },
  { id: 'm13', title: 'Productivity Machine', description: 'Complete 25 total tasks.', icon: 'inventory', category: 'total_tasks', requirementValue: 25, gemReward: 250 },

  // Breadth
  { id: 'm14', title: 'Dual Wield', description: 'Log time in 2 different skills.', icon: 'looks_two', category: 'unique_skills', requirementValue: 2, gemReward: 30 },
  { id: 'm15', title: 'Jack of All Trades', description: 'Log time in 3 different skills.', icon: 'looks_3', category: 'unique_skills', requirementValue: 3, gemReward: 50 },
  { id: 'm16', title: 'Renaissance Soul', description: 'Log time in all 6 skills.', icon: 'category', category: 'unique_skills', requirementValue: 6, gemReward: 150, titleReward: 'Polymath' },

  // Multi-Skill Depth
  { id: 'm17', title: 'Balanced Growth', description: 'Reach Level 3 in 2 different skills.', icon: 'balance', category: 'skill_level_count', requirementValue: 2, metaValue: 3, gemReward: 100 },
  { id: 'm18', title: 'Triple Threat', description: 'Reach Level 3 in 3 different skills.', icon: 'layers', category: 'skill_level_count', requirementValue: 3, metaValue: 3, gemReward: 150 },
  { id: 'm19', title: 'Elite Duo', description: 'Reach Level 5 in 2 different skills.', icon: 'hotel_class', category: 'skill_level_count', requirementValue: 2, metaValue: 5, gemReward: 250 },

  // Global Progression
  { id: 'm20', title: 'Rising Star', description: 'Reach Global Level 5.', icon: 'star', category: 'global_level', requirementValue: 5, gemReward: 100 },
  { id: 'm21', title: 'Pro', description: 'Reach Global Level 10.', icon: 'stars', category: 'global_level', requirementValue: 10, gemReward: 200 },
  { id: 'm22', title: 'Elite', description: 'Reach Global Level 15.', icon: 'verified', category: 'global_level', requirementValue: 15, gemReward: 400, titleReward: 'Elite' },

  // Park Progression
  { id: 'm23', title: 'Gardener', description: 'Reach Park Level 3.', icon: 'yard', category: 'park_level', requirementValue: 3, gemReward: 50 },
  { id: 'm24', title: 'Landscaper', description: 'Reach Park Level 5.', icon: 'park', category: 'park_level', requirementValue: 5, gemReward: 100 },
  { id: 'm25', title: 'First Decoration', description: 'Unlock your first park cosmetic.', icon: 'shopping_bag', category: 'items_unlocked', requirementValue: 2, gemReward: 20 }, // 1 default + 1 new
  { id: 'm26', title: 'Decorator', description: 'Unlock 5 park cosmetics.', icon: 'deck', category: 'items_unlocked', requirementValue: 6, gemReward: 100 },

  // Economy
  { id: 'm27', title: 'Spender', description: 'Spend your first gem.', icon: 'monetization_on', category: 'gems_spent', requirementValue: 1, gemReward: 10 },
  { id: 'm28', title: 'Saver', description: 'Earn 100 total gems.', icon: 'savings', category: 'lifetime_gems', requirementValue: 100, gemReward: 50 },
  { id: 'm29', title: 'Tycoon', description: 'Earn 500 total gems.', icon: 'account_balance', category: 'lifetime_gems', requirementValue: 500, gemReward: 200 },

  // Consistency & Streaks
  { id: 'm30', title: 'Consistency', description: 'Complete tasks on 3 different days.', icon: 'date_range', category: 'unique_days', requirementValue: 3, gemReward: 50 },
  { id: 'm31', title: 'Habitual', description: 'Complete tasks on 5 different days.', icon: 'event_repeat', category: 'unique_days', requirementValue: 5, gemReward: 100 },
  { id: 'm32', title: 'Lifestyle', description: 'Complete tasks on 7 different days.', icon: 'calendar_month', category: 'unique_days', requirementValue: 7, gemReward: 200 },
  { id: 'm33', title: 'Heating Up', description: 'Maintain a 3-day activity streak.', icon: 'local_fire_department', category: 'streak_days', requirementValue: 3, gemReward: 50 },
  { id: 'm34', title: 'On Fire', description: 'Maintain a 7-day activity streak.', icon: 'whatshot', category: 'streak_days', requirementValue: 7, gemReward: 150, titleReward: 'Unstoppable' },

  // Return / Recovery
  { id: 'm35', title: 'Welcome Back', description: 'Return and log a task after 3 days of inactivity.', icon: 'restart_alt', category: 'inactivity_return', requirementValue: 3, gemReward: 50 },
  { id: 'm36', title: 'Resurrection', description: 'Return and log a task after 7 days of inactivity.', icon: 'history_toggle_off', category: 'inactivity_return', requirementValue: 7, gemReward: 100 },

  // Daily Intensity
  { id: 'm37', title: 'Busy Bee', description: 'Complete 3 tasks in a single day.', icon: 'work_history', category: 'daily_tasks', requirementValue: 3, gemReward: 50 },
  { id: 'm38', title: 'Powerhouse', description: 'Complete 5 tasks in a single day.', icon: 'fact_check', category: 'daily_tasks', requirementValue: 5, gemReward: 100 },
  { id: 'm39', title: 'Marathon', description: 'Log more than 2 hours of time in a single day.', icon: 'timelapse', category: 'daily_minutes', requirementValue: 120, gemReward: 150 },
];

// Defined and exported AVAILABLE_ICONS for onboarding
export const AVAILABLE_ICONS: string[] = [
  'school', 'self_improvement', 'fitness_center', 'palette', 'book', 'terminal', 'language', 'music_note', 'code', 'menu_book', 'science', 'psychology', 'sports_esports', 'hiking', 'brush', 'theater_comedy', 'mic', 'camera_enhance', 'edit', 'auto_stories', 'groups', 'restaurant', 'water_drop'
];
