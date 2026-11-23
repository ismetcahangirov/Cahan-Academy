import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

const TOKEN = 'lms-service-token-for-tests-0123456789abcdef';
const state = vi.hoisted(() => {
  process.env.CATEGORY_SERVICE_TOKEN = 'lms-service-token-for-tests-0123456789abcdef';
  return { queue: [] as unknown[] };
});

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
        (() => {
          const next = state.queue.shift() ?? [];
          return next instanceof Error ? Promise.reject(next) : Promise.resolve(next);
        })().then(resolve, reject),
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

const category = { id: 'c1', nameAz: 'Dizayn', nameEn: 'Design', nameRu: 'Дизайн', slug: 'design' };
const body = { nameAz: 'Dizayn', nameEn: 'Design', nameRu: 'Дизайн', slug: 'design' };

describe('category admin routes: LMS service token', () => {
  beforeEach(() => {
    state.queue = [];
  });

  it('creates a category with the right service token', async () => {
    state.queue.push([category]);
    const res = await request(app).post('/api/categories/admin').set('X-Service-Token', TOKEN).send(body);
    expect(res.status).toBe(201);
    expect(res.body.data.slug).toBe('design');
  });

  it('rejects a wrong service token without trying the JWT', async () => {
    const res = await request(app)
      .post('/api/categories/admin')
      .set('X-Service-Token', 'x'.repeat(TOKEN.length))
      .set('Authorization', 'Bearer whatever')
      .send(body);
    expect(res.status).toBe(401);
  });

  it('still requires a JWT without the header', async () => {
    const res = await request(app).post('/api/categories/admin').send(body);
    expect(res.status).toBe(401);
  });

  it('answers 409 for a slug that is already taken', async () => {
    state.queue.push(Object.assign(new Error('duplicate key'), { code: '23505' }));
    const res = await request(app).post('/api/categories/admin').set('X-Service-Token', TOKEN).send(body);
    expect(res.status).toBe(409);
  });

  it('refuses to delete a category that still has courses', async () => {
    state.queue.push([category], [{ id: 'course-1' }]);
    const res = await request(app).delete('/api/categories/admin/c1').set('X-Service-Token', TOKEN);
    expect(res.status).toBe(409);
  });

  it('deletes an unused category', async () => {
    state.queue.push([category], [], [category]);
    const res = await request(app).delete('/api/categories/admin/c1').set('X-Service-Token', TOKEN);
    expect(res.status).toBe(200);
  });
});
