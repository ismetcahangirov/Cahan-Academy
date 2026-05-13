import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema.js';
import { env } from './env.js';

const connectionString = (env.NODE_ENV === 'test' && env.TEST_DATABASE_URL) 
  ? env.TEST_DATABASE_URL 
  : env.DATABASE_URL;

const sql = neon(connectionString);

export const db = drizzle(sql, { schema });
