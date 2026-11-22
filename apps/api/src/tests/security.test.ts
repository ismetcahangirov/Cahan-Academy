import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';

// ─── DB mock: every query chain resolves to `state.rows` ─────────────────────
const state = vi.hoisted(() => ({ rows: [] as unknown[] }));

vi.mock('../config/db.js', () => {
  const chain = (): any => {
    const q: any = {
      from: () => q,
      where: () => q,
      leftJoin: () => q,
      orderBy: () => q,
      limit: () => q,
      values: () => q,
      set: () => q,
      returning: () => q,
      then: (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
        Promise.resolve(state.rows).then(resolve, reject),
    };
    return q;
  };
  return {
    db: {
      select: () => chain(),
      insert: () => chain(),
      update: () => chain(),
      delete: () => chain(),
      execute: async () => ({ rows: [] }),
    },
  };
});

vi.mock('../services/email.service.js', () => ({ sendMail: vi.fn().mockResolvedValue(true) }));

const { default: app } = await import('../app.js');
const { generateAccessToken, generateRefreshToken, passwordVersion } = await import('../utils/jwt.js');

const PASSWORD = 'correct horse battery';
const PASSWORD_HASH = bcrypt.hashSync(PASSWORD, 4);
const adminRow = {
  id: 'admin-1',
  email: 'admin@example.az',
  name: 'Admin',
  passwordHash: PASSWORD_HASH,
  isSuperAdmin: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

let ipCounter = 0;
/** Each test gets its own client IP so the in-memory rate limiters do not interfere. */
const freshIp = () => `10.0.0.${++ipCounter}`;

const adminToken = () =>
  generateAccessToken({ sub: 'admin-1', email: 'admin@example.az', role: 'admin', isSuperAdmin: true });

beforeEach(() => {
  state.rows = [];
});

describe('Admin authorisation', () => {
  it('token signed with an empty key (old bug) is rejected on admin routes', async () => {
    const forged = await new jose.SignJWT({ sub: 'x', email: 'x@x.az', role: 'admin', isSuperAdmin: true })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(new Uint8Array(0));

    for (const [method, path] of [
      ['get', '/api/admin/users'],
      ['post', '/api/admin/users'],
      ['get', '/api/leads'],
      ['get', '/api/leads/export'],
      ['get', '/api/contacts'],
      ['get', '/api/newsletter'],
      ['post', '/api/blog'],
      ['post', '/api/courses/admin'],
      ['post', '/api/upload/signature'],
    ] as const) {
      const res = await request(app)[method](path).set('Authorization', `Bearer ${forged}`);
      expect(res.status, `${method} ${path}`).toBe(401);
    }
  });

  it('a refresh token cannot be used as a bearer token', async () => {
    const refresh = await generateRefreshToken({ sub: 'admin-1' });
    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${refresh}`);
    expect(res.status).toBe(401);
  });

  it('non-super-admin cannot create admins', async () => {
    const token = await generateAccessToken({ sub: 'a2', email: 'a2@example.az', role: 'admin', isSuperAdmin: false });
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'X', email: 'x@example.az', password: 'longenough1' });
    expect(res.status).toBe(403);
  });

  it('admin creation validates the body (no 500 on missing password)', async () => {
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${await adminToken()}`)
      .send({ name: 'X', email: 'x@example.az' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('Login / refresh', () => {
  it('rejects non-string credentials with 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('X-Forwarded-For', freshIp())
      .send({ email: { $ne: '' }, password: 'x' });
    expect(res.status).toBe(400);
  });

  it('wrong password → 401, unknown email → 401 (same message)', async () => {
    state.rows = [adminRow];
    const wrong = await request(app)
      .post('/api/auth/login')
      .set('X-Forwarded-For', freshIp())
      .send({ email: adminRow.email, password: 'nope' });
    state.rows = [];
    const unknown = await request(app)
      .post('/api/auth/login')
      .set('X-Forwarded-For', freshIp())
      .send({ email: 'ghost@example.az', password: 'nope' });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body.message).toBe(unknown.body.message);
  });

  it('success sets an HttpOnly cookie and never returns the refresh token in JSON', async () => {
    state.rows = [adminRow];
    const res = await request(app)
      .post('/api/auth/login')
      .set('X-Forwarded-For', freshIp())
      .send({ email: adminRow.email, password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTypeOf('string');
    expect(res.body.data.refreshToken).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain('passwordHash');

    const cookie = String(res.headers['set-cookie']);
    expect(cookie).toMatch(/refreshToken=/);
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/Secure/);
    expect(cookie).toMatch(/SameSite=None/);
  });

  it('refresh ignores a token sent in the JSON body', async () => {
    const token = await generateRefreshToken({ sub: 'admin-1', pwv: passwordVersion(PASSWORD_HASH) });
    state.rows = [adminRow];
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('X-Forwarded-For', freshIp())
      .send({ refreshToken: token });
    expect(res.status).toBe(401);
  });

  it('refresh works with the cookie and is revoked by a password change', async () => {
    const token = await generateRefreshToken({ sub: 'admin-1', pwv: passwordVersion(PASSWORD_HASH) });
    state.rows = [adminRow];
    const ok = await request(app)
      .post('/api/auth/refresh')
      .set('X-Forwarded-For', freshIp())
      .set('Cookie', `refreshToken=${token}`);
    expect(ok.status).toBe(200);
    expect(ok.body.data.refreshToken).toBeUndefined();

    // Same token after the password hash changed → rejected.
    state.rows = [{ ...adminRow, passwordHash: bcrypt.hashSync('a new password', 4) }];
    const revoked = await request(app)
      .post('/api/auth/refresh')
      .set('X-Forwarded-For', freshIp())
      .set('Cookie', `refreshToken=${token}`);
    expect(revoked.status).toBe(401);
  });

  it('login is rate limited per client IP (JSON 429)', async () => {
    const ip = freshIp();
    let last = 0;
    for (let i = 0; i < 11; i++) {
      const res = await request(app)
        .post('/api/auth/login')
        .set('X-Forwarded-For', ip)
        .send({ email: 'ghost@example.az', password: 'nope' });
      last = res.status;
      if (i < 10) expect(res.status).toBe(401);
      else expect(res.body).toMatchObject({ success: false });
    }
    expect(last).toBe(429);

    // Another visitor is not affected by the first one's bucket.
    const other = await request(app)
      .post('/api/auth/login')
      .set('X-Forwarded-For', freshIp())
      .send({ email: 'ghost@example.az', password: 'nope' });
    expect(other.status).toBe(401);
  }, 30_000); // 12 bcrypt(12) comparisons against the timing-equaliser hash
});

describe('Error handling & input validation', () => {
  it('unknown routes answer with JSON 404', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false });
  });

  it('malformed JSON is a 400, not a 500', async () => {
    const res = await request(app)
      .post('/api/contacts')
      .set('X-Forwarded-For', freshIp())
      .set('Content-Type', 'application/json')
      .send('{"name":');
    expect(res.status).toBe(400);
  });

  it('zod errors in admin routes are 400 (used to be 500)', async () => {
    const res = await request(app)
      .post('/api/categories/admin')
      .set('Authorization', `Bearer ${await adminToken()}`)
      .send({ nameAz: '' });
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('VALIDATION_ERROR');
  });

  it('lead status must be one of the enum values', async () => {
    const res = await request(app)
      .patch('/api/leads/abc/status')
      .set('Authorization', `Bearer ${await adminToken()}`)
      .send({ status: 'hacked' });
    expect(res.status).toBe(400);
  });

  it('public contact form rejects oversized input with 400', async () => {
    const res = await request(app)
      .post('/api/contacts')
      .set('X-Forwarded-For', freshIp())
      .send({ name: 'Ali', email: 'ali@example.az', subject: 'Sual', message: 'x'.repeat(6000) });
    expect(res.status).toBe(400);
  });

  it('public contact form does not echo the stored row', async () => {
    state.rows = [{ id: 'm1', name: 'Ali', email: 'ali@example.az', isRead: 'false' }];
    const res = await request(app)
      .post('/api/contacts')
      .set('X-Forwarded-For', freshIp())
      .send({ name: 'Ali', email: 'ali@example.az', subject: 'Sual', message: 'Salam, kurs haqqında sual' });
    expect(res.status).toBe(201);
    expect(res.body.data).toEqual({ id: 'm1' });
  });

  it('the legacy disk upload endpoint is gone', async () => {
    const res = await request(app).post('/api/upload').set('Authorization', `Bearer ${await adminToken()}`);
    expect(res.status).toBe(404);
  });

  it('Cloudinary signature refuses arbitrary params', async () => {
    const res = await request(app)
      .post('/api/upload/signature')
      .set('Authorization', `Bearer ${await adminToken()}`)
      .send({ timestamp: Math.floor(Date.now() / 1000), overwrite: true, public_id: 'logo' });
    expect(res.status).toBe(400);
  });

  it('leads CSV export is escaped', async () => {
    state.rows = [
      {
        id: 'l1', name: '=cmd|"/c calc"!A1', email: 'a@b.az', phone: '+994', course: 'X',
        status: 'new', source: 'website', createdAt: new Date('2026-01-01T00:00:00Z'),
      },
    ];
    const res = await request(app).get('/api/leads/export').set('Authorization', `Bearer ${await adminToken()}`);
    expect(res.status).toBe(200);
    expect(res.text).toContain(`"'=cmd|""/c calc""!A1"`);
    expect(res.text).toContain(`"'+994"`);
  });
});
