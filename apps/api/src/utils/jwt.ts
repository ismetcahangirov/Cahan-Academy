import * as jose from 'jose';
import { env } from '../config/env.js';

const ACCESS_TOKEN_SECRET = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
const REFRESH_TOKEN_SECRET = new TextEncoder().encode(env.JWT_REFRESH_SECRET);

export const generateAccessToken = async (payload: { sub: string; email: string; role: string }) => {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(ACCESS_TOKEN_SECRET);
};

export const generateRefreshToken = async (payload: { sub: string }) => {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.JWT_REFRESH_EXPIRES_IN)
    .sign(REFRESH_TOKEN_SECRET);
};

export const verifyAccessToken = async (token: string) => {
  return await jose.jwtVerify(token, ACCESS_TOKEN_SECRET);
};

export const verifyRefreshToken = async (token: string) => {
  return await jose.jwtVerify(token, REFRESH_TOKEN_SECRET);
};
