import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { requireAuth } from '../middleware/auth.middleware.js';
import * as milestoneService from '../services/milestone.service.js';

export async function milestonesRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions): Promise<void> {
  fastify.addHook('preHandler', requireAuth);

  fastify.get('/', async (request, reply) => {
    const list = await milestoneService.listMilestonesForUser(request.user!.id);
    return reply.status(200).send(list);
  });
}
