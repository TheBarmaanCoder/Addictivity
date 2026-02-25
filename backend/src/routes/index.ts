import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { authRoutes } from './auth.routes.js';
import { skillsRoutes } from './skills.routes.js';
import { tasksRoutes } from './tasks.routes.js';

const API_PREFIX = '/api/v1';

export async function routes(fastify: FastifyInstance, _opts: FastifyPluginOptions): Promise<void> {
  await fastify.register(authRoutes, { prefix: `${API_PREFIX}/auth` });
  await fastify.register(skillsRoutes, { prefix: `${API_PREFIX}/skills` });
  await fastify.register(tasksRoutes, { prefix: `${API_PREFIX}/tasks` });
}
