import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { generateAccessToken } from '../utils/jwt.js';

// DB mock - real bağlantı olmadan testlər işləsin
vi.mock('../config/db.js', () => ({
  db: {
    execute: vi.fn().mockResolvedValue({ rows: [] }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockResolvedValue([{ value: 0 }]),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([]),
    }),
  },
}));

describe('Auth Middleware & Admin Routes', () => {
  it('Token olmadan /api/admin/stats 401 qaytarmalıdır', async () => {
    const response = await request(app).get('/api/admin/stats');
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Missing token');
  });

  it('Yanlış token ilə /api/admin/stats 401 qaytarmalıdır', async () => {
    const response = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', 'Bearer invalid-token');
    
    expect(response.status).toBe(401);
    expect(response.body.message).toContain('Invalid or expired token');
  });

  it('Düzgün token ilə /api/admin/stats 200 qaytarmalıdır', async () => {
    const token = await generateAccessToken({
      sub: 'test-admin-id',
      email: 'admin@cahan.edu.az',
      role: 'admin'
    });

    const response = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
