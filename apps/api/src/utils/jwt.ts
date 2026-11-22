import * as jose from 'jose';
import { createHash } from 'crypto';
import { env } from '../config/env.js';

// Access tokens are signed with JWT_SECRET, refresh tokens with JWT_REFRESH_SECRET.
// Both are validated by the env schema (min 32 chars). The guard below makes sure an
// empty/short key can never be used again (an undefined env key used to encode to an
// empty HMAC key, which let anyone forge admin tokens).
const ACCESS_TOKEN_SECRET = new TextEncoder().encode(env.JWT_SECRET);
const REFRESH_TOKEN_SECRET = new TextEncoder().encode(env.JWT_REFRESH_SECRET);

if (ACCESS_TOKEN_SECRET.length < 32 || REFRESH_TOKEN_SECRET.length < 32) {
  throw new Error('JWT secrets must be at least 32 bytes long');
}

const ALGORITHMS = ['HS256'];
const ISSUER = 'cahan-academy-api';
const ACCESS_AUDIENCE = 'cahan-academy:access';
const REFRESH_AUDIENCE = 'cahan-academy:refresh';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
  isSuperAdmin?: boolean;
}

export interface RefreshTokenPayload {
  sub: string;
  /** Fingerprint of the password hash: changing the password invalidates every refresh token. */
  pwv?: string;
}

/** Short, non-reversible fingerprint of a bcrypt hash, embedded in refresh tokens. */
export const passwordVersion = (passwordHash: string) =>
  createHash('sha256').update(passwordHash).digest('base64url').slice(0, 16);

export const generateAccessToken = async (payload: AccessTokenPayload) => {
  return await new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(ACCESS_AUDIENCE)
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(ACCESS_TOKEN_SECRET);
};

export const generateRefreshToken = async (payload: RefreshTokenPayload) => {
  return await new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(REFRESH_AUDIENCE)
    .setExpirationTime(env.JWT_REFRESH_EXPIRES_IN)
    .sign(REFRESH_TOKEN_SECRET);
};

export const verifyAccessToken = async (token: string) => {
  return await jose.jwtVerify(token, ACCESS_TOKEN_SECRET, {
    algorithms: ALGORITHMS,
    issuer: ISSUER,
    audience: ACCESS_AUDIENCE,
  });
};

export const verifyRefreshToken = async (token: string) => {
  return await jose.jwtVerify(token, REFRESH_TOKEN_SECRET, {
    algorithms: ALGORITHMS,
    issuer: ISSUER,
    audience: REFRESH_AUDIENCE,
  });
};
