import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function seedAdmin() {
  const email    = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  // No default password any more (it was committed to the repo) and the password is never printed.
  if (!email || !password || password.length < 12) {
    console.error('ADMIN_EMAIL və ADMIN_PASSWORD (ən azı 12 simvol) mühit dəyişənləri tələb olunur.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await sql`
    INSERT INTO admin_users (email, password_hash, name, is_super_admin)
    VALUES (${email}, ${passwordHash}, 'Admin', true)
    ON CONFLICT (email) DO UPDATE SET is_super_admin = true
  `;

  console.log(`✅ Admin yaradıldı: ${email}`);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('❌ Seed xətası:', err);
  process.exit(1);
});

