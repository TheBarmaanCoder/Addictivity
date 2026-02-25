/**
 * Fixed skills created for every new user. Match frontend INITIAL_SKILLS.
 */
export const DEFAULT_SKILLS = [
  { externalId: 's1', name: 'Wisdom', color: '#3a6b46', icon: 'school', importance: 'important' as const, sortOrder: 0 },
  { externalId: 's2', name: 'Discipline', color: '#e89635', icon: 'self_improvement', importance: 'important' as const, sortOrder: 1 },
  { externalId: 's3', name: 'Body', color: '#f58c63', icon: 'fitness_center', importance: 'important' as const, sortOrder: 2 },
];
