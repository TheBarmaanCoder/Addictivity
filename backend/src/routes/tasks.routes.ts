import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware.js';
import * as taskService from '../services/task.service.js';

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  skillId: z.string().uuid(),
  dueDate: z.string().nullable().optional(),
  recurrence: z
    .object({
      value: z.number().int().positive(),
      unit: z.enum(['Days', 'Weeks', 'Months']),
    })
    .nullable()
    .optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  dueDate: z.string().nullable().optional(),
  recurrence: z
    .object({
      value: z.number().int().positive(),
      unit: z.enum(['Days', 'Weeks', 'Months']),
    })
    .nullable()
    .optional(),
});

const completeTaskSchema = z.object({
  minutes_spent: z.number().int().min(1),
  intensity_multiplier: z.number().min(0.6).max(1.4).optional(),
});

export async function tasksRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions): Promise<void> {
  fastify.addHook('preHandler', requireAuth);

  fastify.get<{
    Querystring: { due_date?: string; completed?: string; limit?: string; offset?: string };
  }>('/', async (request, reply) => {
    const dueDate = request.query.due_date;
    const completed =
      request.query.completed === 'true' ? true : request.query.completed === 'false' ? false : undefined;
    const limit = request.query.limit ? parseInt(request.query.limit, 10) : undefined;
    const offset = request.query.offset ? parseInt(request.query.offset, 10) : undefined;
    const list = await taskService.listByUserId(request.user!.id, { dueDate, completed, limit, offset });
    return reply.status(200).send(list);
  });

  fastify.post<{
    Body: z.infer<typeof createTaskSchema>;
  }>('/', async (request, reply) => {
    const body = createTaskSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Validation failed', details: body.error.flatten() });
    }
    const task = await taskService.createTask(request.user!.id, {
      title: body.data.title,
      skillId: body.data.skillId,
      dueDate: body.data.dueDate ?? undefined,
      recurrence: body.data.recurrence ?? undefined,
    });
    return reply.status(201).send(task);
  });

  fastify.patch<{
    Params: { id: string };
    Body: z.infer<typeof updateTaskSchema>;
  }>('/:id', async (request, reply) => {
    const body = updateTaskSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Validation failed', details: body.error.flatten() });
    }
    const task = await taskService.updateTask(request.user!.id, request.params.id, body.data);
    return reply.status(200).send(task);
  });

  fastify.delete<{
    Params: { id: string };
  }>('/:id', async (request, reply) => {
    await taskService.deleteTask(request.user!.id, request.params.id);
    return reply.status(204).send();
  });

  fastify.post<{
    Params: { id: string };
    Body: z.infer<typeof completeTaskSchema>;
  }>('/:id/complete', async (request, reply) => {
    const body = completeTaskSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Validation failed', details: body.error.flatten() });
    }
    const result = await taskService.completeTask(request.user!.id, request.params.id, {
      minutesSpent: body.data.minutes_spent,
      intensityMultiplier: body.data.intensity_multiplier,
    });
    return reply.status(200).send(result);
  });
}
