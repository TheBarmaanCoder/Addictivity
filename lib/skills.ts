import type { Skill } from '../types';

export const MIN_TRACKED_SKILLS = 3;
export const MAX_TRACKED_SKILLS = 6;

export function isSkillTracked(skill: Skill): boolean {
  return skill.tracking !== 'archived';
}

export function getActiveSkills(skills: Skill[]): Skill[] {
  return skills.filter(isSkillTracked);
}

/** Skills shown when adding/editing a task: active skills, plus the task's skill if it is archived. */
export function skillsForTaskPicker(allSkills: Skill[], initialTaskSkillId?: string | null): Skill[] {
  const active = getActiveSkills(allSkills);
  if (!initialTaskSkillId) return active;
  const taskSkill = allSkills.find(s => s.id === initialTaskSkillId);
  if (!taskSkill || isSkillTracked(taskSkill)) return active;
  return [taskSkill, ...active.filter(s => s.id !== taskSkill.id)];
}

export function normalizeSkillTracking(skills: Skill[]): Skill[] {
  let out = skills.map((s) => ({
    ...s,
    tracking: (s.tracking === 'archived' ? 'archived' : 'active') as 'active' | 'archived',
  }));

  const countActive = () => out.filter((s) => s.tracking === 'active').length;

  while (countActive() > MAX_TRACKED_SKILLS) {
    for (let i = out.length - 1; i >= 0; i--) {
      if (out[i].tracking === 'active') {
        out[i] = { ...out[i], tracking: 'archived' };
        break;
      }
    }
  }

  while (countActive() < MIN_TRACKED_SKILLS) {
    let promoted = false;
    for (let i = 0; i < out.length; i++) {
      if (out[i].tracking === 'archived') {
        out[i] = { ...out[i], tracking: 'active' };
        promoted = true;
        break;
      }
    }
    if (!promoted) break;
  }

  return out;
}
