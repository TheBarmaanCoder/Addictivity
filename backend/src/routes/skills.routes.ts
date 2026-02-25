import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware.js';
import * as skillService from '../services/skill.service.js';

const createSkillSchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string().min(1),
  color: z.string().max(20).optional(),
  importance: z.enum(['casual', 'important', 'core']).optional(),
});

const updateSkillSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  icon: z.string().min(1).optional(),
  color: z.string().max(20).optional(),
  importance: z.enum(['casual', 'important', 'core']).nullable().optional(),
});

export async function skillsRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions): Promise<void> {
  fastify.addHook('preHandler', requireAuth);

  fastify.get<{
    Querystring: { limit?: string; offset?: string };
  }>('/', async (request, reply) => {
    const user = request.user!;
    const limit = request.query.limit ? parseInt(request.query.limit, 10) : undefined;
    const offset = request.query.offset ? parseInt(request.query.offset, 10) : undefined;
    const list = await skillService.listByUserId(user.id, { limit, offset });
    return reply.status(200).send(list);
  });

  fastify.post<{
    Body: z.infer<typeof createSkillSchema>;
  }>('/', async (request, reply) => {
    const body = createSkillSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Validation failed', details: body.error.flatten() });
    }
    const skill = await skillService.createCustomSkill(request.user!.id, body.data);
    return reply.status(201).send(skill);
  });

  fastify.delete<{
    Params: { id: string };
  }>('/:id', async (request, reply) => {
    await skillService.deleteSkill(request.user!.id, request.params.id);
    return reply.status(204).send();
  });

  fastify.patch<{
    Params: { id: string };
    Body: z.infer<typeof updateSkillSchema>;
  }>('/:id', async (request, reply) => {
    const body = updateSkillSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Validation failed', details: body.error.flatten() });
    }
    const skill = await skillService.updateSkill(request.user!.id, request.params.id, body.data);
    return reply.status(200).send(skill);
  });
}
