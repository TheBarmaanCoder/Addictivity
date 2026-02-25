import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { config } from './config.js';
import { routes } from './routes/index.js';
import { AppError } from './lib/errors.js';
import * as authService from './services/auth.service.js';

async function build() {
  if (!config.jwt.secret && config.nodeEnv === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }

  const app = Fastify({
    logger: {
      level: config.nodeEnv === 'production' ? 'info' : 'debug',
      serializers: {
        req: (req) => ({ method: req.method, url: req.url }),
        res: (res) => ({ statusCode: res.statusCode }),
      },
    },
  });

  await app.register(cors, {
    origin: config.nodeEnv === 'production'
      ? (config.cors?.allowedOrigins ?? ['https://addictivity.app'])
      : true,
    credentials: true,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  app.get('/health', (_, reply) => reply.send({ status: 'ok' }));

  await app.register(routes);

  app.setErrorHandler((err: unknown, request, reply) => {
    if (err instanceof AppError) {
      return reply.status(err.statusCode).send({
        error: err.message,
        code: err.code,
      });
    }
    request.log.error(err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return reply.status(500).send({
      error: config.nodeEnv === 'production' ? 'Internal server error' : message,
    });
  });

  return app;
}

async function main() {
  const app = await build();

  authService.cleanupExpiredRefreshTokens().then((n) => {
    if (n > 0) app.log.info({ expiredTokensDeleted: n }, 'Cleaned up expired refresh tokens');
  });

  setInterval(() => {
    authService.cleanupExpiredRefreshTokens().catch((err) => app.log.error(err, 'Refresh token cleanup failed'));
  }, 60 * 60 * 1000);

  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
