import * as jose from 'jose';
import { env } from '../config/env.js';

// Access tokens are signed with JWT_SECRET (validated by the env schema, min 32 chars).
// The previous code read env.JWT_ACCESS_SECRET, which is not in the schema: it was undefined,
// encoded to an empty HMAC key, and anyone could forge an admin token.
const ACCESS_TOKEN_SECRET = new TextEncoder().encode(env.JWT_SECRET);
const REFRESH_TOKEN_SECRET = new TextEncoder().encode(env.JWT_REFRESH_SECRET);

if (ACCESS_TOKEN_SECRET.length < 32 || REFRESH_TOKEN_SECRET.length < 32) {
  throw new Error('JWT secrets must be at least 32 bytes long');
}

const ALGORITHMS = ['HS256'];
const ISSUER = 'cahan-academy-api';
const ACCESS_AUDIENCE = 'cahan-academy:access';
const REFRESH_AUDIENCE = 'cahan-academy:refresh';

export const generateAccessToken = async (payload: { sub: string; email: string; role: string }) => {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(ACCESS_AUDIENCE)
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(ACCESS_TOKEN_SECRET);
};

export const generateRefreshToken = async (payload: { sub: string }) => {
  return await new jose.SignJWT(payload)
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
