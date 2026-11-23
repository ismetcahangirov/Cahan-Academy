import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

const state = vi.hoisted(() => ({ queue: [] as unknown[] }));

vi.mock('../config/db.js', () => {
  const chain = (): any => {
    const q: any = {
      from: () => q,
      where: () => q,
      orderBy: () => q,
      limit: () => q,
      values: () => q,
      set: () => q,
      onConflictDoUpdate: () => q,
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
const { generateAccessToken } = await import('../utils/jwt.js');
const { DEFAULT_CONTACT } = await import('../config/siteDefaults.js');

const adminAuth = async () => {
  const token = await generateAccessToken({ id: 'a1', email: 'admin@example.com', role: 'admin' } as never);
  return { Authorization: `Bearer ${token}` };
};

const contact = {
  phone: '+994 12 345 67 89',
  email: 'hello@example.az',
  address: { az: 'Bakı', en: 'Baku', ru: 'Баку' },
  hours: { az: 'Hər gün', en: 'Every day', ru: 'Каждый день' },
  social: { instagram: 'https://instagram.com/x', facebook: '', youtube: '' },
};

describe('site settings: contact', () => {
  beforeEach(() => {
    state.queue = [];
  });

  it('serves the defaults while nothing is saved', async () => {
    state.queue.push([]);
    const res = await request(app).get('/api/settings/contact');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(DEFAULT_CONTACT);
  });

  it('serves the defaults when the table does not exist yet', async () => {
    state.queue.push(Object.assign(new Error('relation does not exist'), { code: '42P01' }));
    const res = await request(app).get('/api/settings/contact');
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(DEFAULT_CONTACT.email);
  });

  it('merges a stored value over the defaults', async () => {
    state.queue.push([{ key: 'contact', value: { phone: '+994 55 555 55 55' } }]);
    const res = await request(app).get('/api/settings/contact');
    expect(res.body.data.phone).toBe('+994 55 555 55 55');
    expect(res.body.data.address).toEqual(DEFAULT_CONTACT.address);
  });

  it('requires an admin to save', async () => {
    const res = await request(app).put('/api/settings/admin/contact').send(contact);
    expect(res.status).toBe(401);
  });

  it('saves valid details', async () => {
    state.queue.push([{ key: 'contact', value: contact }]);
    const res = await request(app).put('/api/settings/admin/contact').set(await adminAuth()).send(contact);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('hello@example.az');
  });

  it('rejects a bad e-mail and a non-https social link', async () => {
    const auth = await adminAuth();
    const badEmail = await request(app).put('/api/settings/admin/contact').set(auth).send({ ...contact, email: 'nope' });
    expect(badEmail.status).toBe(400);
    const badLink = await request(app)
      .put('/api/settings/admin/contact')
      .set(auth)
      .send({ ...contact, social: { ...contact.social, facebook: 'javascript:alert(1)' } });
    expect(badLink.status).toBe(400);
  });
});

describe('testimonials', () => {
  beforeEach(() => {
    state.queue = [];
  });

  const review = { name: 'Aysel M.', role: 'Developer', text: 'Çox faydalı kurs idi, tövsiyə edirəm.', rating: 5, order: 1, isActive: true };

  it('lists the visible testimonials publicly', async () => {
    state.queue.push([{ id: 't1', ...review }]);
    const res = await request(app).get('/api/testimonials');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('returns an empty list before the table exists', async () => {
    state.queue.push(Object.assign(new Error('relation does not exist'), { code: '42P01' }));
    const res = await request(app).get('/api/testimonials');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('protects the admin routes', async () => {
    expect((await request(app).get('/api/testimonials/admin/all')).status).toBe(401);
    expect((await request(app).post('/api/testimonials/admin').send(review)).status).toBe(401);
  });

  it('creates, validates and 404s', async () => {
    const auth = await adminAuth();
    state.queue.push([{ id: 't1', ...review }]);
    expect((await request(app).post('/api/testimonials/admin').set(auth).send(review)).status).toBe(201);
    expect((await request(app).post('/api/testimonials/admin').set(auth).send({ ...review, rating: 9 })).status).toBe(400);
    state.queue.push([]);
    expect((await request(app).delete('/api/testimonials/admin/missing').set(auth)).status).toBe(404);
  });
});
