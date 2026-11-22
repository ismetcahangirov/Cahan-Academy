import { z } from 'zod';

// ─── Shared field helpers ─────────────────────────────────────────────────────
// Max lengths mirror the varchar sizes in config/schema.ts so oversized input is a 400, not a DB 500.
const text = (max: number, minMsg: string, min = 1) =>
  z.string({ required_error: minMsg, invalid_type_error: minMsg }).trim().min(min, minMsg).max(max, `Maksimum ${max} simvol`);

const optionalText = (max: number) =>
  z.string().trim().max(max, `Maksimum ${max} simvol`).optional().default('');

const email = z
  .string({ required_error: 'Düzgün email daxil edin', invalid_type_error: 'Düzgün email daxil edin' })
  .trim()
  .max(255, 'Email çox uzundur')
  .email('Düzgün email daxil edin');

/** Lowercase, URL-safe slug: letters, digits, "-" and "_" only (no "/", spaces or dots). */
const slug = z
  .string({ required_error: 'Slug mütləqdir' })
  .trim()
  .min(1, 'Slug mütləqdir')
  .max(255, 'Slug çox uzundur')
  .regex(/^[\p{Ll}\p{Lo}\p{N}_-]+$/u, 'Slug yalnız kiçik hərf, rəqəm, "-" və "_" ola bilər');

/**
 * Image URLs end up in next/image on the public site, which throws for hosts that are not in
 * apps/web/next.config.ts `images.remotePatterns`. Only accept those hosts (or an empty value)
 * so a pasted URL can never take a public page down.
 */
export const ALLOWED_IMAGE_HOST_SUFFIXES = ['.cloudinary.com', '.unsplash.com'];

export const isAllowedImageUrl = (value: string) => {
  if (value === '') return true;
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      ALLOWED_IMAGE_HOST_SUFFIXES.some((suffix) => url.hostname.endsWith(suffix))
    );
  } catch {
    return false;
  }
};

const imageUrl = z
  .string()
  .trim()
  .max(1000, 'Şəkil linki çox uzundur')
  .refine(isAllowedImageUrl, 'Şəkil linki https və Cloudinary (res.cloudinary.com) ünvanı olmalıdır')
  .optional()
  .default('');

const booleanString = z
  .union([z.enum(['true', 'false']), z.boolean()])
  .transform((v) => String(v) as 'true' | 'false');

// ─── Public forms ─────────────────────────────────────────────────────────────
export const LeadSchema = z.object({
  name: text(255, 'Ad çox qısadır', 2),
  email,
  phone: z
    .string({ required_error: 'Düzgün telefon nömrəsi daxil edin' })
    .trim()
    .min(7, 'Düzgün telefon nömrəsi daxil edin')
    .max(50, 'Düzgün telefon nömrəsi daxil edin'),
  course: text(255, 'Kurs seçimi mütləqdir'),
});

export const ContactSchema = z.object({
  name: text(255, 'Ad çox qısadır', 2),
  email,
  subject: text(500, 'Mövzu çox qısadır', 3),
  message: text(5000, 'Mesaj çox qısadır', 10),
});

export const NewsletterSchema = z.object({
  email,
});

export const LeadStatusSchema = z.object({
  status: z.enum(['new', 'contacted', 'enrolled', 'cancelled'], {
    errorMap: () => ({ message: 'Yanlış status' }),
  }),
});

// ─── Admin CMS ────────────────────────────────────────────────────────────────
export const TeacherSchema = z.object({
  name: text(255, 'Ad mütləqdir', 2),
  slug,
  image: imageUrl,
  bioAz: optionalText(10000),
  bioEn: optionalText(10000),
  bioRu: optionalText(10000),
  positionAz: optionalText(255),
  positionEn: optionalText(255),
  positionRu: optionalText(255),
});

export const CategorySchema = z.object({
  nameAz: text(255, 'Azərbaycan dilində ad mütləqdir'),
  nameEn: text(255, 'İngilis dilində ad mütləqdir'),
  nameRu: text(255, 'Rus dilində ad mütləqdir'),
  slug,
});

export const TeamMemberSchema = z.object({
  name: text(255, 'Ad mütləqdir', 2),
  positionAz: text(255, 'Azərbaycan dilində vəzifə mütləqdir'),
  positionEn: text(255, 'İngilis dilində vəzifə mütləqdir'),
  positionRu: text(255, 'Rus dilində vəzifə mütləqdir'),
  image: imageUrl,
  order: z.preprocess((v) => {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  }, z.number().int().default(0)),
});

/** Whitelist of course columns an admin may write (id/createdAt/updatedAt are server-owned). */
export const CourseSchema = z.object({
  titleAz: text(255, 'Azərbaycan dilində başlıq mütləqdir'),
  titleEn: text(255, 'İngilis dilində başlıq mütləqdir'),
  titleRu: text(255, 'Rus dilində başlıq mütləqdir'),
  slug,
  descriptionAz: text(20000, 'Azərbaycan dilində təsvir mütləqdir'),
  descriptionEn: text(20000, 'İngilis dilində təsvir mütləqdir'),
  descriptionRu: text(20000, 'Rus dilində təsvir mütləqdir'),
  categoryId: z.string().trim().max(255).nullable().optional().transform((v) => v || null),
  teacherId: z.string().trim().max(255).nullable().optional().transform((v) => v || null),
  price: optionalText(100),
  duration: optionalText(100),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'all']).default('beginner'),
  image: imageUrl,
  isPopular: booleanString.default('false'),
  rating: optionalText(10),
  studentsCount: optionalText(50),
  syllabusAz: optionalText(50000),
  syllabusEn: optionalText(50000),
  syllabusRu: optionalText(50000),
});

/** Whitelist of post columns an admin may write (authorId is taken from the token). */
export const PostSchema = z.object({
  titleAz: text(500, 'Azərbaycan dilində başlıq mütləqdir'),
  titleEn: text(500, 'İngilis dilində başlıq mütləqdir'),
  titleRu: text(500, 'Rus dilində başlıq mütləqdir'),
  slug,
  contentAz: text(200000, 'Azərbaycan dilində məzmun mütləqdir'),
  contentEn: text(200000, 'İngilis dilində məzmun mütləqdir'),
  contentRu: text(200000, 'Rus dilində məzmun mütləqdir'),
  excerptAz: optionalText(2000),
  excerptEn: optionalText(2000),
  excerptRu: optionalText(2000),
  image: imageUrl,
  readingTime: optionalText(50),
  isPublished: booleanString.default('true'),
});

export const AdminCreateSchema = z.object({
  name: text(255, 'Ad mütləqdir'),
  email,
  password: z
    .string({ required_error: 'Şifrə mütləqdir' })
    .min(8, 'Şifrə ən azı 8 simvol olmalıdır')
    .max(128, 'Şifrə çox uzundur'),
  isSuperAdmin: z.boolean().optional().default(false),
});

export const ProfileUpdateSchema = z.object({
  name: text(255, 'Ad mütləqdir'),
  email,
});

export const PasswordChangeSchema = z.object({
  oldPassword: z.string({ required_error: 'Mövcud şifrə mütləqdir' }).min(1, 'Mövcud şifrə mütləqdir').max(128),
  newPassword: z
    .string({ required_error: 'Yeni şifrə mütləqdir' })
    .min(8, 'Şifrə ən azı 8 simvol olmalıdır')
    .max(128, 'Şifrə çox uzundur'),
});

export const LoginSchema = z.object({
  email: z.string({ required_error: 'Email və şifrə tələb olunur.' }).trim().min(1, 'Email və şifrə tələb olunur.').max(255),
  password: z.string({ required_error: 'Email və şifrə tələb olunur.' }).min(1, 'Email və şifrə tələb olunur.').max(128),
});

export type LeadInput = z.infer<typeof LeadSchema>;
export type ContactInput = z.infer<typeof ContactSchema>;
export type NewsletterInput = z.infer<typeof NewsletterSchema>;
export type TeacherInput = z.infer<typeof TeacherSchema>;
export type CategoryInput = z.infer<typeof CategorySchema>;
export type TeamMemberInput = z.infer<typeof TeamMemberSchema>;
export type CourseInput = z.infer<typeof CourseSchema>;
export type PostInput = z.infer<typeof PostSchema>;
