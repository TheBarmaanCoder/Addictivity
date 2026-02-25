import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { authRoutes } from './auth.routes.js';
import { appStateRoutes } from './app-state.routes.js';
import { milestonesRoutes } from './milestones.routes.js';
import { profileRoutes } from './profile.routes.js';
import { shopRoutes } from './shop.routes.js';
import { skillsRoutes } from './skills.routes.js';
import { tasksRoutes } from './tasks.routes.js';

const API_PREFIX = '/api/v1';

export async function routes(fastify: FastifyInstance, _opts: FastifyPluginOptions): Promise<void> {
  await fastify.register(authRoutes, { prefix: `${API_PREFIX}/auth` });
  await fastify.register(appStateRoutes, { prefix: `${API_PREFIX}/app/state` });
  await fastify.register(milestonesRoutes, { prefix: `${API_PREFIX}/milestones` });
  await fastify.register(profileRoutes, { prefix: `${API_PREFIX}/profile` });
  await fastify.register(shopRoutes, { prefix: `${API_PREFIX}/shop` });
  await fastify.register(skillsRoutes, { prefix: `${API_PREFIX}/skills` });
  await fastify.register(tasksRoutes, { prefix: `${API_PREFIX}/tasks` });
}
