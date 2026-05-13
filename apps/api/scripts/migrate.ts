import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log('🔄 Verilənlər bazası migrasiyası başlayır...');

  // Enums
  await sql`
    DO $$ BEGIN
      CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'enrolled', 'cancelled');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    DO $$ BEGIN
      CREATE TYPE subscription_status AS ENUM ('active', 'unsubscribed');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `;

  // Leads table
  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name        VARCHAR(255) NOT NULL,
      email       VARCHAR(255) NOT NULL,
      phone       VARCHAR(50),
      course      VARCHAR(255),
      source      VARCHAR(100) DEFAULT 'website',
      status      lead_status NOT NULL DEFAULT 'new',
      notes       TEXT,
      created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  console.log('  ✅ leads cədvəli hazır');

  // Contact messages table
  await sql`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name        VARCHAR(255) NOT NULL,
      email       VARCHAR(255) NOT NULL,
      phone       VARCHAR(50),
      subject     VARCHAR(500) NOT NULL,
      message     TEXT NOT NULL,
      is_read     TEXT NOT NULL DEFAULT 'false',
      created_at  TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  console.log('  ✅ contact_messages cədvəli hazır');

  // Admin users table
  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      email         VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      name          VARCHAR(255),
      created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  console.log('  ✅ admin_users cədvəli hazır');

  // Newsletter subscribers table
  await sql`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      email      VARCHAR(255) NOT NULL UNIQUE,
      status     subscription_status NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  console.log('  ✅ newsletter_subscribers cədvəli hazır');

  // Course level enum
  await sql`
    DO $$ BEGIN
      CREATE TYPE course_level AS ENUM ('beginner', 'intermediate', 'advanced', 'all');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `;

  // Categories table
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name_az    VARCHAR(255) NOT NULL,
      name_en    VARCHAR(255) NOT NULL,
      name_ru    VARCHAR(255) NOT NULL,
      slug       VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;
  console.log('  ✅ categories cədvəli hazır');

  // Teachers table
  await sql`
    CREATE TABLE IF NOT EXISTS teachers (
      id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name        VARCHAR(255) NOT NULL,
      slug        VARCHAR(255) NOT NULL UNIQUE,
      image       VARCHAR(1000),
      bio_az      TEXT,
      bio_en      TEXT,
      bio_ru      TEXT,
      position_az VARCHAR(255),
      position_en VARCHAR(255),
      position_ru VARCHAR(255),
      created_at  TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;
  console.log('  ✅ teachers cədvəli hazır');

  // Courses table
  await sql`
    CREATE TABLE IF NOT EXISTS courses (
      id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      title_az        VARCHAR(255) NOT NULL,
      title_en        VARCHAR(255) NOT NULL,
      title_ru        VARCHAR(255) NOT NULL,
      slug            VARCHAR(255) NOT NULL UNIQUE,
      description_az  TEXT NOT NULL,
      description_en  TEXT NOT NULL,
      description_ru  TEXT NOT NULL,
      category_id     TEXT REFERENCES categories(id),
      teacher_id      TEXT REFERENCES teachers(id),
      price           VARCHAR(100),
      duration        VARCHAR(100),
      level           course_level NOT NULL DEFAULT 'beginner',
      image           VARCHAR(1000),
      is_popular      TEXT NOT NULL DEFAULT 'false',
      rating          VARCHAR(10) DEFAULT '5.0',
      students_count  VARCHAR(50) DEFAULT '0',
      syllabus_az     TEXT,
      syllabus_en     TEXT,
      syllabus_ru     TEXT,
      created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;
  console.log('  ✅ courses cədvəli hazır');

  // Blog Posts table
  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      title_az      VARCHAR(500) NOT NULL,
      title_en      VARCHAR(500) NOT NULL,
      title_ru      VARCHAR(500) NOT NULL,
      slug          VARCHAR(500) NOT NULL UNIQUE,
      content_az    TEXT NOT NULL,
      content_en    TEXT NOT NULL,
      content_ru    TEXT NOT NULL,
      excerpt_az    TEXT,
      excerpt_en    TEXT,
      excerpt_ru    TEXT,
      image         VARCHAR(1000),
      author_id     TEXT REFERENCES admin_users(id),
      reading_time  VARCHAR(50),
      is_published  TEXT NOT NULL DEFAULT 'true',
      created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;
  console.log('  ✅ posts cədvəli hazır');

  console.log('\n🎉 Migrasiya uğurla tamamlandı!');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('❌ Migrasiya xətası:', err);
  process.exit(1);
});
