import { defineConfig } from 'vitest/config';
import path from 'path';
import dotenv from 'dotenv';

// Test mühiti üçün .env.test faylını yüklə
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/tests/setup.ts'],
    env: {
      NODE_ENV: 'test',
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
