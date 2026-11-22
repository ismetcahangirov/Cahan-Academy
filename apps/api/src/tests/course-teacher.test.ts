import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('../config/db.js', () => ({ db: {} }));

const courses = vi.hoisted(() => ({
  getAllCourses: vi.fn(),
  getCourseBySlug: vi.fn(),
  getCoursesByCategory: vi.fn(),
  getAllCategories: vi.fn(),
  createCourse: vi.fn(),
  updateCourse: vi.fn(),
  deleteCourse: vi.fn(),
}));
vi.mock('../repositories/course.repository.js', () => courses);

const { default: app } = await import('../app.js');

const row = {
  id: 'c1', slug: 'react', title_az: 'React AZ', title_en: 'React EN', title_ru: 'React RU',
  description_az: 'D', price: '300 AZN', duration: '3 ay', level: 'beginner', image: null,
  is_popular: 'true', rating: '4.8', students_count: '40',
  category_az: 'Veb', category_en: 'Web', category_slug: 'web',
  teacher_name: 'Nicat', teacher_slug: 'nicat', teacher_image: null,
  teacher_position_az: 'Müəllim', teacher_position_en: 'Teacher',
  teacher_bio_az: 'Bio AZ', teacher_bio_en: 'Bio EN',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Courses carry the teacher slug', () => {
  it('list: teacher.slug lets the web link the profile', async () => {
    courses.getAllCourses.mockResolvedValue([row]);
    const res = await request(app).get('/api/courses?locale=en');
    expect(res.status).toBe(200);
    expect(res.body.data[0].teacher).toEqual({ name: 'Nicat', slug: 'nicat', image: null, position: 'Teacher' });
  });

  it('detail: teacher.slug is present, null when the course has no teacher', async () => {
    courses.getCourseBySlug.mockResolvedValueOnce(row);
    const res = await request(app).get('/api/courses/react?locale=en');
    expect(res.body.data.teacher).toMatchObject({ name: 'Nicat', slug: 'nicat', bio: 'Bio EN' });

    courses.getCourseBySlug.mockResolvedValueOnce({ ...row, teacher_name: undefined, teacher_slug: undefined });
    const none = await request(app).get('/api/courses/react');
    expect(none.body.data.teacher.slug).toBeNull();
  });
});
