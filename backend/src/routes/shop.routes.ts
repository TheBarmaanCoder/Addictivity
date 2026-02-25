import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware.js';
import * as shopService from '../services/shop.service.js';

const purchaseSchema = z.object({
  item_id: z.string().min(1),
});

export async function shopRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions): Promise<void> {
  fastify.get('/items', async (_request, reply) => {
    const items = shopService.listShopItems();
    return reply.status(200).send(items);
  });

  fastify.post<{
    Body: z.infer<typeof purchaseSchema>;
  }>('/purchase', {
    preHandler: requireAuth,
  }, async (request, reply) => {
    const body = purchaseSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Validation failed', details: body.error.flatten() });
    }
    const result = await shopService.purchaseItem(request.user!.id, body.data.item_id);
    return reply.status(200).send(result);
  });
}
