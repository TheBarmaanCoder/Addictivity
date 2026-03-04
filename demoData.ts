import { INITIAL_STATE, INITIAL_SKILLS } from './constants';
import { AppState } from './types';

// This file acts as the "Local Save" within the code.
// If the browser cache is cleared, the app will rebuild itself using this data.

export const DEMO_USERS_DB = {
  "test@example.com": { password: "password", name: "Demo User" },
  "john@addictivity.com": { password: "123", name: "John Doe" },
  "mansouri.barmaan@gmail.com": { password: "password", name: "Barmaan" }
};

export const DEMO_USER_DATA: Record<string, AppState> = {
  "test@example.com": {
    ...INITIAL_STATE,
    userName: "Demo User",
    totalGems: 0,
    lifetimeGems: 0,
    totalGemsSpent: 0,
    onboardingCompleted: true,
    skills: [
      ...INITIAL_SKILLS,
      { id: 'custom-0', name: 'Social', totalMinutes: 0, totalPoints: 0, pointsPerMinute: 10, isCustom: true, color: '#f4a261', icon: 'groups', streak: 0 },
      { id: 'custom-1', name: 'Eat', totalMinutes: 0, totalPoints: 0, pointsPerMinute: 10, isCustom: true, color: '#365c48', icon: 'restaurant', streak: 0 },
      { id: 'custom-2', name: 'Water', totalMinutes: 0, totalPoints: 0, pointsPerMinute: 10, isCustom: true, color: '#1a3b2b', icon: 'water_drop', streak: 0 },
    ],
    tasks: [
      { id: 'd1', title: 'Explore Addictivity', skillId: 's1', recurrence: null, dueDate: new Date().toISOString(), completed: false },
      { id: 'd2', title: 'Hydrate well', skillId: 'custom-2', recurrence: null, dueDate: new Date().toISOString(), completed: false },
    ]
  },
  "john@addictivity.com": {
    ...INITIAL_STATE,
    userName: "John Doe",
    totalGems: 0,
    lifetimeGems: 0,
    totalGemsSpent: 0,
    themeId: 'p2',
    onboardingCompleted: true
  },
  "mansouri.barmaan@gmail.com": {
    ...INITIAL_STATE,
    userName: "Barmaan",
    totalGems: 0,
    lifetimeGems: 0,
    totalGemsSpent: 0,
    themeId: 'p3',
    onboardingCompleted: true,
    tasks: [
        { id: 'b1', title: 'Welcome Back', skillId: 's1', recurrence: null, dueDate: new Date().toISOString(), completed: false }
    ]
  }
};
