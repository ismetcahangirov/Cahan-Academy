import { describe, it, expect } from 'vitest';
import { csvCell, toCsv, escapeHtml, singleLine } from '../utils/sanitize.js';
import { sanitizeRichText } from '../utils/html.js';
import { adminNotificationTemplate, userThankYouTemplate } from '../templates/notification.template.js';
import { validateSignParams } from '../controllers/upload.controller.js';
import { isAllowedImageUrl, LeadSchema, ContactSchema, CourseSchema, PostSchema } from '../schemas/form.schema.js';

describe('CSV export', () => {
  it('quotes are doubled and every cell is quoted', () => {
    expect(csvCell('Ali "the" Veli')).toBe('"Ali ""the"" Veli"');
    expect(csvCell(null)).toBe('""');
  });

  it('formula-like cells are neutralised (CSV injection)', () => {
    expect(csvCell('=HYPERLINK("http://evil","x")')).toBe(`"'=HYPERLINK(""http://evil"",""x"")"`);
    expect(csvCell('+994501234567')).toBe(`"'+994501234567"`);
    expect(csvCell('@SUM(A1)')).toBe(`"'@SUM(A1)"`);
  });

  it('rows are CRLF separated and dates are ISO', () => {
    const d = new Date('2026-01-02T03:04:05.000Z');
    expect(toCsv([['a', d]])).toBe('"a","2026-01-02T03:04:05.000Z"\r\n');
  });
});

describe('Email templates', () => {
  it('escape visitor input', () => {
    const html = adminNotificationTemplate('contact', {
      name: '<img src=x onerror=alert(1)>',
      email: 'a@b.az',
      subject: '<b>hi</b>',
      message: 'line1\n<script>x</script>',
    });
    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('line1<br/>&lt;script&gt;');
  });

  it('thank-you mail escapes and truncates the name', () => {
    const html = userThankYouTemplate('<a href="http://evil">click</a>' + 'x'.repeat(200));
    expect(html).not.toContain('<a href');
    expect(html).not.toContain('x'.repeat(100));
  });

  it('subjects are single-line', () => {
    expect(singleLine('Hi\r\nBcc: victim@x.az')).toBe('Hi Bcc: victim@x.az');
    expect(escapeHtml(`"'&`)).toBe('&quot;&#39;&amp;');
  });
});

describe('Blog HTML sanitiser', () => {
  it('removes scripts, handlers and javascript: links but keeps formatting', () => {
    const out = sanitizeRichText(
      '<h2>T</h2><p onclick="x()">a <strong>b</strong></p><script>alert(1)</script>' +
        '<a href="javascript:alert(1)">j</a><img src="https://res.cloudinary.com/x.png" onerror="y()"><iframe src="https://evil"></iframe>'
    );
    expect(out).toContain('<h2>T</h2>');
    expect(out).toContain('<strong>b</strong>');
    expect(out).not.toMatch(/onclick|onerror|<script|javascript:|<iframe/);
    expect(out).toContain('<img src="https://res.cloudinary.com/x.png" />');
  });
});

describe('Cloudinary signature params', () => {
  const now = 1_800_000_000;

  it('accepts the widget params', () => {
    expect(validateSignParams({ timestamp: now, source: 'uw', folder: 'cahan-academy' }, now)).toBeNull();
  });

  it('rejects unknown/dangerous params, other folders and stale timestamps', () => {
    expect(validateSignParams({ timestamp: now, overwrite: true, public_id: 'x' }, now)).toMatch(/overwrite/);
    expect(validateSignParams({ timestamp: now, eval: 'x' }, now)).toMatch(/eval/);
    expect(validateSignParams({ timestamp: now, folder: 'other' }, now)).toBe('Yanlış qovluq');
    expect(validateSignParams({ timestamp: now - 7200 }, now)).toBe('Yanlış timestamp');
    expect(validateSignParams({ timestamp: now, tags: { a: 1 } }, now)).toMatch(/tags/);
    expect(validateSignParams(null, now)).not.toBeNull();
  });
});

describe('Input schemas', () => {
  it('image URLs must be https on a host next/image allows', () => {
    expect(isAllowedImageUrl('')).toBe(true);
    expect(isAllowedImageUrl('https://res.cloudinary.com/demo/image/upload/x.jpg')).toBe(true);
    expect(isAllowedImageUrl('http://res.cloudinary.com/x.jpg')).toBe(false);
    expect(isAllowedImageUrl('https://example.com/x.jpg')).toBe(false);
    expect(isAllowedImageUrl('https://evilcloudinary.com.attacker.io/x.jpg')).toBe(false);
    expect(isAllowedImageUrl('javascript:alert(1)')).toBe(false);
  });

  it('public forms enforce DB column limits and types', () => {
    const base = { name: 'Ali', email: 'ali@example.az', phone: '+994501234567', course: 'React' };
    expect(LeadSchema.safeParse(base).success).toBe(true);
    expect(LeadSchema.safeParse({ ...base, name: 'x'.repeat(256) }).success).toBe(false);
    expect(LeadSchema.safeParse({ ...base, phone: '1'.repeat(51) }).success).toBe(false);
    expect(LeadSchema.safeParse({ ...base, email: { $ne: '' } }).success).toBe(false);
    expect(
      ContactSchema.safeParse({ name: 'Ali', email: 'a@b.az', subject: 'Sual', message: 'x'.repeat(5001) }).success
    ).toBe(false);
  });

  it('admin course/post writes strip server-owned fields', () => {
    const course = CourseSchema.parse({
      titleAz: 'a', titleEn: 'a', titleRu: 'a', slug: 'react-101',
      descriptionAz: 'd', descriptionEn: 'd', descriptionRu: 'd',
      categoryId: 'c1', teacherId: '', isPopular: 'true',
      id: 'evil-id', createdAt: '1999-01-01',
    });
    expect(course).not.toHaveProperty('id');
    expect(course).not.toHaveProperty('createdAt');
    expect(course.teacherId).toBeNull();
    expect(course.isPopular).toBe('true');

    const toggle = PostSchema.partial().parse({ isPublished: 'false', authorId: 'someone' });
    expect(toggle).toEqual({ isPublished: 'false' });
  });

  it('slugs cannot contain path characters', () => {
    expect(CourseSchema.shape.slug.safeParse('../../admin').success).toBe(false);
    expect(CourseSchema.shape.slug.safeParse('react-web-development').success).toBe(true);
  });
});
