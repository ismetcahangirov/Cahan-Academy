import { z } from 'zod';

export const LeadSchema = z.object({
  name: z.string().min(2, 'Ad çox qısadır'),
  email: z.string().email('Düzgün email daxil edin'),
  phone: z.string().min(7, 'Düzgün telefon nömrəsi daxil edin'),
  course: z.string().min(1, 'Kurs seçimi mütləqdir'),
});

export const ContactSchema = z.object({
  name: z.string().min(2, 'Ad çox qısadır'),
  email: z.string().email('Düzgün email daxil edin'),
  subject: z.string().min(3, 'Mövzu çox qısadır'),
  message: z.string().min(10, 'Mesaj çox qısadır'),
});

export const NewsletterSchema = z.object({
  email: z.string().email('Düzgün email daxil edin'),
});

export const TeacherSchema = z.object({
  name: z.string().min(2, 'Ad mütləqdir'),
  slug: z.string().min(1, 'Slug mütləqdir'),
  image: z.string().optional().default(''),
  bioAz: z.string().optional().default(''),
  bioEn: z.string().optional().default(''),
  bioRu: z.string().optional().default(''),
  positionAz: z.string().optional().default(''),
  positionEn: z.string().optional().default(''),
  positionRu: z.string().optional().default(''),
});

export const CategorySchema = z.object({
  nameAz: z.string().min(1, 'Azərbaycan dilində ad mütləqdir'),
  nameEn: z.string().min(1, 'İngilis dilində ad mütləqdir'),
  nameRu: z.string().min(1, 'Rus dilində ad mütləqdir'),
  slug: z.string().min(1, 'Slug mütləqdir'),
});

export const TeamMemberSchema = z.object({
  name: z.string().min(2, 'Ad mütləqdir'),
  positionAz: z.string().min(1, 'Azərbaycan dilində vəzifə mütləqdir'),
  positionEn: z.string().min(1, 'İngilis dilində vəzifə mütləqdir'),
  positionRu: z.string().min(1, 'Rus dilində vəzifə mütləqdir'),
  image: z.string().optional().default(''),
  order: z.preprocess((v) => {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  }, z.number().int().default(0)),
});

export type LeadInput = z.infer<typeof LeadSchema>;
export type ContactInput = z.infer<typeof ContactSchema>;
export type NewsletterInput = z.infer<typeof NewsletterSchema>;
export type TeacherInput = z.infer<typeof TeacherSchema>;
export type CategoryInput = z.infer<typeof CategorySchema>;
export type TeamMemberInput = z.infer<typeof TeamMemberSchema>;
