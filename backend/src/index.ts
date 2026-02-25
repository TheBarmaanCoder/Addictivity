import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config.js';
import { routes } from './routes/index.js';
import { AppError } from './lib/errors.js';

async function build() {
  if (!config.jwt.secret && config.nodeEnv === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }

  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: true,
    credentials: true,
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
  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
