import { describe, it, expect } from 'vitest';
import * as jose from 'jose';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  passwordVersion,
} from '../utils/jwt.js';
import { env } from '../config/env.js';

describe('JWT Utilities', () => {
  const mockPayload = {
    sub: 'user-123',
    email: 'test@cahan.edu.az',
    role: 'admin',
  };

  it('generateAccessToken() düzgün payload qaytarmalıdır', async () => {
    const token = await generateAccessToken(mockPayload);
    expect(token).toBeDefined();

    const { payload } = await verifyAccessToken(token);
    expect(payload.sub).toBe(mockPayload.sub);
    expect(payload.email).toBe(mockPayload.email);
    expect(payload.role).toBe(mockPayload.role);
  });

  it('generateRefreshToken() düzgün sub qaytarmalıdır', async () => {
    const token = await generateRefreshToken({ sub: mockPayload.sub, pwv: 'abc' });
    const { payload } = await verifyRefreshToken(token);
    expect(payload.sub).toBe(mockPayload.sub);
    expect(payload.pwv).toBe('abc');
  });

  it('Expire olmuş token xəta atmalıdır', async () => {
    const now = Math.floor(Date.now() / 1000);
    const expiredToken = await new jose.SignJWT(mockPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(now - 120)
      .setIssuer('cahan-academy-api')
      .setAudience('cahan-academy:access')
      .setExpirationTime(now - 60)
      .sign(new TextEncoder().encode(env.JWT_SECRET));

    await expect(verifyAccessToken(expiredToken)).rejects.toThrow();
  });

  it('boş açarla imzalanmış (saxta) token rədd edilməlidir', async () => {
    // Regression: env.JWT_ACCESS_SECRET did not exist in the env schema, so access tokens were
    // signed with an EMPTY HMAC key and anyone could mint a super-admin token.
    const forged = await new jose.SignJWT({ ...mockPayload, isSuperAdmin: true })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer('cahan-academy-api')
      .setAudience('cahan-academy:access')
      .setExpirationTime('1h')
      .sign(new Uint8Array(0));

    await expect(verifyAccessToken(forged)).rejects.toThrow();
  });

  it('refresh token access token kimi qəbul edilməməlidir (və əksinə)', async () => {
    const refresh = await generateRefreshToken({ sub: 'user-123' });
    const access = await generateAccessToken(mockPayload);
    await expect(verifyAccessToken(refresh)).rejects.toThrow();
    await expect(verifyRefreshToken(access)).rejects.toThrow();
  });

  it('alg=none token rədd edilməlidir', async () => {
    const unsecured = new jose.UnsecuredJWT({ ...mockPayload })
      .setIssuer('cahan-academy-api')
      .setAudience('cahan-academy:access')
      .setExpirationTime('1h')
      .encode();
    await expect(verifyAccessToken(unsecured)).rejects.toThrow();
  });

  it('passwordVersion() şifrə hash-i dəyişəndə dəyişməlidir', () => {
    expect(passwordVersion('hash-a')).not.toBe(passwordVersion('hash-b'));
    expect(passwordVersion('hash-a')).toBe(passwordVersion('hash-a'));
    expect(passwordVersion('hash-a')).toHaveLength(16);
  });
});
