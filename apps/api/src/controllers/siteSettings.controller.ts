import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../config/db.js';
import { siteSettings } from '../config/schema.js';
import { DEFAULT_CONTACT, type ContactSettings } from '../config/siteDefaults.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';

const KEY = 'contact';

const l3 = (max: number) =>
  z.object({
    az: z.string().trim().min(1, 'Azərbaycan dilində mətn mütləqdir').max(max),
    en: z.string().trim().min(1, 'İngilis dilində mətn mütləqdir').max(max),
    ru: z.string().trim().min(1, 'Rus dilində mətn mütləqdir').max(max),
  });

const url = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === '' || /^https:\/\/\S+$/.test(v), 'Link https:// ilə başlamalıdır');

export const ContactSettingsSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(5, 'Telefon nömrəsi mütləqdir')
    .max(40)
    .regex(/^\+?[\d\s()-]+$/, 'Telefon nömrəsində yalnız rəqəm, boşluq, +, -, () ola bilər'),
  email: z.string().trim().email('Düzgün e-poçt daxil edin').max(255),
  address: l3(300),
  hours: l3(500),
  social: z.object({ instagram: url, facebook: url, youtube: url }),
});

/** Stored value merged over the defaults, so a field added later never reaches the site empty. */
const withDefaults = (value: unknown): ContactSettings => {
  const v = (value ?? {}) as Partial<ContactSettings>;
  return {
    ...DEFAULT_CONTACT,
    ...v,
    address: { ...DEFAULT_CONTACT.address, ...(v.address ?? {}) },
    hours: { ...DEFAULT_CONTACT.hours, ...(v.hours ?? {}) },
    social: { ...DEFAULT_CONTACT.social, ...(v.social ?? {}) },
  };
};

const readContact = async (): Promise<ContactSettings> => {
  try {
    const rows = await db.select().from(siteSettings).where(eq(siteSettings.key, KEY)).limit(1);
    return withDefaults(rows[0]?.value);
  } catch (err) {
    // table not created yet (42P01): the site keeps working on the defaults
    if ((err as { code?: string })?.code === '42P01' || (err as { cause?: { code?: string } })?.cause?.code === '42P01') {
      return DEFAULT_CONTACT;
    }
    throw err;
  }
};

// GET /api/settings/contact
export const getContactSettings = asyncHandler(async (_req: Request, res: Response) => {
  const data = await readContact();
  res.set('Cache-Control', 'public, max-age=60, s-maxage=300');
  return apiResponse.success(res, { data });
});

// PUT /api/settings/admin/contact
export const updateContactSettings = asyncHandler(async (req: Request, res: Response) => {
  const value = ContactSettingsSchema.parse(req.body);
  const [row] = await db
    .insert(siteSettings)
    .values({ key: KEY, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } })
    .returning();
  return apiResponse.success(res, { data: withDefaults(row?.value ?? value), message: 'Sayt məlumatları yeniləndi' });
});
