/**
 * Server and environment configuration.
 * Required: DATABASE_URL, JWT_SECRET.
 * Optional: PORT, JWT_ACCESS_TTL, JWT_REFRESH_TTL.
 */
function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (key === 'DATABASE_URL' && !value) {
    throw new Error('Missing required env: DATABASE_URL');
  }
  return value ?? '';
}

export const config = {
  port: parseInt(getEnv('PORT', '3001'), 10),
  databaseUrl: getEnv('DATABASE_URL', ''),
  jwt: {
    secret: getEnv('JWT_SECRET', ''),
    accessTtlSec: parseInt(getEnv('JWT_ACCESS_TTL', '900'), 10),   // 15 min
    refreshTtlSec: parseInt(getEnv('JWT_REFRESH_TTL', '604800'), 10), // 7 days
  },
  nodeEnv: getEnv('NODE_ENV', 'development'),
} as const;
