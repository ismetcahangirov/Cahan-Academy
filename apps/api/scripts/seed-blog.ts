import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function seedBlog() {
  try {
    const admins = await sql`SELECT id FROM admin_users LIMIT 1`;
    if (admins.length === 0) {
      console.error('❌ Admin istifadəçisi tapılmadı. Əvvəlcə seed-admin icra edin.');
      process.exit(1);
    }
    const authorId = admins[0].id;

    const blogPosts = [
      {
        titleAz: "Front-end proqramlaşdırmaya necə başlamalı?",
        titleEn: "How to start Front-end development?",
        titleRu: "Как начать фронтенд-разработку?",
        slug: "frontend-development-start",
        contentAz: "<p>Front-end dünyası daim yenilənir. HTML, CSS və JavaScript bu sahənin fundamentləridir. Yaxşı bir proqramçı olmaq üçün həm nəzəriyyəni öyrənməli, həm də çoxlu praktika etməlisiniz. Cahan Academy-də biz sizə bu yolu asanlaşdırırıq.</p>",
        contentEn: "<p>The front-end world is constantly evolving. HTML, CSS, and JavaScript are the fundamentals of this field. To become a good developer, you must learn both theory and practice extensively. At Cahan Academy, we make this path easier for you.</p>",
        contentRu: "<p>Мир фронтенда постоянно развивается. HTML, CSS и JavaScript являются основами этой области. Чтобы стать хорошим разработчиком, вы должны изучать как теорию, так и много практиковаться. В Cahan Academy мы облегчаем этот путь для вас.</p>",
        excerptAz: "Front-end proqramlaşdırma üzrə yol xəritəsi və əsas məsləhətlər.",
        excerptEn: "Roadmap and key tips for front-end development.",
        excerptRu: "Дорожная карта и основные советы по фронтенд-разработке.",
        image: "https://images.unsplash.com/photo-1547658719-da2b51169166",
        readingTime: "5 min",
      },
      {
        titleAz: "Python niyə bu qədər populyardır?",
        titleEn: "Why is Python so popular?",
        titleRu: "Почему Python так популярен?",
        slug: "why-python-is-popular",
        contentAz: "<p>Python sadəliyi və gücü ilə seçilir. Data Science-dən tutmuş Web Development-ə qədər hər yerdə istifadə olunur. Əgər proqramlaşdırmaya yeni başlayırsınızsa, Python ən yaxşı seçimlərdən biridir.</p>",
        contentEn: "<p>Python stands out for its simplicity and power. It is used everywhere from Data Science to Web Development. If you are just starting programming, Python is one of the best choices.</p>",
        contentRu: "<p>Python выделяется своей простотой и мощностью. Он используется везде, от Data Science до веб-разработки. Если вы только начинаете программировать, Python — один из лучших вариантов.</p>",
        excerptAz: "Python dilinin üstünlükləri və istifadə sahələri haqqında.",
        excerptEn: "About the advantages and use cases of the Python language.",
        excerptRu: "О преимуществах и вариантах использования языка Python.",
        image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
        readingTime: "4 min",
      },
      {
        titleAz: "Rəqəmsal Marketinqin əhəmiyyəti",
        titleEn: "Importance of Digital Marketing",
        titleRu: "Важность цифрового маркетинга",
        slug: "importance-of-digital-marketing",
        contentAz: "<p>Müasir biznes rəqəmsal dünyada var olmalıdır. Sosial media, SEO və Google Ads strategiyaları satışlarınızı artıra bilər. Academy Landing layihəsi çərçivəsində rəqəmsal varlığınızı gücləndirin.</p>",
        contentEn: "<p>Modern business must exist in the digital world. Social media, SEO, and Google Ads strategies can increase your sales. Strengthen your digital presence within the Academy Landing project.</p>",
        contentRu: "<p>Современный бизнес должен существовать в цифровом мире. Стратегии в социальных сетях, SEO и Google Ads могут увеличить ваши продажи. Укрепите свое цифровое присутствие в рамках проекта Academy Landing.</p>",
        excerptAz: "Biznesinizi rəqəmsal dünyada böyütmək üçün əsas strategiyalar.",
        excerptEn: "Key strategies to grow your business in the digital world.",
        excerptRu: "Ключевые стратегии развития вашего бизнеса в цифровом мире.",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
        readingTime: "6 min",
      }
    ];

    for (const post of blogPosts) {
      await sql`
        INSERT INTO posts (
          title_az, title_en, title_ru, 
          slug, 
          content_az, content_en, content_ru, 
          excerpt_az, excerpt_en, excerpt_ru, 
          image, author_id, reading_time
        ) VALUES (
          ${post.titleAz}, ${post.titleEn}, ${post.titleRu},
          ${post.slug},
          ${post.contentAz}, ${post.contentEn}, ${post.contentRu},
          ${post.excerptAz}, ${post.excerptEn}, ${post.excerptRu},
          ${post.image}, ${authorId}, ${post.readingTime}
        ) ON CONFLICT (slug) DO NOTHING
      `;
    }

    console.log('✅ Blog yazıları əlavə edildi.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed xətası:', err);
    process.exit(1);
  }
}

seedBlog();
