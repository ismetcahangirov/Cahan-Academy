import { beforeEach, afterAll } from 'vitest';
import { db } from '../config/db.js';
import { leads, contactMessages, posts } from '../config/schema.js';
import { sql } from 'drizzle-orm';

beforeEach(async () => {
  // Test cədvəllərini təmizlə
  await db.execute(sql`TRUNCATE TABLE ${leads} RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE ${contactMessages} RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE ${posts} RESTART IDENTITY CASCADE`);
});

afterAll(async () => {
  // Neon HTTP bağlantısı üçün xüsusi "close" yoxdur, 
  // lakin burada hər hansı bir təmizlik və ya log bağlamaq olar.
  console.log('✅ Bütün testlər tamamlandı, DB bağlantısı (vritual) bağlandı.');
});
