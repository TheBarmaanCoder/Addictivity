import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware.js';
import * as profileService from '../services/profile.service.js';

const patchProfileSchema = z.object({
  user_name: z.string().min(1).max(200).optional(),
  theme_id: z.string().min(1).max(50).optional(),
  current_title: z.string().min(1).max(100).optional(),
  selected_park_item_ids: z.array(z.string()).optional(),
  onboarding_completed: z.boolean().optional(),
});

export async function profileRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions): Promise<void> {
  fastify.addHook('preHandler', requireAuth);

  fastify.get('/', async (request, reply) => {
    const profile = await profileService.getProfileByUserId(request.user!.id);
    if (!profile) {
      return reply.status(404).send({ error: 'Profile not found' });
    }
    return reply.status(200).send(profile);
  });

  fastify.patch<{
    Body: z.infer<typeof patchProfileSchema>;
  }>('/', async (request, reply) => {
    const body = patchProfileSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Validation failed', details: body.error.flatten() });
    }
    const input = {
      userName: body.data.user_name,
      themeId: body.data.theme_id,
      currentTitle: body.data.current_title,
      selectedParkItemIds: body.data.selected_park_item_ids,
      onboardingCompleted: body.data.onboarding_completed,
    };
    const profile = await profileService.patchProfile(request.user!.id, input);
    return reply.status(200).send(profile);
  });
}
