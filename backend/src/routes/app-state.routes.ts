import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { requireAuth } from '../middleware/auth.middleware.js';
import * as appStateService from '../services/app-state.service.js';

export async function appStateRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions): Promise<void> {
  fastify.addHook('preHandler', requireAuth);

  fastify.get('/', async (request, reply) => {
    const state = await appStateService.getAppState(request.user!.id);
    return reply.status(200).send(state);
  });
}
