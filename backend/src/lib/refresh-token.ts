import { createHash } from 'crypto';

/**
 * Hash a refresh token for storage and lookup. We never store the raw token.
 */
export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
