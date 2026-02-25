import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export interface AccessPayload {
  sub: string;   // user id (uuid)
  type: 'access';
  iat?: number;
  exp?: number;
}

export interface RefreshPayload {
  sub: string;
  jti: string;  // token id for revoke
  type: 'refresh';
  iat?: number;
  exp?: number;
}

function getSecret(): string {
  if (!config.jwt.secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return config.jwt.secret;
}

export function signAccessToken(userId: string): string {
  return jwt.sign(
    { sub: userId, type: 'access' } as AccessPayload,
    getSecret(),
    { expiresIn: config.jwt.accessTtlSec }
  );
}

export function signRefreshToken(userId: string, jti: string): string {
  return jwt.sign(
    { sub: userId, jti, type: 'refresh' } as RefreshPayload,
    getSecret(),
    { expiresIn: config.jwt.refreshTtlSec }
  );
}

export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, getSecret()) as AccessPayload;
  if (decoded.type !== 'access') throw new Error('Invalid token type');
  return decoded;
}

export function verifyRefreshToken(token: string): RefreshPayload {
  const decoded = jwt.verify(token, getSecret()) as RefreshPayload;
  if (decoded.type !== 'refresh') throw new Error('Invalid token type');
  return decoded;
}

export function getRefreshTokenExpiry(): Date {
  const d = new Date();
  d.setSeconds(d.getSeconds() + config.jwt.refreshTtlSec);
  return d;
}
