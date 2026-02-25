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
  | 'inactivity_return';

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
  { id: 'm1', title: 'First Steps', description: 'Complete your first task.', icon: 'check_circle', category: 'total_tasks', requirementValue: 1, gemReward: 20 },
  { id: 'm2', title: 'In the Zone', description: 'Log your first minute of focused time.', icon: 'timer', category: 'total_minutes', requirementValue: 1, gemReward: 20 },
  { id: 'm3', title: 'Level Up', description: 'Reach Level 2 in any skill.', icon: 'arrow_upward', category: 'skill_level_any', requirementValue: 2, gemReward: 50 },
  { id: 'm4', title: 'Gaining Momentum', description: 'Reach Level 3 in any skill.', icon: 'trending_up', category: 'skill_level_any', requirementValue: 3, gemReward: 75 },
  { id: 'm5', title: 'Mastery Begins', description: 'Reach Level 5 in any skill.', icon: 'military_tech', category: 'skill_level_any', requirementValue: 5, gemReward: 150 },
  { id: 'm6', title: '30 Minutes In', description: 'Spend a total of 30 minutes on tasks.', icon: 'schedule', category: 'total_minutes', requirementValue: 30, gemReward: 30 },
  { id: 'm7', title: 'Hour of Power', description: 'Spend a total of 1 hour on tasks.', icon: 'hourglass_bottom', category: 'total_minutes', requirementValue: 60, gemReward: 50 },
  { id: 'm8', title: 'Deep Work', description: 'Spend a total of 3 hours on tasks.', icon: 'psychology', category: 'total_minutes', requirementValue: 180, gemReward: 100 },
  { id: 'm9', title: 'Committed', description: 'Spend a total of 5 hours on tasks.', icon: 'history', category: 'total_minutes', requirementValue: 300, gemReward: 150 },
  { id: 'm10', title: 'Ten Hours', description: 'Spend a total of 10 hours on tasks.', icon: 'workspace_premium', category: 'total_minutes', requirementValue: 600, gemReward: 300, titleReward: 'Dedicated' },
  { id: 'm11', title: 'High Five', description: 'Complete 5 total tasks.', icon: 'filter_5', category: 'total_tasks', requirementValue: 5, gemReward: 50 },
  { id: 'm12', title: 'Double Digits', description: 'Complete 10 total tasks.', icon: 'filter_9_plus', category: 'total_tasks', requirementValue: 10, gemReward: 100 },
  { id: 'm13', title: 'Productivity Machine', description: 'Complete 25 total tasks.', icon: 'inventory', category: 'total_tasks', requirementValue: 25, gemReward: 250 },
  { id: 'm14', title: 'Dual Wield', description: 'Log time in 2 different skills.', icon: 'looks_two', category: 'unique_skills', requirementValue: 2, gemReward: 30 },
  { id: 'm15', title: 'Jack of All Trades', description: 'Log time in 3 different skills.', icon: 'looks_3', category: 'unique_skills', requirementValue: 3, gemReward: 50 },
  { id: 'm16', title: 'Renaissance Soul', description: 'Log time in all 6 skills.', icon: 'category', category: 'unique_skills', requirementValue: 6, gemReward: 150, titleReward: 'Polymath' },
  { id: 'm17', title: 'Balanced Growth', description: 'Reach Level 3 in 2 different skills.', icon: 'balance', category: 'skill_level_count', requirementValue: 2, metaValue: 3, gemReward: 100 },
  { id: 'm18', title: 'Triple Threat', description: 'Reach Level 3 in 3 different skills.', icon: 'layers', category: 'skill_level_count', requirementValue: 3, metaValue: 3, gemReward: 150 },
  { id: 'm19', title: 'Elite Duo', description: 'Reach Level 5 in 2 different skills.', icon: 'hotel_class', category: 'skill_level_count', requirementValue: 2, metaValue: 5, gemReward: 250 },
  { id: 'm20', title: 'Rising Star', description: 'Reach Global Level 5.', icon: 'star', category: 'global_level', requirementValue: 5, gemReward: 100 },
  { id: 'm21', title: 'Pro', description: 'Reach Global Level 10.', icon: 'stars', category: 'global_level', requirementValue: 10, gemReward: 200 },
  { id: 'm22', title: 'Elite', description: 'Reach Global Level 15.', icon: 'verified', category: 'global_level', requirementValue: 15, gemReward: 400, titleReward: 'Elite' },
  { id: 'm23', title: 'Gardener', description: 'Reach Park Level 3.', icon: 'yard', category: 'park_level', requirementValue: 3, gemReward: 50 },
  { id: 'm24', title: 'Landscaper', description: 'Reach Park Level 5.', icon: 'park', category: 'park_level', requirementValue: 5, gemReward: 100 },
  { id: 'm25', title: 'First Decoration', description: 'Unlock your first park cosmetic.', icon: 'shopping_bag', category: 'items_unlocked', requirementValue: 2, gemReward: 20 },
  { id: 'm26', title: 'Decorator', description: 'Unlock 5 park cosmetics.', icon: 'deck', category: 'items_unlocked', requirementValue: 6, gemReward: 100 },
  { id: 'm27', title: 'Spender', description: 'Spend your first gem.', icon: 'monetization_on', category: 'gems_spent', requirementValue: 1, gemReward: 10 },
  { id: 'm28', title: 'Saver', description: 'Earn 100 total gems.', icon: 'savings', category: 'lifetime_gems', requirementValue: 100, gemReward: 50 },
  { id: 'm29', title: 'Tycoon', description: 'Earn 500 total gems.', icon: 'account_balance', category: 'lifetime_gems', requirementValue: 500, gemReward: 200 },
  { id: 'm30', title: 'Consistency', description: 'Complete tasks on 3 different days.', icon: 'date_range', category: 'unique_days', requirementValue: 3, gemReward: 50 },
  { id: 'm31', title: 'Habitual', description: 'Complete tasks on 5 different days.', icon: 'event_repeat', category: 'unique_days', requirementValue: 5, gemReward: 100 },
  { id: 'm32', title: 'Lifestyle', description: 'Complete tasks on 7 different days.', icon: 'calendar_month', category: 'unique_days', requirementValue: 7, gemReward: 200 },
  { id: 'm33', title: 'Heating Up', description: 'Maintain a 3-day activity streak.', icon: 'local_fire_department', category: 'streak_days', requirementValue: 3, gemReward: 50 },
  { id: 'm34', title: 'On Fire', description: 'Maintain a 7-day activity streak.', icon: 'whatshot', category: 'streak_days', requirementValue: 7, gemReward: 150, titleReward: 'Unstoppable' },
  { id: 'm35', title: 'Welcome Back', description: 'Return and log a task after 3 days of inactivity.', icon: 'restart_alt', category: 'inactivity_return', requirementValue: 3, gemReward: 50 },
  { id: 'm36', title: 'Resurrection', description: 'Return and log a task after 7 days of inactivity.', icon: 'history_toggle_off', category: 'inactivity_return', requirementValue: 7, gemReward: 100 },
  { id: 'm37', title: 'Busy Bee', description: 'Complete 3 tasks in a single day.', icon: 'work_history', category: 'daily_tasks', requirementValue: 3, gemReward: 50 },
  { id: 'm38', title: 'Powerhouse', description: 'Complete 5 tasks in a single day.', icon: 'fact_check', category: 'daily_tasks', requirementValue: 5, gemReward: 100 },
  { id: 'm39', title: 'Marathon', description: 'Log more than 2 hours of time in a single day.', icon: 'timelapse', category: 'daily_minutes', requirementValue: 120, gemReward: 150 },
];
