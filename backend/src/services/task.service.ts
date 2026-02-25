import { eq, and, asc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { tasks, type RecurrenceUnit } from '../db/schema/tasks.js';
import { skills } from '../db/schema/skills.js';
import { profiles } from '../db/schema/profiles.js';
import { taskCompletions } from '../db/schema/task-completions.js';
import { getStreakMultiplier, getSkillLevel, getParkLevelFromXP } from '../lib/levels.js';
import { evaluateMilestones } from './milestone.service.js';
import { BadRequestError, ForbiddenError, NotFoundError, ConflictError } from '../lib/errors.js';
import { sanitizeText } from '../lib/sanitize.js';

export interface TaskResponse {
  id: string;
  title: string;
  skillId: string;
  dueDate: string | null;
  recurrence: { value: number; unit: RecurrenceUnit } | null;
  completed: boolean;
  completedAt: string | null;
  minutesSpent: number | null;
  createdAt: string;
  updatedAt: string;
}

function toTaskResponse(row: typeof tasks.$inferSelect): TaskResponse {
  return {
    id: row.id,
    title: row.title,
    skillId: row.skillId,
    dueDate: row.dueDate,
    recurrence: row.recurrence,
    completed: row.completed,
    completedAt: row.completedAt?.toISOString() ?? null,
    minutesSpent: row.minutesSpent,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export interface ListTasksQuery {
  dueDate?: string; // YYYY-MM-DD
  completed?: boolean;
}

export async function listByUserId(userId: string, query: ListTasksQuery): Promise<TaskResponse[]> {
  const conditions = [eq(tasks.userId, userId)];
  if (query.dueDate !== undefined) {
    conditions.push(eq(tasks.dueDate, query.dueDate));
  }
  if (query.completed !== undefined) {
    conditions.push(eq(tasks.completed, query.completed));
  }
  const rows = await db
    .select()
    .from(tasks)
    .where(and(...conditions))
    .orderBy(asc(tasks.dueDate), asc(tasks.createdAt));
  return rows.map(toTaskResponse);
}

export interface CreateTaskInput {
  title: string;
  skillId: string;
  dueDate?: string | null;
  recurrence?: { value: number; unit: RecurrenceUnit } | null;
}

export async function createTask(userId: string, input: CreateTaskInput): Promise<TaskResponse> {
  const title = sanitizeText(input.title ?? '');
  if (!title || title.length > 200) {
    throw new BadRequestError('Title is required and must be at most 200 characters');
  }
  const [skill] = await db
    .select()
    .from(skills)
    .where(and(eq(skills.id, input.skillId), eq(skills.userId, userId)))
    .limit(1);
  if (!skill) {
    throw new BadRequestError('Invalid skill_id');
  }
  const dueDate = input.dueDate && input.dueDate.trim() ? input.dueDate.trim() : null;
  const recurrence = input.recurrence ?? null;
  const [inserted] = await db
    .insert(tasks)
    .values({
      userId,
      title,
      skillId: input.skillId,
      dueDate,
      recurrence,
    })
    .returning();
  if (!inserted) throw new Error('Insert failed');
  return toTaskResponse(inserted);
}

export interface UpdateTaskInput {
  title?: string;
  dueDate?: string | null;
  recurrence?: { value: number; unit: RecurrenceUnit } | null;
}

export async function updateTask(
  userId: string,
  taskId: string,
  input: UpdateTaskInput
): Promise<TaskResponse> {
  const [existing] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  if (!existing) throw new NotFoundError('Task not found');
  if (existing.userId !== userId) throw new ForbiddenError('Not allowed to update this task');
  if (existing.completed) {
    throw new BadRequestError('Cannot update a completed task');
  }
  const updates: Partial<typeof tasks.$inferInsert> = {};
  if (input.title !== undefined) {
    const t = sanitizeText(input.title);
    if (!t || t.length > 200) throw new BadRequestError('Title must be 1–200 characters');
    updates.title = t;
  }
  if (input.dueDate !== undefined) {
    updates.dueDate = input.dueDate && input.dueDate.trim() ? input.dueDate.trim() : null;
  }
  if (input.recurrence !== undefined) {
    updates.recurrence = input.recurrence;
  }
  if (Object.keys(updates).length === 0) return toTaskResponse(existing);
  const [updated] = await db
    .update(tasks)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(tasks.id, taskId))
    .returning();
  if (!updated) throw new Error('Update failed');
  return toTaskResponse(updated);
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
  const [existing] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  if (!existing) throw new NotFoundError('Task not found');
  if (existing.userId !== userId) throw new ForbiddenError('Not allowed to delete this task');
  await db.delete(tasks).where(eq(tasks.id, taskId));
}

export interface CompleteTaskInput {
  minutesSpent: number;
  intensityMultiplier?: number;
}

export interface CompleteTaskResult {
  task: TaskResponse;
  nextTask?: TaskResponse;
  profile: {
    totalGems: number;
    lifetimeGems: number;
    parkLevel: number;
    parkXp: number;
    totalMinutesSpent: number;
    unlockedAchievementIds: string[];
    unlockedTitles: string[];
  };
  newlyUnlockedAchievements: Array<{ id: string; title: string; description: string; icon: string; gemReward: number; titleReward?: string }>;
}

export async function completeTask(
  userId: string,
  taskId: string,
  input: CompleteTaskInput
): Promise<CompleteTaskResult> {
  const minutes = Math.max(1, Math.floor(input.minutesSpent));
  const intensityMultiplier = Math.max(0.6, Math.min(1.4, input.intensityMultiplier ?? 1));

  const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  if (!task) throw new NotFoundError('Task not found');
  if (task.userId !== userId) throw new ForbiddenError('Not allowed to complete this task');
  if (task.completed) throw new ConflictError('Task is already completed');

  const [skill] = await db.select().from(skills).where(eq(skills.id, task.skillId)).limit(1);
  if (!skill) throw new BadRequestError('Skill not found');

  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  if (!profile) throw new Error('Profile not found');

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let currentStreak = skill.streak;
  const lastCompleted = skill.lastSkillCompletedAt
    ? new Date(skill.lastSkillCompletedAt)
    : null;
  const lastDate = lastCompleted
    ? new Date(lastCompleted.getFullYear(), lastCompleted.getMonth(), lastCompleted.getDate())
    : null;
  if (lastDate) {
    const diffDays = Math.floor((todayStart.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) currentStreak += 1;
    else if (diffDays > 1) currentStreak = Math.max(0, currentStreak - (diffDays - 1)) + 1;
  } else {
    currentStreak = 1;
  }

  const streakMult = getStreakMultiplier(currentStreak);
  const totalMult = intensityMultiplier * streakMult;
  const xpEarned = Math.floor(minutes * totalMult);
  const gemsEarned = Math.floor(minutes);

  const oldSkillLevel = getSkillLevel(skill.totalPoints);
  const newSkillLevel = getSkillLevel(skill.totalPoints + xpEarned);
  const levelUpBonus = newSkillLevel > oldSkillLevel ? (newSkillLevel - oldSkillLevel) * 10 : 0;
  const timeXP = (minutes / 60) * 5;
  const addedParkXp = levelUpBonus + timeXP;
  const newParkXp = profile.parkXp + addedParkXp;
  const newParkLevel = getParkLevelFromXP(newParkXp);
  const newTotalMinutes = profile.totalMinutesSpent + minutes;
  const newTotalGems = profile.totalGems + gemsEarned;
  const newLifetimeGems = profile.lifetimeGems + gemsEarned;

  let nextTask: typeof tasks.$inferSelect | null = null;
  if (task.recurrence && task.dueDate) {
    const nextDate = new Date(task.dueDate);
    const { value, unit } = task.recurrence;
    if (unit === 'Days') nextDate.setDate(nextDate.getDate() + value);
    if (unit === 'Weeks') nextDate.setDate(nextDate.getDate() + value * 7);
    if (unit === 'Months') nextDate.setMonth(nextDate.getMonth() + value);
    nextTask = {
      ...task,
      id: uuidv4(),
      dueDate: nextDate.toISOString().slice(0, 10),
      completed: false,
      completedAt: null,
      minutesSpent: null,
      createdAt: now,
      updatedAt: now,
    };
  }

  let capturedNewlyUnlocked: CompleteTaskResult['newlyUnlockedAchievements'] = [];

  await db.transaction(async (tx) => {
    await tx
      .update(skills)
      .set({
        streak: currentStreak,
        lastSkillCompletedAt: now,
        totalMinutes: skill.totalMinutes + minutes,
        totalPoints: skill.totalPoints + xpEarned,
        updatedAt: now,
      })
      .where(eq(skills.id, task.skillId));

    await tx
      .update(tasks)
      .set({
        completed: true,
        completedAt: now,
        minutesSpent: minutes,
        updatedAt: now,
      })
      .where(eq(tasks.id, taskId));

    if (nextTask) {
      await tx.insert(tasks).values({
        id: nextTask.id,
        userId: nextTask.userId,
        title: nextTask.title,
        skillId: nextTask.skillId,
        dueDate: nextTask.dueDate,
        recurrence: nextTask.recurrence,
        completed: false,
        createdAt: nextTask.createdAt,
        updatedAt: nextTask.updatedAt,
      });
    }

    await tx.insert(taskCompletions).values({
      taskId,
      userId,
      skillId: task.skillId,
      completedAt: now,
      minutesSpent: minutes,
      xpEarned,
      gemsEarned,
    });

    const allCompletions = await tx
      .select({ completedAt: taskCompletions.completedAt, minutesSpent: taskCompletions.minutesSpent })
      .from(taskCompletions)
      .where(eq(taskCompletions.userId, userId))
      .orderBy(asc(taskCompletions.completedAt));

    const uniqueDays = new Set(
      allCompletions.map((c) => new Date(c.completedAt).toDateString())
    ).size;
    const sortedDates = Array.from(
      new Set(allCompletions.map((c) => new Date(c.completedAt).toDateString()))
    )
      .map((s) => new Date(s))
      .sort((a, b) => a.getTime() - b.getTime());
    let maxStreak = 0;
    let cur = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) cur = 1;
      else {
        const diff = (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
        cur = Math.round(diff) === 1 ? cur + 1 : 1;
      }
      if (cur > maxStreak) maxStreak = cur;
    }
    const todayStr = now.toDateString();
    const dailyTasksCount = allCompletions.filter(
      (c) => new Date(c.completedAt).toDateString() === todayStr
    ).length;
    const dailyMinutesCount = allCompletions
      .filter((c) => new Date(c.completedAt).toDateString() === todayStr)
      .reduce((a, c) => a + c.minutesSpent, 0);
    let maxInactivityGap = 0;
    if (allCompletions.length >= 2) {
      const latest = new Date(allCompletions[allCompletions.length - 1].completedAt);
      const prev = new Date(allCompletions[allCompletions.length - 2].completedAt);
      maxInactivityGap = (latest.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    }

    const allSkills = await tx.select().from(skills).where(eq(skills.userId, userId));
    const skillTotalPoints = allSkills.map((s) => s.totalPoints);
    const skillTotalMinutes = allSkills.map((s) => s.totalMinutes);

    const milestoneCtx = {
      unlockedAchievementIds: profile.unlockedAchievementIds,
      unlockedTitles: profile.unlockedTitles,
      totalGems: newTotalGems,
      lifetimeGems: newLifetimeGems,
      totalGemsSpent: profile.totalGemsSpent,
      totalMinutesSpent: newTotalMinutes,
      parkLevel: newParkLevel,
      unlockedParkItemIds: profile.unlockedParkItemIds,
      skillTotalPoints,
      skillTotalMinutes,
      totalTasks: allCompletions.length,
      uniqueDays,
      maxStreakDays: maxStreak,
      dailyTasksCount,
      dailyMinutesCount,
      maxInactivityGapDays: maxInactivityGap,
    };
    const milestoneResult = evaluateMilestones(milestoneCtx);

    const finalGems = newTotalGems + milestoneResult.bonusGems;
    const finalLifetime = newLifetimeGems + milestoneResult.bonusGems;

    await tx
      .update(profiles)
      .set({
        totalGems: finalGems,
        lifetimeGems: finalLifetime,
        totalMinutesSpent: newTotalMinutes,
        parkXp: newParkXp,
        parkLevel: newParkLevel,
        unlockedAchievementIds: milestoneResult.unlockedAchievementIds,
        unlockedTitles: milestoneResult.unlockedTitles,
        updatedAt: now,
      })
      .where(eq(profiles.userId, userId));

    capturedNewlyUnlocked.push(
      ...milestoneResult.newlyUnlocked.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      icon: a.icon,
      gemReward: a.gemReward,
      titleReward: a.titleReward,
    }))
    );
  });

  const [updatedTask] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  const [updatedProfile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  if (!updatedTask || !updatedProfile) throw new Error('State inconsistent after complete');

  const result: CompleteTaskResult = {
    task: toTaskResponse(updatedTask),
    profile: {
      totalGems: updatedProfile.totalGems,
      lifetimeGems: updatedProfile.lifetimeGems,
      parkLevel: updatedProfile.parkLevel,
      parkXp: updatedProfile.parkXp,
      totalMinutesSpent: updatedProfile.totalMinutesSpent,
      unlockedAchievementIds: updatedProfile.unlockedAchievementIds,
      unlockedTitles: updatedProfile.unlockedTitles,
    },
    newlyUnlockedAchievements: capturedNewlyUnlocked,
  };

  if (nextTask) {
    const [nextRow] = await db.select().from(tasks).where(eq(tasks.id, nextTask.id)).limit(1);
    if (nextRow) result.nextTask = toTaskResponse(nextRow);
  }

  return result;
}
