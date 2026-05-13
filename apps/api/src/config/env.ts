import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT:               z.string().default('5000'),
  NODE_ENV:           z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL:       z.string().url(),
  TEST_DATABASE_URL:  z.string().url().optional(),
  JWT_SECRET:         z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  SMTP_HOST:          z.string().default('smtp.gmail.com'),
  SMTP_PORT:          z.coerce.number().default(587),
  SMTP_USER:          z.string().email(),
  SMTP_PASS:          z.string().min(1),
  CLIENT_URL:         z.string().url().default('https://cahan-academy.vercel.app'),
  ADMIN_EMAIL:        z.string().email(),
  NOTIFICATION_EMAIL: z.string().email(),
  REVALIDATE_SECRET:  z.string().min(16),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Mühit dəyişənləri yanlışdır:');
  console.error(_env.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = _env.data;
