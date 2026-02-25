import type { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken } from '../lib/jwt.js';
import { getUserById } from '../services/auth.service.js';
import { UnauthorizedError } from '../lib/errors.js';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

/**
 * Fastify preHandler: require valid Bearer token and set request.user.
 * Use on routes that require authentication.
 */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid Authorization header');
  }
  const token = authHeader.slice(7);
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
  const user = await getUserById(payload.sub);
  if (!user) {
    throw new UnauthorizedError('User not found');
  }
  request.user = user;
}
