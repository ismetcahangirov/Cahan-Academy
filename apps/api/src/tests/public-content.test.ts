import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('../config/db.js', () => ({ db: {} }));

const posts = vi.hoisted(() => ({
  getAllPosts: vi.fn(),
  getPostBySlug: vi.fn(),
  createPost: vi.fn(),
  updatePost: vi.fn(),
  deletePost: vi.fn(),
  getPostById: vi.fn(),
}));
vi.mock('../repositories/post.repository.js', () => posts);

const teachers = vi.hoisted(() => ({
  getAllTeachers: vi.fn(),
  getTeacherById: vi.fn(),
  getTeacherBySlug: vi.fn(),
  createTeacher: vi.fn(),
  updateTeacher: vi.fn(),
  deleteTeacher: vi.fn(),
}));
vi.mock('../repositories/teacher.repository.js', () => teachers);

const { default: app } = await import('../app.js');
const { generateAccessToken } = await import('../utils/jwt.js');

const teacherRow = {
  id: 't1', name: 'Nicat', slug: 'nicat', image: null,
  bioAz: 'Bio AZ', bioEn: 'Bio EN', bioRu: 'Bio RU',
  positionAz: 'Müəllim', positionEn: 'Teacher', positionRu: 'Преподаватель',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Blog', () => {
  it('public post lookup only returns published posts', async () => {
    posts.getPostBySlug.mockResolvedValue(null);
    const res = await request(app).get('/api/blog/draft-post?locale=en');
    expect(res.status).toBe(404);
    expect(posts.getPostBySlug).toHaveBeenCalledWith('draft-post', { publishedOnly: true });
  });

  it('?limit is clamped to 1..100', async () => {
    posts.getAllPosts.mockResolvedValue([]);
    await request(app).get('/api/blog?limit=-5');
    expect(posts.getAllPosts).toHaveBeenLastCalledWith(expect.objectContaining({ limit: 1, publishedOnly: true }));
    await request(app).get('/api/blog?limit=100000');
    expect(posts.getAllPosts).toHaveBeenLastCalledWith(expect.objectContaining({ limit: 100 }));
    await request(app).get('/api/blog?limit=abc');
    expect(posts.getAllPosts).toHaveBeenLastCalledWith(expect.objectContaining({ limit: undefined }));
  });

  it('admin post content is sanitised and authorId comes from the token', async () => {
    posts.createPost.mockImplementation(async (data) => data);
    const token = await generateAccessToken({ sub: 'admin-1', email: 'a@b.az', role: 'admin' });
    const res = await request(app)
      .post('/api/blog')
      .set('Authorization', `Bearer ${token}`)
      .send({
        titleAz: 'T', titleEn: 'T', titleRu: 'T', slug: 'post-1',
        contentAz: '<p>ok</p><script>alert(1)</script>', contentEn: '<p onclick="x()">en</p>', contentRu: 'ru',
        isPublished: 'true', authorId: 'someone-else', id: 'forced-id',
      });
    expect(res.status).toBe(201);
    const saved = posts.createPost.mock.calls[0][0];
    expect(saved.contentAz).toBe('<p>ok</p>');
    expect(saved.contentEn).toBe('<p>en</p>');
    expect(saved.authorId).toBe('admin-1');
    expect(saved).not.toHaveProperty('id');
  });
});

describe('Teachers are localised', () => {
  it('list returns the requested locale (used to always be az)', async () => {
    teachers.getAllTeachers.mockResolvedValue([teacherRow]);
    const en = await request(app).get('/api/teachers?locale=en');
    const ru = await request(app).get('/api/teachers?locale=ru');
    const bad = await request(app).get('/api/teachers?locale=__proto__');
    expect(en.body.data[0]).toMatchObject({ bio: 'Bio EN', position: 'Teacher' });
    expect(ru.body.data[0]).toMatchObject({ bio: 'Bio RU', position: 'Преподаватель' });
    expect(bad.body.data[0]).toMatchObject({ bio: 'Bio AZ', position: 'Müəllim' });
  });

  it('detail localises the teacher and the course titles', async () => {
    teachers.getTeacherBySlug.mockResolvedValue({
      ...teacherRow,
      courses: [
        {
          course: { id: 'c1', slug: 'react', titleAz: 'React AZ', titleEn: 'React EN', titleRu: 'React RU',
            descriptionAz: 'd', descriptionEn: 'd en', descriptionRu: 'd ru', isPopular: 'true' },
          category: { id: 'k1', slug: 'web', nameAz: 'Veb', nameEn: 'Web', nameRu: 'Веб' },
        },
      ],
    });
    const res = await request(app).get('/api/teachers/nicat?locale=en');
    expect(res.status).toBe(200);
    expect(res.body.data.position).toBe('Teacher');
    expect(res.body.data.courses[0]).toMatchObject({ title: 'React EN', isPopular: true, category: { name: 'Web' } });
  });
});
