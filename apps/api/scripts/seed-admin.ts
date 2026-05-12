import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function seedAdmin() {
  const email    = process.env.ADMIN_EMAIL    ?? 'admin@cahanacademy.az';
  const password = process.env.ADMIN_PASSWORD ?? 'CahanAdmin2026!';

  const passwordHash = await bcrypt.hash(password, 12);

  await sql`
    INSERT INTO admin_users (email, password_hash, name)
    VALUES (${email}, ${passwordHash}, 'Admin')
    ON CONFLICT (email) DO NOTHING
  `;

  console.log(`✅ Admin yaradıldı: ${email}`);
  console.log(`🔑 Şifrə: ${password}`);
  console.log('⚠️  Şifrəni mühit dəyişənindən oxuyun. Default şifrəni dəyişin!');
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('❌ Seed xətası:', err);
  process.exit(1);
});

