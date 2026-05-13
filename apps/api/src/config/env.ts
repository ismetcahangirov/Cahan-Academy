import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT:               z.string().default('5000'),
  NODE_ENV:           z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL:       z.string().url(),
  JWT_SECRET:         z.string().min(32),
  JWT_ACCESS_SECRET:  z.string().min(32).default('cahan_academy_access_secret_key_32_chars'),
  JWT_REFRESH_SECRET: z.string().min(32).default('cahan_academy_refresh_secret_key_32_chars'),
  JWT_EXPIRES_IN:     z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  SMTP_HOST:          z.string(),
  SMTP_PORT:          z.coerce.number().default(587),
  SMTP_USER:          z.string().email(),
  SMTP_PASS:          z.string(),
  CLIENT_URL:         z.string().url(),
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
