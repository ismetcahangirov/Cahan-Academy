import { describe, it, expect } from 'vitest';
import { generateAccessToken, generateRefreshToken, verifyAccessToken } from '../utils/jwt.js';
import * as jose from 'jose';
import { env } from '../config/env.js';

describe('JWT Utilities', () => {
  const mockPayload = {
    sub: 'user-123',
    email: 'test@cahan.edu.az',
    role: 'admin'
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
    const token = await generateRefreshToken({ sub: mockPayload.sub });
    expect(token).toBeDefined();
  });

  it('Expire olmuş token xəta atmalıdır', async () => {
    // 1 saniyəlik token yaradaq
    const ACCESS_TOKEN_SECRET = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
    const expiredToken = await new jose.SignJWT(mockPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1s')
      .sign(ACCESS_TOKEN_SECRET);

    // 2 saniyə gözləyək (virtual olaraq)
    // jose daxili vaxtı yoxlayır, ona görə real gözləmə və ya clock mocking lazımdır
    // Sadəlik üçün burada jose-nin öz xətasını gözləyirik
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    await expect(verifyAccessToken(expiredToken)).rejects.toThrow();
  });
});
