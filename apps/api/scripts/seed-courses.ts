import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function seedCourses() {
  console.log('🌱 Kurs məlumatları əlavə edilir...\n');

  // ─── Categories ──────────────────────────────────────────────────────────────
  const [webCat, dataCat, langCat, designCat] = await sql`
    INSERT INTO categories (name_az, name_en, name_ru, slug) VALUES
      ('Veb Proqramlaşdırma', 'Web Development',    'Веб-разработка',   'web-development'),
      ('Data Elmi',           'Data Science',        'Наука о данных',   'data-science'),
      ('Dil Kursları',        'Language Courses',    'Языковые курсы',   'language-courses'),
      ('Dizayn',              'Design',              'Дизайн',           'design')
    ON CONFLICT (slug) DO UPDATE SET name_az = EXCLUDED.name_az
    RETURNING id
  `;

  console.log('  ✅ categories əlavə edildi');

  // ─── Teachers ─────────────────────────────────────────────────────────────
  const [t1, t2, t3, t4] = await sql`
    INSERT INTO teachers (name, slug, position_az, position_en, position_ru, bio_az, bio_en, bio_ru) VALUES
      (
        'Nicat Əliyev', 'nicat-aliyev',
        'Senior Full-Stack Developer',
        'Senior Full-Stack Developer',
        'Senior Full-Stack разработчик',
        '10 il təcrübəsi olan Nicat müəllim React, Node.js və AWS texnologiyalarında ixtisaslaşmışdır.',
        'Nicat has 10 years of experience specializing in React, Node.js, and AWS technologies.',
        'Никат имеет 10-летний опыт работы, специализируясь на React, Node.js и AWS.'
      ),
      (
        'Leyla Həsənova', 'leyla-hasanova',
        'Data Scientist & ML Mühəndisi',
        'Data Scientist & ML Engineer',
        'Data Scientist и ML инженер',
        'Leyla xanım böyük data analitikası və maşın öyrənməsi sahəsində 8 illik təcrübəyə malikdir.',
        'Leyla has 8 years of experience in big data analytics and machine learning.',
        'Лейла имеет 8 лет опыта в области аналитики больших данных и машинного обучения.'
      ),
      (
        'Orxan Quliyev', 'orxan-quliyev',
        'UX/UI Dizayn Mütəxəssisi',
        'UX/UI Design Specialist',
        'Специалист по UX/UI дизайну',
        'Orxan müəllim Figma, Adobe XD və dizayn sistemlərinin yaradılması üzrə mütəxəssisdir.',
        'Orxan specializes in Figma, Adobe XD, and building design systems.',
        'Орхан специализируется на Figma, Adobe XD и создании дизайн-систем.'
      ),
      (
        'Aytən Məmmədova', 'ayten-mammadova',
        'İngilis Dili Müəllimi (IELTS 8.5)',
        'English Language Teacher (IELTS 8.5)',
        'Преподаватель английского языка (IELTS 8.5)',
        'Aytən xanım IELTS imtahanına hazırlıq üzrə 200+ tələbəyə uğurla dərs vermişdir.',
        'Aytən has successfully taught 200+ students for IELTS exam preparation.',
        'Айтен успешно обучила более 200 студентов для подготовки к экзамену IELTS.'
      )
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `;

  console.log('  ✅ teachers əlavə edildi');

  // ─── Courses ──────────────────────────────────────────────────────────────
  await sql`
    INSERT INTO courses (
      title_az, title_en, title_ru, slug,
      description_az, description_en, description_ru,
      category_id, teacher_id,
      price, duration, level, is_popular, rating, students_count
    ) VALUES
      (
        'React ilə Modern Veb Proqramlaşdırma',
        'Modern Web Development with React',
        'Современная веб-разработка с React',
        'react-web-development',
        'React, Next.js və TypeScript ilə professional veb tətbiqlər qurun. Komponentlər, hooks, state idarəetməsi.',
        'Build professional web applications with React, Next.js, and TypeScript. Components, hooks, state management.',
        'Создавайте профессиональные веб-приложения с React, Next.js и TypeScript.',
        ${webCat.id}, ${t1.id},
        '299 ₼', '3 ay', 'intermediate', 'true', '4.9', '324'
      ),
      (
        'Python ilə Data Elmi',
        'Data Science with Python',
        'Наука о данных с Python',
        'data-science-python',
        'Pandas, NumPy, Matplotlib, Scikit-learn və TensorFlow ilə data analitikası və maşın öyrənməsi.',
        'Data analytics and machine learning with Pandas, NumPy, Matplotlib, Scikit-learn, and TensorFlow.',
        'Аналитика данных и машинное обучение с Pandas, NumPy, Matplotlib, Scikit-learn и TensorFlow.',
        ${dataCat.id}, ${t2.id},
        '349 ₼', '4 ay', 'intermediate', 'true', '4.8', '218'
      ),
      (
        'IELTS Hazırlıq Kursu (6.5+ Band)',
        'IELTS Preparation Course (6.5+ Band)',
        'Подготовка к IELTS (6.5+ Band)',
        'ielts-preparation',
        'IELTS imtahanında 6.5+ band almaq üçün yazı, danışma, oxu və qulaqasma bacarıqlarını inkişaf etdirin.',
        'Develop writing, speaking, reading, and listening skills to achieve 6.5+ band on IELTS.',
        'Развивайте навыки письма, говорения, чтения и аудирования для получения 6.5+ баллов на IELTS.',
        ${langCat.id}, ${t4.id},
        '249 ₼', '2 ay', 'all', 'true', '4.9', '512'
      ),
      (
        'Figma ilə UX/UI Dizayn',
        'UX/UI Design with Figma',
        'UX/UI дизайн с Figma',
        'uxui-design-figma',
        'Figma ilə sıfırdan professional interfeys dizaynı öyrənin. Prototiplər, dizayn sistemləri, user research.',
        'Learn professional interface design from scratch with Figma. Prototypes, design systems, user research.',
        'Изучите профессиональный дизайн интерфейсов с нуля в Figma. Прототипы, дизайн-системы.',
        ${designCat.id}, ${t3.id},
        '279 ₼', '3 ay', 'beginner', 'false', '4.7', '187'
      ),
      (
        'Node.js ilə Backend Proqramlaşdırma',
        'Backend Development with Node.js',
        'Бэкенд-разработка с Node.js',
        'nodejs-backend',
        'Express, PostgreSQL, REST API, JWT autentifikasiya və deployment ilə tam backend inkişafı.',
        'Full backend development with Express, PostgreSQL, REST API, JWT authentication, and deployment.',
        'Полная бэкенд-разработка с Express, PostgreSQL, REST API, JWT аутентификацией и деплоем.',
        ${webCat.id}, ${t1.id},
        '319 ₼', '3 ay', 'intermediate', 'false', '4.8', '143'
      ),
      (
        'Sıfırdan Proqramlaşdırma (Başlayanlar üçün)',
        'Programming from Scratch (For Beginners)',
        'Программирование с нуля (Для начинающих)',
        'programming-for-beginners',
        'Proqramlaşdırmanın əsasları: dəyişənlər, funksiyalar, şərtlər, dövrlər. Python ilə praktiki məşqlər.',
        'Programming fundamentals: variables, functions, conditions, loops. Practical exercises with Python.',
        'Основы программирования: переменные, функции, условия, циклы. Практические упражнения на Python.',
        ${webCat.id}, ${t1.id},
        '149 ₼', '6 həftə', 'beginner', 'false', '4.9', '621'
      )
    ON CONFLICT (slug) DO UPDATE SET title_az = EXCLUDED.title_az
  `;

  console.log('  ✅ 6 kurs əlavə edildi');
  console.log('\n🎉 Seed tamamlandı!');
  process.exit(0);
}

seedCourses().catch((err) => {
  console.error('❌ Seed xətası:', err);
  process.exit(1);
});
