import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { generateAccessToken } from '../utils/jwt.js';

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
    
    // Qeyd: stats controller DB-yə bağlana bilər, lakin biz burada 
    // middleware-in next() çağırdığını və 200 (və ya başqa uğurlu status) 
    // qaytardığını yoxlayırıq.
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
