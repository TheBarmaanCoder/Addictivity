import * as skillService from './skill.service.js';
import * as taskService from './task.service.js';
import * as profileService from './profile.service.js';

export interface AppStateResponse {
  profile: profileService.ProfileResponse;
  skills: skillService.SkillResponse[];
  tasks: taskService.TaskResponse[];
}

/**
 * Bootstrap endpoint: returns profile, skills, and today's incomplete tasks in one request.
 */
export async function getAppState(userId: string): Promise<AppStateResponse> {
  const today = new Date().toISOString().slice(0, 10);

  const [profile, skillsList, tasksList] = await Promise.all([
    profileService.getProfileByUserId(userId),
    skillService.listByUserId(userId),
    taskService.listByUserId(userId, { dueDate: today, completed: false }),
  ]);

  if (!profile) {
    throw new Error('Profile not found');
  }

  return {
    profile,
    skills: skillsList,
    tasks: tasksList,
  };
}
