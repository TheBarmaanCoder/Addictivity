import { eq, and, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { skills } from '../db/schema/index.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../lib/errors.js';

const VALID_IMPORTANCE = ['casual', 'important', 'core'] as const;
const AVAILABLE_ICONS = [
  'school', 'self_improvement', 'fitness_center', 'palette', 'book', 'terminal', 'language', 'music_note',
  'code', 'menu_book', 'science', 'psychology', 'sports_esports', 'hiking', 'brush', 'theater_comedy',
  'mic', 'camera_enhance', 'edit', 'auto_stories', 'groups', 'restaurant', 'water_drop',
];

export interface SkillResponse {
  id: string;
  externalId: string;
  name: string;
  isCustom: boolean;
  color: string;
  icon: string;
  totalMinutes: number;
  totalPoints: number;
  pointsPerMinute: number;
  streak: number;
  lastSkillCompletedAt: string | null;
  importance: string | null;
  sortOrder: number;
}

function toResponse(row: typeof skills.$inferSelect): SkillResponse {
  return {
    id: row.id,
    externalId: row.externalId,
    name: row.name,
    isCustom: row.isCustom,
    color: row.color,
    icon: row.icon,
    totalMinutes: row.totalMinutes,
    totalPoints: row.totalPoints,
    pointsPerMinute: row.pointsPerMinute,
    streak: row.streak,
    lastSkillCompletedAt: row.lastSkillCompletedAt?.toISOString() ?? null,
    importance: row.importance,
    sortOrder: row.sortOrder,
  };
}

export interface ListSkillsQuery {
  limit?: number;
  offset?: number;
}

export async function listByUserId(userId: string, query?: ListSkillsQuery): Promise<SkillResponse[]> {
  const limit = query?.limit != null ? Math.min(100, Math.max(1, query.limit)) : 100;
  const offset = Math.max(0, query?.offset ?? 0);
  const rows = await db
    .select()
    .from(skills)
    .where(eq(skills.userId, userId))
    .orderBy(skills.sortOrder, skills.createdAt)
    .limit(limit)
    .offset(offset);
  return rows.map(toResponse);
}

export interface CreateSkillInput {
  name: string;
  icon: string;
  color?: string;
  importance?: string;
}

export async function createCustomSkill(userId: string, input: CreateSkillInput): Promise<SkillResponse> {
  const name = input.name?.trim();
  if (!name || name.length > 100) {
    throw new BadRequestError('Name is required and must be at most 100 characters');
  }
  if (!AVAILABLE_ICONS.includes(input.icon)) {
    throw new BadRequestError(`Invalid icon. Must be one of: ${AVAILABLE_ICONS.join(', ')}`);
  }
  const importance = input.importance && VALID_IMPORTANCE.includes(input.importance as typeof VALID_IMPORTANCE[number])
    ? input.importance
    : null;
  const color = input.color?.trim() || '#6b7280';

  const customSkills = await db
    .select({ externalId: skills.externalId })
    .from(skills)
    .where(and(eq(skills.userId, userId), sql`${skills.externalId} LIKE 'custom-%'`));

  const indices = customSkills
    .map((r) => parseInt(r.externalId.replace(/^custom-/, ''), 10))
    .filter((n) => !Number.isNaN(n));
  const nextIndex = indices.length === 0 ? 0 : Math.max(...indices) + 1;
  const externalId = `custom-${nextIndex}`;

  const [inserted] = await db
    .insert(skills)
    .values({
      userId,
      externalId,
      name,
      isCustom: true,
      color,
      icon: input.icon,
      importance,
      sortOrder: 1000 + nextIndex, // keep custom skills after fixed
    })
    .returning();

  if (!inserted) throw new Error('Insert failed');
  return toResponse(inserted);
}

export interface UpdateSkillInput {
  name?: string;
  icon?: string;
  color?: string;
  importance?: string | null;
}

export async function updateSkill(
  userId: string,
  skillId: string,
  input: UpdateSkillInput
): Promise<SkillResponse> {
  const [existing] = await db
    .select()
    .from(skills)
    .where(eq(skills.id, skillId))
    .limit(1);

  if (!existing) {
    throw new NotFoundError('Skill not found');
  }
  if (existing.userId !== userId) {
    throw new ForbiddenError('Not allowed to update this skill');
  }

  const updates: Partial<typeof skills.$inferInsert> = {};
  if (input.name !== undefined) {
    const name = input.name.trim();
    if (name.length === 0 || name.length > 100) {
      throw new BadRequestError('Name must be 1–100 characters');
    }
    updates.name = name;
  }
  if (input.icon !== undefined) {
    if (!AVAILABLE_ICONS.includes(input.icon)) {
      throw new BadRequestError(`Invalid icon. Must be one of: ${AVAILABLE_ICONS.join(', ')}`);
    }
    updates.icon = input.icon;
  }
  if (input.color !== undefined) {
    updates.color = input.color.trim() || existing.color;
  }
  if (input.importance !== undefined) {
    updates.importance = input.importance && VALID_IMPORTANCE.includes(input.importance as typeof VALID_IMPORTANCE[number])
      ? input.importance
      : null;
  }

  if (Object.keys(updates).length === 0) {
    return toResponse(existing);
  }

  const [updated] = await db
    .update(skills)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(skills.id, skillId))
    .returning();

  if (!updated) throw new Error('Update failed');
  return toResponse(updated);
}

export async function deleteSkill(userId: string, skillId: string): Promise<void> {
  const [existing] = await db
    .select()
    .from(skills)
    .where(eq(skills.id, skillId))
    .limit(1);

  if (!existing) {
    throw new NotFoundError('Skill not found');
  }
  if (existing.userId !== userId) {
    throw new ForbiddenError('Not allowed to delete this skill');
  }
  if (!existing.isCustom) {
    throw new BadRequestError('Cannot delete a default skill');
  }

  await db.delete(skills).where(eq(skills.id, skillId));
}

/** Get a single skill by id; returns null if not found or not owned by user. */
export async function getSkillByIdAndUser(skillId: string, userId: string): Promise<SkillResponse | null> {
  const [row] = await db
    .select()
    .from(skills)
    .where(and(eq(skills.id, skillId), eq(skills.userId, userId)))
    .limit(1);
  return row ? toResponse(row) : null;
}
