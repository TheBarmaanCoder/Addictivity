import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { z } from 'zod';
import * as authService from '../services/auth.service.js';
import { AppError } from '../lib/errors.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(200),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});

const logoutSchema = z.object({
  refresh_token: z.string().min(1),
});

export async function authRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions): Promise<void> {
  await fastify.register(rateLimit, {
    max: 10,
    timeWindow: '1 minute',
  });

  fastify.post<{
    Body: z.infer<typeof registerSchema>;
  }>('/register', async (request, reply) => {
    const body = registerSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Validation failed', details: body.error.flatten() });
    }
    const result = await authService.register(body.data);
    return reply.status(201).send(result);
  });

  fastify.post<{
    Body: z.infer<typeof loginSchema>;
  }>('/login', async (request, reply) => {
    const body = loginSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Validation failed', details: body.error.flatten() });
    }
    const result = await authService.login(body.data.email, body.data.password);
    return reply.status(200).send(result);
  });

  fastify.post<{
    Body: z.infer<typeof refreshSchema>;
  }>('/refresh', async (request, reply) => {
    const body = refreshSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Validation failed', details: body.error.flatten() });
    }
    const result = await authService.refresh(body.data.refresh_token);
    return reply.status(200).send(result);
  });

  fastify.post<{
    Body: z.infer<typeof logoutSchema>;
  }>('/logout', async (request, reply) => {
    const body = logoutSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Validation failed', details: body.error.flatten() });
    }
    await authService.logout(body.data.refresh_token);
    return reply.status(204).send();
  });
}
