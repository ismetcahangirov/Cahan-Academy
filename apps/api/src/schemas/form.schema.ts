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

export type LeadInput = z.infer<typeof LeadSchema>;
export type ContactInput = z.infer<typeof ContactSchema>;
export type NewsletterInput = z.infer<typeof NewsletterSchema>;
