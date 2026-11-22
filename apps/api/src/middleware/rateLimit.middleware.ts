import { rateLimit } from 'express-rate-limit';

/**
 * Rate limiter that answers in the same `{ success, message }` shape as every other API error.
 * NOTE: the default store is in-memory, i.e. per serverless instance. It slows down abuse but is
 * not a global quota; a shared store (e.g. Upstash/Redis) is needed for a hard limit.
 */
export const createRateLimiter = (opts: { windowMs: number; limit: number; message: string }) =>
  rateLimit({
    windowMs: opts.windowMs,
    limit: opts.limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({ success: false, message: opts.message });
    },
  });

const HOUR = 60 * 60 * 1000;

export const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: 'Çox sayda giriş cəhdi. Zəhmət olmasa 15 dəqiqə sonra yenidən cəhd edin.',
});

export const refreshLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  message: 'Çox sayda sorğu. Zəhmət olmasa bir az sonra yenidən cəhd edin.',
});

export const leadLimiter = createRateLimiter({
  windowMs: HOUR,
  limit: 3,
  message: 'Çox sayda müraciət göndərildi. Zəhmət olmasa bir saat sonra yenidən cəhd edin.',
});

export const contactLimiter = createRateLimiter({
  windowMs: HOUR,
  limit: 5,
  message: 'Çox sayda mesaj göndərildi. Zəhmət olmasa bir saat sonra yenidən cəhd edin.',
});

export const newsletterLimiter = createRateLimiter({
  windowMs: HOUR,
  limit: 5,
  message: 'Çox sayda cəhd edildi. Zəhmət olmasa bir saat sonra yenidən cəhd edin.',
});
