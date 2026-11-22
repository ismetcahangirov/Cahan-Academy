#!/usr/bin/env node
// Local mock of the Cahan Academy API (apps/api) for screenshots, colour audits and perf probes.
// Plain node:http, no dependencies, in-memory data (create/update/delete live for the process).
//
//   node scripts/mock-api.mjs --port 5101            (or PORT=5101)
//   BULK=40 node scripts/mock-api.mjs --port 5101    (every list padded to ~40 items: long-list shots / perf)
//   DELAY=800 node scripts/mock-api.mjs              (every response delayed: skeleton / loading states)
//   MOCK_PUBLIC_URL=http://127.0.0.1:5101            (origin used in fixture image URLs; default http://localhost:<port>)
//   --images none | MOCK_IMAGES=none                 (all fixture images null — needed until next.config.ts allows
//                                                     { protocol: 'http', hostname: 'localhost' } in images.remotePatterns;
//                                                     svg = .svg URLs instead of .png)
//
// Response shapes mirror apps/api/src/controllers/* exactly ({ success, message?, data } envelopes,
// locale-resolved strings on public routes when ?locale= is given, raw drizzle rows on admin routes).
//
// Admin login: POST /api/auth/login with ANY email + password (default admin@cahan.az / mock-admin).
// Password "wrong" returns 401 so the error state can be checked. The response sets the cookie
// refreshToken=mock-refresh (Path=/; HttpOnly; SameSite=Lax) which apps/web/middleware.ts needs for /dashboard.
// Cookies are not port-specific, so a cookie set by localhost:5101 is also sent to localhost:3101.
//
// Extras (not in the real API): GET /api/mock-image/<name>.png|.svg (palette-toned placeholder art),
// POST /api/__mock/reset (restore fixtures), GET /api/auth/me.
// Unknown routes -> 404 { success:false, message } and a "[mock-api] 404 METHOD /path" line on stderr.
import http from 'node:http';
import { deflateSync } from 'node:zlib';

/* ------------------------------------------------------------------ config */
const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.findIndex((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (i < 0) return undefined;
  return argv[i].includes('=') ? argv[i].split('=').slice(1).join('=') : argv[i + 1];
};
const PORT = Number(flag('port') || process.env.PORT || 5101);
const BULK = Number(flag('bulk') || process.env.BULK || 0);
const DELAY = Number(flag('delay') || process.env.DELAY || 0);
const PUBLIC_URL = (flag('public-url') || process.env.MOCK_PUBLIC_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const QUIET = argv.includes('--quiet') || process.env.QUIET === '1';
// --images png (default) | svg | none. "none" = every fixture image is null: use it while next.config.ts has no
// remotePatterns entry for http://localhost (next/image throws "hostname not configured" on the mock URLs).
const IMAGES = String(flag('images') || process.env.MOCK_IMAGES || 'png').toLowerCase();

const imageUrl = (name, ext = IMAGES === 'svg' ? 'svg' : 'png') => `${PUBLIC_URL}/api/mock-image/${name}.${ext}`;
const img = (name) => (IMAGES === 'none' ? null : imageUrl(name));
const BASE_DATE = Date.UTC(2026, 10, 20, 9, 0, 0); // 2026-11-20T09:00:00Z — fixed so screenshots are stable
const daysAgo = (d, h = 0) => new Date(BASE_DATE - d * 86400000 - h * 3600000).toISOString();

/* ------------------------------------------------------------------ fixtures (drizzle camelCase rows) */
function fixtures() {
  const admins = [
    { id: 'admin-1', email: 'admin@cahan.az', name: 'Cahan Admin', isSuperAdmin: true, createdAt: daysAgo(300), updatedAt: daysAgo(12) },
    { id: 'admin-2', email: 'leyla.huseynova@cahan.az', name: 'Leyla Hüseynova', isSuperAdmin: false, createdAt: daysAgo(180), updatedAt: daysAgo(40) },
    { id: 'admin-3', email: 'tural.agayev@cahan.az', name: 'Tural Ağayev', isSuperAdmin: false, createdAt: daysAgo(64), updatedAt: daysAgo(64) },
  ];

  const categories = [
    ['cat-1', 'proqramlasdirma', 'Proqramlaşdırma', 'Programming', 'Программирование'],
    ['cat-2', 'dizayn', 'Qrafik dizayn', 'Graphic design', 'Графический дизайн'],
    ['cat-3', 'data-elmi', 'Data elmi', 'Data science', 'Наука о данных'],
    ['cat-4', 'reqemsal-marketinq', 'Rəqəmsal marketinq', 'Digital marketing', 'Цифровой маркетинг'],
    ['cat-5', 'kibertehlukesizlik', 'Kibertəhlükəsizlik', 'Cybersecurity', 'Кибербезопасность'],
    ['cat-6', 'xarici-diller', 'Xarici dillər', 'Foreign languages', 'Иностранные языки'],
  ].map(([id, slug, nameAz, nameEn, nameRu], i) => ({ id, nameAz, nameEn, nameRu, slug, createdAt: daysAgo(200 - i) }));

  const T = (id, name, slug, image, posAz, posEn, posRu, bioAz, bioEn, bioRu, d) => ({
    id, name, slug, image, positionAz: posAz, positionEn: posEn, positionRu: posRu, bioAz, bioEn, bioRu, createdAt: daysAgo(d),
  });
  const teachers = [
    T('teacher-1', 'Günel Əliyeva', 'gunel-aliyeva', img('teacher-1'), 'Veb proqramlaşdırma müəllimi', 'Web development instructor', 'Преподаватель веб-разработки',
      'On ildən artıqdır ki, veb tətbiqlər qurur. Tələbələrinə real layihələr üzərində düşünməyi, kodu səliqəli yazmağı və komanda ilə işləməyi öyrədir.',
      'Has been building web applications for over ten years. Teaches students to think in real projects, write clean code and work in a team.',
      'Более десяти лет создаёт веб-приложения. Учит студентов мыслить реальными проектами, писать чистый код и работать в команде.', 190),
    T('teacher-2', 'Rəşad Hüseynov', 'reshad-huseynov', null, 'Data analitikası üzrə mentor', 'Data analytics mentor', 'Ментор по анализу данных',
      'Bank və telekommunikasiya sahələrində analitik kimi çalışıb. Python, SQL və vizuallaşdırma ilə məlumatdan qərara gedən yolu göstərir.',
      'Worked as an analyst in banking and telecom. Shows the path from data to decisions with Python, SQL and visualisation.',
      'Работал аналитиком в банковской и телеком-сфере. Показывает путь от данных к решениям с помощью Python, SQL и визуализации.', 185),
    T('teacher-3', 'İlkin Məmmədov', 'ilkin-mammadov', img('teacher-3'), 'Frontend arxitektoru', 'Frontend architect', 'Frontend-архитектор',
      'React və Next.js ilə böyük interfeyslər qurur. Performans, əlçatanlıq və dizayn sistemləri onun sevimli mövzularıdır.',
      'Builds large interfaces with React and Next.js. Performance, accessibility and design systems are his favourite topics.',
      'Создаёт крупные интерфейсы на React и Next.js. Производительность, доступность и дизайн-системы — его любимые темы.', 170),
    T('teacher-4', 'Şəbnəm Quliyeva', 'shabnam-guliyeva', null, 'UI/UX dizayner', 'UI/UX designer', 'UI/UX-дизайнер',
      'Məhsul dizaynında istifadəçi araşdırmasından prototipə qədər bütün mərhələləri keçib. Dərslərində eskiz və sadəliyə üstünlük verir.',
      'Has gone through every product design stage from user research to prototype. Favours sketching and simplicity in class.',
      'Прошла все этапы продуктового дизайна — от исследований до прототипа. На занятиях делает упор на эскизы и простоту.', 160),
    T('teacher-5', 'Çingiz Babayev', 'chingiz-babayev', img('teacher-5'), 'Kibertəhlükəsizlik mühəndisi', 'Cybersecurity engineer', 'Инженер по кибербезопасности',
      'Şəbəkə təhlükəsizliyi və insident idarəetməsi üzrə mütəxəssisdir. Tələbələrə hücumçunun gözü ilə düşünməyi öyrədir.',
      'Specialist in network security and incident response. Teaches students to think like an attacker.',
      'Специалист по сетевой безопасности и реагированию на инциденты. Учит студентов думать как атакующий.', 150),
    T('teacher-6', 'Ülviyyə Nəsirova', 'ulviyya-nasirova', null, 'Rəqəmsal marketinq strateqi', 'Digital marketing strategist', 'Стратег по цифровому маркетингу',
      'Brendlər üçün sosial media və axtarış kampaniyaları qurur. Ölçmə, test və hekayə danışmağı bir yerdə öyrədir.',
      'Builds social and search campaigns for brands. Teaches measurement, testing and storytelling together.',
      'Ведёт кампании в соцсетях и поиске для брендов. Учит измерению, тестированию и сторителлингу одновременно.', 140),
    T('teacher-7', 'Ömər Səfərov', 'omar-safarov', img('teacher-7'), 'İngilis dili müəllimi', 'English teacher', 'Преподаватель английского языка',
      'IT mütəxəssisləri üçün peşəkar ingilis dili kursları aparır: müsahibə, texniki yazı və təqdimat bacarıqları.',
      'Runs professional English courses for IT specialists: interviews, technical writing and presenting.',
      'Ведёт курсы профессионального английского для IT-специалистов: собеседования, техническое письмо и презентации.', 130),
  ];

  const syllabus = (mods) => JSON.stringify(mods.map((title, i) => ({ week: i + 1, title })));
  const C = (n, slug, catId, teacherId, tAz, tEn, tRu, dAz, dEn, dRu, price, duration, level, image, isPopular, rating, students, mods, d) => ({
    id: `course-${n}`, titleAz: tAz, titleEn: tEn, titleRu: tRu, slug,
    descriptionAz: dAz, descriptionEn: dEn, descriptionRu: dRu,
    categoryId: catId, teacherId, price, duration, level, image, isPopular, rating, studentsCount: students,
    syllabusAz: syllabus(mods[0]), syllabusEn: syllabus(mods[1]), syllabusRu: syllabus(mods[2]),
    createdAt: daysAgo(d), updatedAt: daysAgo(Math.max(0, d - 5)),
  });
  const courses = [
    C(1, 'veb-proqramlasdirma', 'cat-1', 'teacher-1', 'Veb proqramlaşdırma: sıfırdan peşəkarlığa', 'Web development: from zero to professional', 'Веб-разработка: с нуля до профессионала',
      'HTML, CSS və JavaScript-dən başlayaraq Node.js ilə tam funksional veb tətbiqlər qurmağı öyrənəcəksiniz. Hər modul real layihə ilə bitir.',
      'Starting from HTML, CSS and JavaScript you will learn to build complete web applications with Node.js. Every module ends with a real project.',
      'Начиная с HTML, CSS и JavaScript, вы научитесь создавать полноценные веб-приложения на Node.js. Каждый модуль завершается реальным проектом.',
      '350 AZN', '6 ay', 'beginner', img('course-1'), 'true', '4.9', '128',
      [['HTML və semantika', 'CSS: düzülüş və responsiv dizayn', 'JavaScript əsasları', 'Node.js və Express'], ['HTML and semantics', 'CSS layout and responsive design', 'JavaScript basics', 'Node.js and Express'], ['HTML и семантика', 'CSS: вёрстка и адаптивность', 'Основы JavaScript', 'Node.js и Express']], 120),
    C(2, 'python-data-analitikasi', 'cat-3', 'teacher-2', 'Python ilə data analitikası', 'Data analytics with Python', 'Анализ данных на Python',
      'Pandas, NumPy və vizuallaşdırma kitabxanaları ilə məlumatları təmizləmək, təhlil etmək və nəticələri aydın təqdim etmək.',
      'Clean, analyse and clearly present data with pandas, NumPy and visualisation libraries.',
      'Очистка, анализ и наглядная подача данных с pandas, NumPy и библиотеками визуализации.',
      '300 AZN', '4 ay', 'intermediate', null, 'true', '4.8', '96',
      [['Python əsasları', 'Pandas ilə cədvəllər', 'Vizuallaşdırma', 'Yekun layihə'], ['Python basics', 'Tables with pandas', 'Visualisation', 'Final project'], ['Основы Python', 'Таблицы в pandas', 'Визуализация', 'Итоговый проект']], 110),
    C(3, 'ui-ux-dizaynin-esaslari', 'cat-2', 'teacher-4', 'UI/UX dizaynın əsasları', 'UI/UX design fundamentals', 'Основы UI/UX-дизайна',
      'İstifadəçi araşdırması, wireframe, prototip və dizayn sistemləri. Figma-da sıfırdan tam bir mobil tətbiq dizayn edəcəksiniz.',
      'User research, wireframes, prototypes and design systems. You will design a complete mobile app in Figma from scratch.',
      'Исследования пользователей, вайрфреймы, прототипы и дизайн-системы. Вы с нуля спроектируете мобильное приложение в Figma.',
      '280 AZN', '3 ay', 'beginner', img('course-3'), 'false', '4.7', '74',
      [['Araşdırma', 'Wireframe', 'Vizual dizayn', 'Prototip'], ['Research', 'Wireframes', 'Visual design', 'Prototyping'], ['Исследование', 'Вайрфреймы', 'Визуальный дизайн', 'Прототипирование']], 100),
    C(4, 'reqemsal-marketinq-strategiyasi', 'cat-4', 'teacher-6', 'Rəqəmsal marketinq strategiyası', 'Digital marketing strategy', 'Стратегия цифрового маркетинга',
      'Sosial media, axtarış reklamları, e-poçt kampaniyaları və analitika. Kiçik büdcə ilə ölçülə bilən nəticələr əldə etməyi öyrənin.',
      'Social media, search ads, e-mail campaigns and analytics. Learn to get measurable results on a small budget.',
      'Соцсети, поисковая реклама, e-mail-кампании и аналитика. Научитесь получать измеримый результат при небольшом бюджете.',
      '250 AZN', '10 həftə', 'all', null, 'false', '4.6', '58',
      [['Bazar araşdırması', 'Sosial media', 'Reklam kampaniyaları', 'Analitika'], ['Market research', 'Social media', 'Ad campaigns', 'Analytics'], ['Исследование рынка', 'Соцсети', 'Рекламные кампании', 'Аналитика']], 90),
    C(5, 'kibertehlukesizliye-giris', 'cat-5', 'teacher-5', 'Kibertəhlükəsizliyə giriş', 'Introduction to cybersecurity', 'Введение в кибербезопасность',
      'Şəbəkələr, şifrələmə, zəifliklərin aşkarlanması və insidentlərə cavab. Laboratoriya mühitində praktiki tapşırıqlar.',
      'Networks, encryption, vulnerability discovery and incident response. Hands-on tasks in a lab environment.',
      'Сети, шифрование, поиск уязвимостей и реагирование на инциденты. Практические задания в лабораторной среде.',
      '400 AZN', '5 ay', 'intermediate', img('course-5'), 'true', '4.9', '61',
      [['Şəbəkə əsasları', 'Kriptoqrafiya', 'Veb zəiflikləri', 'İnsident idarəetməsi'], ['Networking basics', 'Cryptography', 'Web vulnerabilities', 'Incident response'], ['Основы сетей', 'Криптография', 'Веб-уязвимости', 'Реагирование на инциденты']], 80),
    C(6, 'it-ucun-ingilis-dili', 'cat-6', 'teacher-7', 'İngilis dili: IT mütəxəssisləri üçün', 'English for IT specialists', 'Английский для IT-специалистов',
      'Texniki sənədləri oxumaq, müsahibədən keçmək və komanda ilə rahat ünsiyyət qurmaq üçün peşəkar ingilis dili.',
      'Professional English for reading technical docs, passing interviews and communicating comfortably with a team.',
      'Профессиональный английский для чтения документации, собеседований и свободного общения в команде.',
      null, '12 həftə', 'all', null, 'false', '4.8', '143',
      [['Texniki lüğət', 'Yazılı ünsiyyət', 'Müsahibə', 'Təqdimat'], ['Technical vocabulary', 'Written communication', 'Interviews', 'Presenting'], ['Техническая лексика', 'Письменная коммуникация', 'Собеседование', 'Презентация']], 70),
    C(7, 'react-ve-nextjs', 'cat-1', 'teacher-3', 'React və Next.js ilə müasir interfeyslər', 'Modern interfaces with React and Next.js', 'Современные интерфейсы на React и Next.js',
      'Komponent düşüncəsi, vəziyyət idarəetməsi, server komponentləri və performans optimallaşdırması ilə istehsala hazır tətbiqlər.',
      'Production-ready apps with component thinking, state management, server components and performance optimisation.',
      'Готовые к продакшену приложения: компонентный подход, управление состоянием, серверные компоненты и оптимизация.',
      '380 AZN', '4 ay', 'advanced', img('course-7'), 'false', '5.0', '39',
      [['React əsasları', 'Vəziyyət və effektlər', 'Next.js App Router', 'Performans'], ['React basics', 'State and effects', 'Next.js App Router', 'Performance'], ['Основы React', 'Состояние и эффекты', 'Next.js App Router', 'Производительность']], 60),
    C(8, 'masin-oyrenmesinin-esaslari', 'cat-3', 'teacher-2', 'Maşın öyrənməsinin əsasları', 'Machine learning fundamentals', 'Основы машинного обучения',
      'Reqressiya, təsnifat və klasterləşmə alqoritmlərini sadə dildə, real məlumat dəstləri üzərində öyrənin.',
      'Learn regression, classification and clustering in plain language on real datasets.',
      'Регрессия, классификация и кластеризация простым языком на реальных наборах данных.',
      '420 AZN', '5 ay', 'advanced', null, 'false', '4.7', '27',
      [['Riyazi əsaslar', 'Reqressiya', 'Təsnifat', 'Klasterləşmə'], ['Maths foundations', 'Regression', 'Classification', 'Clustering'], ['Математические основы', 'Регрессия', 'Классификация', 'Кластеризация']], 50),
  ];

  const html = (h2, p1, items, quote, p2) =>
    `<p>${p1}</p><h2>${h2}</h2><ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul><blockquote>${quote}</blockquote><p>${p2}</p>`;
  const P = (n, slug, image, authorId, tAz, tEn, tRu, eAz, eEn, eRu, cAz, cEn, cRu, rt, pub, d) => ({
    id: `post-${n}`, titleAz: tAz, titleEn: tEn, titleRu: tRu, slug, contentAz: cAz, contentEn: cEn, contentRu: cRu,
    excerptAz: eAz, excerptEn: eEn, excerptRu: eRu, image, authorId, readingTime: rt, isPublished: pub, createdAt: daysAgo(d), updatedAt: daysAgo(Math.max(0, d - 1)),
  });
  const posts = [
    P(1, 'proqramlasdirmaya-haradan-baslamali', img('post-1'), 'admin-1', 'Proqramlaşdırmaya haradan başlamalı?', 'Where to start with programming?', 'С чего начать программирование?',
      'İlk dilin seçimi, gündəlik məşq vərdişi və ilk layihənin ideyası haqqında praktik məsləhətlər.',
      'Practical advice on picking a first language, a daily practice habit and an idea for a first project.',
      'Практические советы: выбор первого языка, привычка ежедневной практики и идея первого проекта.',
      html('Üç sadə addım', 'Proqramlaşdırma öyrənmək çətin görünə bilər, amma düzgün ardıcıllıqla hər kəs başlaya bilər.', ['Bir dil seçin və ona sadiq qalın', 'Hər gün ən azı otuz dəqiqə yazın', 'Kiçik, amma bitmiş layihələr qurun'], 'Ən yaxşı dil — bitirdiyiniz layihədə istifadə etdiyiniz dildir.', 'Səbirli olun: ilk ayda gördüyünüz irəliləyiş sonrakı ayların təməlidir.'),
      html('Three simple steps', 'Learning to program can look hard, but anyone can start with the right order.', ['Pick one language and stick to it', 'Write code at least thirty minutes a day', 'Build small but finished projects'], 'The best language is the one used in the project you finish.', 'Be patient: progress in the first month is the foundation for the months after.'),
      html('Три простых шага', 'Учиться программированию кажется сложным, но с правильной последовательностью начать может каждый.', ['Выберите один язык и держитесь его', 'Пишите код хотя бы тридцать минут в день', 'Делайте маленькие, но законченные проекты'], 'Лучший язык — тот, на котором вы закончили проект.', 'Будьте терпеливы: прогресс первого месяца — фундамент следующих.'),
      '5 dəq', 'true', 3),
    P(2, 'dizaynda-ag-bosluq', null, 'admin-2', 'Dizaynda ağ boşluğun gücü', 'The power of white space in design', 'Сила пустого пространства в дизайне',
      'Boşluq heç nə deyil — o, oxucunun gözünə yol göstərən ən sakit dizayn elementidir.',
      'Space is not nothing — it is the quietest design element guiding the reader’s eye.',
      'Пустота — не ничто, это самый тихий элемент дизайна, ведущий взгляд читателя.',
      html('Niyə boşluq vacibdir', 'Sıx səhifə yorur, nəfəs alan səhifə isə oxunur.', ['Başlıq ətrafında geniş boşluq', 'Mətn sütununun eni 60–75 simvol', 'Bölmələr arasında ritm'], 'Dizayn nə əlavə etdiyinizlə deyil, nəyi çıxardığınızla ölçülür.', 'Növbəti layihənizdə hər elementə “bu lazımdırmı?” sualını verin.'),
      html('Why space matters', 'A dense page tires, a breathing page gets read.', ['Generous space around headings', 'Text column of 60–75 characters', 'Rhythm between sections'], 'Design is measured by what you remove, not what you add.', 'In your next project ask every element: “is this needed?”'),
      html('Почему пространство важно', 'Плотная страница утомляет, а «дышащая» — читается.', ['Простор вокруг заголовков', 'Колонка текста 60–75 символов', 'Ритм между разделами'], 'Дизайн измеряется тем, что вы убрали, а не добавили.', 'В следующем проекте спросите каждый элемент: «он нужен?»'),
      '4 dəq', 'true', 9),
    P(3, 'data-ile-qerar-qebulu', img('post-3'), 'admin-1', 'Data analitikası ilə qərar qəbulu', 'Making decisions with data analytics', 'Принятие решений с помощью аналитики данных',
      'Kiçik bizneslər üçün də məlumat əsaslı qərarlar mümkündür: hansı göstəricilərə baxmaq lazımdır?',
      'Data-driven decisions are possible for small businesses too: which metrics should you watch?',
      'Решения на основе данных доступны и малому бизнесу: на какие показатели смотреть?',
      html('Göstəricilər', 'Hər şeyi ölçmək lazım deyil, düzgün şeyi ölçmək lazımdır.', ['Müştəri qazanma xərci', 'Təkrar alış nisbəti', 'Orta səbət dəyəri'], 'Ölçə bilmədiyiniz şeyi idarə edə bilməzsiniz.', 'Həftəlik sadə bir hesabatla başlayın və onu ardıcıl yeniləyin.'),
      html('Metrics', 'You don’t need to measure everything, you need to measure the right thing.', ['Customer acquisition cost', 'Repeat purchase rate', 'Average order value'], 'You can’t manage what you can’t measure.', 'Start with a simple weekly report and keep it updated.'),
      html('Показатели', 'Не нужно измерять всё — нужно измерять правильное.', ['Стоимость привлечения клиента', 'Доля повторных покупок', 'Средний чек'], 'Нельзя управлять тем, что нельзя измерить.', 'Начните с простого еженедельного отчёта и обновляйте его.'),
      '6 dəq', 'true', 15),
    P(4, 'kibertehlukesizlik-gundelik-verdisler', null, null, 'Kibertəhlükəsizlik: gündəlik vərdişlər', 'Cybersecurity: everyday habits', 'Кибербезопасность: ежедневные привычки',
      'Güclü şifrə, iki addımlı doğrulama və şübhəli keçidlərə qarşı diqqət — sadə, amma təsirli.',
      'Strong passwords, two-step verification and care with suspicious links — simple but effective.',
      'Надёжные пароли, двухэтапная проверка и осторожность со ссылками — просто, но эффективно.',
      html('Beş vərdiş', 'Təhlükəsizlik bir dəfəlik iş deyil, vərdişdir.', ['Şifrə meneceri istifadə edin', 'İki addımlı doğrulamanı açın', 'Proqramları vaxtında yeniləyin', 'Şübhəli e-poçtları yoxlayın', 'Ehtiyat nüsxə saxlayın'], 'Ən zəif halqa çox vaxt texnologiya yox, vərdişdir.', 'Bu siyahını bu gün tətbiq edin — sabaha saxlamayın.'),
      html('Five habits', 'Security is not a one-off task, it is a habit.', ['Use a password manager', 'Turn on two-step verification', 'Update software on time', 'Check suspicious e-mails', 'Keep backups'], 'The weakest link is often the habit, not the technology.', 'Apply this list today — don’t leave it for tomorrow.'),
      html('Пять привычек', 'Безопасность — не разовая задача, а привычка.', ['Пользуйтесь менеджером паролей', 'Включите двухэтапную проверку', 'Вовремя обновляйте программы', 'Проверяйте подозрительные письма', 'Делайте резервные копии'], 'Самое слабое звено — чаще привычка, а не технология.', 'Примените этот список сегодня, не откладывайте.'),
      '3 dəq', 'true', 22),
    P(5, 'ingilis-dilini-isle-birlikde', img('post-5'), 'admin-3', 'İngilis dilini işlə birlikdə öyrənmək', 'Learning English alongside work', 'Учить английский вместе с работой',
      'Gündə iyirmi dəqiqə və iş mühitindən götürülmüş real mətnlərlə dil öyrənməyin üsulları.',
      'Ways to learn the language with twenty minutes a day and real texts from your work.',
      'Как учить язык по двадцать минут в день на реальных рабочих текстах.',
      html('Üsullar', 'Dil öyrənmək üçün ayrıca vaxt tapmaq çətindir — onu işə qoşun.', ['Sənədləri ingiliscə oxuyun', 'Kod şərhlərini ingiliscə yazın', 'Həftədə bir dəfə qısa təqdimat edin'], 'Dil məşq olunan bacarıqdır, əzbərlənən fənn deyil.', 'Kiçik addımlar ilin sonunda böyük fərq yaradır.'),
      html('Methods', 'Finding separate time for a language is hard — plug it into your work.', ['Read docs in English', 'Write code comments in English', 'Give a short talk once a week'], 'A language is a practised skill, not a memorised subject.', 'Small steps make a big difference by the end of the year.'),
      html('Методы', 'Найти отдельное время на язык трудно — встройте его в работу.', ['Читайте документацию на английском', 'Пишите комментарии к коду на английском', 'Раз в неделю делайте короткий доклад'], 'Язык — это тренируемый навык, а не заучиваемый предмет.', 'Маленькие шаги к концу года дают большую разницу.'),
      '5 dəq', 'true', 30),
    P(6, 'portfolio-nece-qurulur', null, 'admin-2', 'Portfolio necə qurulur?', 'How to build a portfolio', 'Как собрать портфолио',
      'İşəgötürənin diqqətini çəkən portfolio: az, amma güclü işlər və hər birinin arxasındakı hekayə.',
      'A portfolio that catches an employer’s eye: few but strong works and the story behind each.',
      'Портфолио, которое замечают: немного, но сильных работ и история каждой.',
      html('Struktur', 'Portfolio işlərin siyahısı deyil, düşüncə tərzinizin nümayişidir.', ['Üç–beş ən yaxşı iş', 'Hər iş üçün problem, həll və nəticə', 'Əlaqə məlumatı görünən yerdə'], 'Keyfiyyət kəmiyyətdən həmişə güclüdür.', 'Portfolionu hər yeni layihədən sonra yeniləyin.'),
      html('Structure', 'A portfolio is not a list of works but a display of how you think.', ['Three to five best works', 'Problem, solution and result for each', 'Contact details in plain sight'], 'Quality always beats quantity.', 'Update the portfolio after every new project.'),
      html('Структура', 'Портфолио — не список работ, а демонстрация мышления.', ['Три–пять лучших работ', 'Для каждой: задача, решение, результат', 'Контакты на видном месте'], 'Качество всегда сильнее количества.', 'Обновляйте портфолио после каждого проекта.'),
      '4 dəq', 'true', 41),
    P(7, 'suni-intellekt-ve-tehsil', img('post-7'), 'admin-1', 'Süni intellekt və təhsilin gələcəyi', 'AI and the future of education', 'ИИ и будущее образования',
      'Süni intellekt müəllimi əvəz etmir, amma öyrənmə üsulunu dəyişir. Qaralama.',
      'AI does not replace the teacher, but it changes how we learn. Draft.',
      'ИИ не заменяет учителя, но меняет способ обучения. Черновик.',
      html('Qaralama', 'Bu məqalə hələ hazırlanır.', ['Fərdi öyrənmə', 'Avtomatik rəy', 'Yeni bacarıqlar'], 'Alət nə qədər güclü olsa da, sual verən insandır.', 'Davamı tezliklə.'),
      html('Draft', 'This article is still being written.', ['Personalised learning', 'Automatic feedback', 'New skills'], 'However powerful the tool, the one asking questions is human.', 'More soon.'),
      html('Черновик', 'Статья ещё готовится.', ['Персональное обучение', 'Автоматическая обратная связь', 'Новые навыки'], 'Каким бы мощным ни был инструмент, вопросы задаёт человек.', 'Продолжение скоро.'),
      null, 'false', 1),
  ];

  const F = (n, qAz, qEn, qRu, aAz, aEn, aRu, isActive = true) => ({
    id: `faq-${n}`, question: { az: qAz, en: qEn, ru: qRu }, answer: { az: aAz, en: aEn, ru: aRu }, order: n, isActive, createdAt: daysAgo(100 - n), updatedAt: daysAgo(20 - n),
  });
  const faqs = [
    F(1, 'Kurslara necə qeydiyyatdan keçə bilərəm?', 'How can I enrol in a course?', 'Как записаться на курс?',
      'Kurs səhifəsində “Qeydiyyat” düyməsini sıxın və formu doldurun. Komandamız sizinlə əlaqə saxlayacaq.',
      'Press “Enrol” on the course page and fill in the form. Our team will get in touch.',
      'Нажмите «Записаться» на странице курса и заполните форму. Наша команда свяжется с вами.'),
    F(2, 'Dərslər onlayn, yoxsa əyani keçirilir?', 'Are classes online or in person?', 'Занятия онлайн или очно?',
      'Hər kursun formatı onun səhifəsində göstərilir. Bəzi kurslar hər iki formatda keçirilir.',
      'Each course page shows its format. Some courses run in both formats.',
      'Формат указан на странице каждого курса. Некоторые курсы проходят в обоих форматах.'),
    F(3, 'Ödənişi hissə-hissə etmək mümkündürmü?', 'Can I pay in instalments?', 'Можно ли платить частями?',
      'Bəli, ödəniş planı barədə qeydiyyat zamanı məsləhətçimizlə danışa bilərsiniz.',
      'Yes, you can discuss a payment plan with our adviser during enrolment.',
      'Да, план оплаты можно обсудить с консультантом при записи.'),
    F(4, 'Kursu bitirdikdən sonra sertifikat verilirmi?', 'Do I get a certificate after the course?', 'Выдаётся ли сертификат после курса?',
      'Yekun layihəni uğurla təqdim edən tələbələrə sertifikat təqdim olunur.',
      'Students who successfully present the final project receive a certificate.',
      'Студенты, успешно защитившие итоговый проект, получают сертификат.'),
    F(5, 'Əvvəlcədən təcrübə tələb olunurmu?', 'Is prior experience required?', 'Нужен ли предварительный опыт?',
      '“Başlanğıc” səviyyəli kurslar üçün heç bir təcrübə lazım deyil. Digər kurslar üçün tələblər kurs səhifəsindədir.',
      'No experience is needed for “beginner” courses. Requirements for other courses are on their pages.',
      'Для курсов уровня «начальный» опыт не нужен. Требования к остальным указаны на их страницах.'),
    F(6, 'Dərs buraxsam nə olur?', 'What if I miss a class?', 'Что, если я пропущу занятие?',
      'Dərsin qeydi və materialları tələbə kabinetində əlçatan olur, müəllimdən əlavə sual soruşa bilərsiniz.',
      'The recording and materials are available in the student area, and you can ask the teacher extra questions.',
      'Запись и материалы доступны в кабинете студента, преподавателю можно задать дополнительные вопросы.'),
    F(7, 'Qrupda neçə tələbə olur?', 'How many students are in a group?', 'Сколько студентов в группе?',
      'Qrupların ölçüsü kursdan asılıdır. Dəqiq məlumatı qeydiyyat zamanı alacaqsınız.',
      'Group size depends on the course. You will get exact details during enrolment.',
      'Размер группы зависит от курса. Точную информацию вы получите при записи.', false),
  ];

  const teamMembers = [
    ['team-1', 'Aysel Kərimova', 'Tədris meneceri', 'Head of studies', 'Руководитель учебной части', img('team-1')],
    ['team-2', 'Elvin Rzayev', 'Karyera məsləhətçisi', 'Career adviser', 'Карьерный консультант', null],
    ['team-3', 'Nərmin Əhmədova', 'Marketinq meneceri', 'Marketing manager', 'Менеджер по маркетингу', img('team-3')],
    ['team-4', 'Fərid Qasımov', 'Tələbə xidmətləri koordinatoru', 'Student services coordinator', 'Координатор студенческого сервиса', null],
    ['team-5', 'Səbinə İsmayılova', 'Tədris dizayneri', 'Instructional designer', 'Методист', img('team-5')],
    ['team-6', 'Orxan Cəfərli', 'Texniki dəstək mühəndisi', 'Technical support engineer', 'Инженер техподдержки', null],
  ].map(([id, name, positionAz, positionEn, positionRu, image], i) => ({ id, name, positionAz, positionEn, positionRu, image, order: i + 1, createdAt: daysAgo(150 - i) }));

  const statuses = ['new', 'contacted', 'enrolled', 'cancelled'];
  const leads = [
    ['Nigar Məmmədli', 'nigar.mammadli@example.az', '+994 50 000 00 01', 'Veb proqramlaşdırma: sıfırdan peşəkarlığa'],
    ['Kamran Əsgərov', 'kamran.asgarov@example.az', '+994 55 000 00 02', 'Python ilə data analitikası'],
    ['Lalə Hacıyeva', 'lala.hajiyeva@example.az', '+994 70 000 00 03', 'UI/UX dizaynın əsasları'],
    ['Murad Şirinov', 'murad.shirinov@example.az', '+994 51 000 00 04', 'Kibertəhlükəsizliyə giriş'],
    ['Gülnar Abbasova', 'gulnar.abbasova@example.az', '+994 77 000 00 05', 'İngilis dili: IT mütəxəssisləri üçün'],
    ['Əli Novruzov', 'ali.novruzov@example.az', '+994 99 000 00 06', 'React və Next.js ilə müasir interfeyslər'],
    ['Zəhra Mustafayeva', 'zahra.mustafayeva@example.az', '+994 50 000 00 07', 'Rəqəmsal marketinq strategiyası'],
    ['Ruslan Bağırov', 'ruslan.bagirov@example.az', '+994 55 000 00 08', 'Maşın öyrənməsinin əsasları'],
  ].map(([name, email, phone, course], i) => ({
    id: `lead-${i + 1}`, name, email, phone, course, source: 'website', status: statuses[i % 4], notes: null, createdAt: daysAgo(i, i * 2), updatedAt: daysAgo(i),
  }));

  const contactMessages = [
    ['Səid Əlizadə', 'said.alizade@example.az', '+994 50 000 01 01', 'Kurs cədvəli haqqında', 'Salam! Axşam qrupları üçün dərs cədvəli nə vaxt açıqlanacaq? Mən iş saatlarından sonra iştirak etmək istəyirəm.', 'false'],
    ['Günay Paşayeva', 'gunay.pashayeva@example.az', null, 'Ödəniş planı', 'Ödənişi üç hissəyə bölmək mümkündürmü? Zəhmət olmasa şərtləri yazın.', 'false'],
    ['Emin Vəliyev', 'emin.valiyev@example.az', '+994 70 000 01 03', 'Əməkdaşlıq təklifi', 'Şirkətimiz əməkdaşları üçün korporativ təlim axtarır. Görüş təyin edə bilərikmi?', 'true'],
    ['Aynur Həsənli', 'aynur.hasanli@example.az', null, 'Sertifikat', 'Keçən ay bitirdiyim kursun sertifikatını haradan əldə edə bilərəm?', 'true'],
    ['Tofiq Zeynalov', 'tofiq.zeynalov@example.az', '+994 55 000 01 05', 'Texniki problem', 'Tələbə kabinetinə daxil olanda səhifə açılmır. Kömək edə bilərsinizmi?', 'false'],
    ['Xədicə Rüstəmova', 'xadija.rustamova@example.az', null, 'Müəllim olmaq istəyirəm', 'Dizayn sahəsində səkkiz illik təcrübəm var və sizinlə dərs demək istərdim.', 'true'],
    ['Vüsal Eyvazov', 'vusal.eyvazov@example.az', '+994 99 000 01 07', 'Endirim', 'Tələbələr üçün xüsusi endirim varmı?', 'true'],
  ].map(([name, email, phone, subject, message, isRead], i) => ({ id: `contact-${i + 1}`, name, email, phone, subject, message, isRead, createdAt: daysAgo(i * 2, i) }));

  const newsletterSubscribers = [
    'aysu.qarayeva@example.az', 'ramin.mehdiyev@example.az', 'sevinc.ibrahimova@example.az', 'elnur.salmanov@example.az',
    'konul.nabiyeva@example.az', 'cavid.tagiyev@example.az', 'ulkar.hasanova@example.az', 'farhad.sadiqov@example.az',
  ].map((email, i) => ({ id: `sub-${i + 1}`, email, status: i === 5 ? 'unsubscribed' : 'active', createdAt: daysAgo(i * 3, i) }));

  const db = { admins, categories, teachers, courses, posts, faqs, teamMembers, leads, contactMessages, newsletterSubscribers };
  if (BULK > 0) for (const key of Object.keys(db)) db[key] = bulk(db[key], BULK);
  return db;
}

/** Pad a list to `n` items with deterministic copies ("… (2)", slug-2, id-2, older dates). */
function bulk(list, n) {
  const outList = [...list];
  for (let k = 0; outList.length < n; k += 1) {
    const src = list[k % list.length];
    const copy = Math.floor(k / list.length) + 2;
    const c = structuredClone(src);
    c.id = `${src.id}-${copy}`;
    for (const f of ['slug']) if (c[f]) c[f] = `${src[f]}-${copy}`;
    for (const f of ['email']) if (c[f]) c[f] = c[f].replace('@', `+${copy}@`);
    for (const f of ['name', 'titleAz', 'titleEn', 'titleRu', 'nameAz', 'nameEn', 'nameRu', 'subject']) if (typeof c[f] === 'string') c[f] = `${src[f]} (${copy})`;
    if (c.question) for (const l of ['az', 'en', 'ru']) c.question[l] = `${src.question[l]} (${copy})`;
    if (typeof c.order === 'number') c.order = outList.length + 1;
    if (c.image) c.image = c.image.replace(/([\w-]+)\.png$/, `$1-${copy}.png`);
    for (const f of ['createdAt', 'updatedAt']) if (c[f]) c[f] = new Date(Date.parse(src[f]) - copy * 7 * 86400000).toISOString();
    outList.push(c);
  }
  return outList;
}

let db = fixtures();
let lastLoginId = 'admin-1';
let seq = 1000;
const newId = (prefix) => `${prefix}-${(seq += 1)}`;
const nowIso = () => new Date().toISOString();

/* ------------------------------------------------------------------ shapers (mirror the controllers) */
const cap = (l) => l.charAt(0).toUpperCase() + l.slice(1);
const pick = (row, base, locale) => row[`${base}${cap(locale)}`] ?? row[`${base}Az`];
const pickOr = (row, base, locale) => row[`${base}${cap(locale)}`] || row[`${base}Az`]; // post controller uses ||
const byId = (list, id) => list.find((x) => x.id === id) || null;

// course.repository.mapToCourseRow (snake_case join row)
function courseRow(c) {
  const cat = byId(db.categories, c.categoryId);
  const t = byId(db.teachers, c.teacherId);
  return {
    id: c.id, title_az: c.titleAz, title_en: c.titleEn, title_ru: c.titleRu, slug: c.slug,
    description_az: c.descriptionAz, description_en: c.descriptionEn, description_ru: c.descriptionRu,
    category_id: c.categoryId, teacher_id: c.teacherId, price: c.price, duration: c.duration, level: c.level, image: c.image,
    is_popular: c.isPopular, rating: c.rating, students_count: c.studentsCount,
    syllabus_az: c.syllabusAz, syllabus_en: c.syllabusEn, syllabus_ru: c.syllabusRu, created_at: c.createdAt,
    category_az: cat?.nameAz, category_en: cat?.nameEn, category_ru: cat?.nameRu, category_slug: cat?.slug,
    teacher_name: t?.name, teacher_image: t?.image,
    teacher_position_az: t?.positionAz, teacher_position_en: t?.positionEn, teacher_position_ru: t?.positionRu,
    teacher_bio_az: t?.bioAz, teacher_bio_en: t?.bioEn, teacher_bio_ru: t?.bioRu,
  };
}
const snake = (row, base, locale) => row[`${base}_${locale}`] ?? row[`${base}_az`];
function coursePublic(c, locale, detail = false) {
  const r = courseRow(c);
  const out = {
    id: r.id, slug: r.slug, title: snake(r, 'title', locale), description: snake(r, 'description', locale),
    price: r.price, duration: r.duration, level: r.level, image: r.image,
    isPopular: r.is_popular === 'true' || r.is_popular === true, rating: r.rating, studentsCount: r.students_count,
  };
  if (detail) out.syllabus = snake(r, 'syllabus', locale);
  out.category = { name: snake(r, 'category', locale), slug: r.category_slug };
  out.teacher = detail
    ? { name: r.teacher_name, image: r.teacher_image, bio: snake(r, 'teacher_bio', locale), position: snake(r, 'teacher_position', locale) }
    : { name: r.teacher_name, image: r.teacher_image, position: snake(r, 'teacher_position', locale) };
  return out;
}
const coursesSorted = () =>
  [...db.courses].sort((a, b) => (b.isPopular > a.isPopular ? 1 : b.isPopular < a.isPopular ? -1 : Date.parse(b.createdAt) - Date.parse(a.createdAt)));

const teacherPublic = (t, locale) => ({ id: t.id, name: t.name, slug: t.slug, image: t.image, bio: pick(t, 'bio', locale), position: pick(t, 'position', locale) });

const authorOf = (p) => {
  const a = byId(db.admins, p.authorId);
  return a ? { id: a.id, name: a.name } : null;
};
const postsSorted = () => [...db.posts].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

const adminPublic = (a) => ({ id: a.id, email: a.email, name: a.name, isSuperAdmin: a.isSuperAdmin, createdAt: a.createdAt, updatedAt: a.updatedAt });

/* ------------------------------------------------------------------ mock images (PNG encoder, no deps) */
const CRC = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
const crc32 = (buf) => {
  let c = -1;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};
// tone t in [0,1]: 0 = white, 0.5 = #5C000E, 1 = black (the colour-law polyline)
const tone = (t) => {
  const W = [255, 255, 255];
  const R = [92, 0, 14];
  const K = [0, 0, 0];
  const [a, b, u] = t <= 0.5 ? [W, R, t * 2] : [R, K, (t - 0.5) * 2];
  return a.map((v, i) => Math.round(v + (b[i] - v) * u));
};
const hash = (s) => [...s].reduce((h, ch) => (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0, 7);
const pngCache = new Map();
function mockPng(name, w, h) {
  const key = `${name}|${w}|${h}`;
  if (pngCache.has(key)) return pngCache.get(key);
  const s = hash(name);
  const cx = (0.25 + ((s % 50) / 100)) * w;
  const cy = (0.3 + (((s >> 6) % 40) / 100)) * h;
  const rad = Math.min(w, h) * (0.18 + ((s >> 12) % 10) / 100);
  const period = 10 + (s % 9);
  const raw = Buffer.alloc((w * 3 + 1) * h);
  let o = 0;
  for (let y = 0; y < h; y += 1) {
    raw[o++] = 0;
    for (let x = 0; x < w; x += 1) {
      let t = 0.1 + (0.5 * y) / h; // parchment -> wine
      if (Math.sin((x + y) / period) > 0.82) t += 0.08; // fine diagonal hatching
      const d = Math.hypot(x - cx, y - cy);
      if (d < rad) t = 0.22 + (0.12 * d) / rad; // soft disc
      else if (d < rad + 3) t = 0.5; // wine ring
      const [r, g, b] = tone(Math.min(1, t));
      raw[o++] = r;
      raw[o++] = g;
      raw[o++] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
  if (pngCache.size > 200) pngCache.clear();
  pngCache.set(key, png);
  return png;
}
function mockSvg(name, w, h) {
  const s = hash(name);
  const rgb = (t) => `rgb(${tone(t).join(',')})`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${rgb(0.1)}"/><stop offset="1" stop-color="${rgb(0.6)}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/><circle cx="${(0.25 + (s % 50) / 100) * w}" cy="${(0.3 + ((s >> 6) % 40) / 100) * h}" r="${Math.min(w, h) * 0.2}" fill="${rgb(0.25)}" stroke="${rgb(0.5)}" stroke-width="3"/></svg>`;
}

/* ------------------------------------------------------------------ http helpers */
const ok = (data, message, status = 200) => ({ status, body: { success: true, ...(message !== undefined && { message }), ...(data !== undefined && { data }) } });
const fail = (status, message, extra = {}) => ({ status, body: { success: false, message, ...extra } });

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const buf = Buffer.concat(chunks);
      const type = req.headers['content-type'] || '';
      if (!buf.length) return resolve({});
      if (type.includes('application/json')) {
        try {
          return resolve(JSON.parse(buf.toString('utf8')));
        } catch {
          return resolve({ __invalidJson: true });
        }
      }
      if (type.includes('application/x-www-form-urlencoded')) return resolve(Object.fromEntries(new URLSearchParams(buf.toString('utf8'))));
      return resolve({ __raw: buf.length, __type: type });
    });
  });
}
const cookies = (req) => Object.fromEntries((req.headers.cookie || '').split(/;\s*/).filter(Boolean).map((c) => [c.split('=')[0], decodeURIComponent(c.split('=').slice(1).join('='))]));

// tokens: mock-access.<adminId>.<n>
let tokenSeq = 0;
const issueToken = (id) => `mock-access.${id}.${(tokenSeq += 1)}`;
const tokenUser = (req) => {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return { error: 'Unauthorized: Missing token' };
  const m = h.slice(7).match(/^mock-access\.(.+)\.\d+$/);
  const user = m && byId(db.admins, m[1]);
  return user ? { user } : { error: 'Unauthorized: Invalid or expired token' };
};
const REFRESH_COOKIE = 'refreshToken=mock-refresh; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800';
const CLEAR_COOKIE = 'refreshToken=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validate = (body, rules) => {
  for (const [field, test, msg] of rules) if (!test(body?.[field])) return msg;
  return null;
};
const str = (min) => (v) => typeof v === 'string' && v.length >= min;

/* ------------------------------------------------------------------ routes */
// [method, pattern, handler(ctx) -> {status, body, headers?, raw?}, { auth }]
const routes = [];
const route = (method, pattern, handler, opts = {}) => {
  const keys = [];
  const rx = new RegExp(`^${pattern.replace(/:(\w+)/g, (_, k) => (keys.push(k), '([^/]+)'))}/?$`);
  routes.push({ method, pattern, rx, keys, handler, auth: !!opts.auth });
};
const A = { auth: true };

route('GET', '/api/health', () => ({ status: 200, body: { status: 'ok', timestamp: nowIso(), environment: 'mock', version: '0.1.0' } }));

/* auth */
route('POST', '/api/auth/login', ({ body }) => {
  const { email, password } = body || {};
  if (!email || !password) return fail(400, 'Email və şifrə tələb olunur.');
  if (password === 'wrong') return fail(401, 'Yanlış email və ya şifrə.');
  let user = db.admins.find((a) => a.email.toLowerCase() === String(email).toLowerCase());
  if (!user) user = db.admins.find((a) => a.isSuperAdmin) || db.admins[0];
  lastLoginId = user.id;
  return {
    ...ok({ accessToken: issueToken(user.id), refreshToken: 'mock-refresh', user: { id: user.id, email: user.email, name: user.name, isSuperAdmin: user.isSuperAdmin } }, 'Giriş uğurludur.'),
    headers: { 'Set-Cookie': REFRESH_COOKIE },
  };
});
route('POST', '/api/auth/refresh', ({ req, body }) => {
  const token = body?.refreshToken || cookies(req).refreshToken;
  if (!token) return fail(401, 'Yeniləmə tokeni tapılmadı.');
  const user = byId(db.admins, lastLoginId) || db.admins[0];
  return {
    ...ok({ accessToken: issueToken(user.id), refreshToken: 'mock-refresh', user: { id: user.id, email: user.email, name: user.name, isSuperAdmin: user.isSuperAdmin } }, 'Token yeniləndi.'),
    headers: { 'Set-Cookie': REFRESH_COOKIE },
  };
});
route('POST', '/api/auth/logout', () => ({ ...ok(undefined, 'Çıxış uğurludur.'), headers: { 'Set-Cookie': CLEAR_COOKIE } }));
route('GET', '/api/auth/me', ({ user }) => ok({ id: user.id, email: user.email, name: user.name, isSuperAdmin: user.isSuperAdmin }), A); // mock-only

/* courses */
route('GET', '/api/courses', ({ q }) => {
  const locale = q.get('locale') ?? 'az';
  const category = q.get('category') ?? '';
  const list = category
    ? [...db.courses].filter((c) => byId(db.categories, c.categoryId)?.slug === category).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    : coursesSorted();
  return ok(list.map((c) => coursePublic(c, locale)));
});
route('GET', '/api/courses/categories', () => ok([...db.categories].sort((a, b) => a.nameAz.localeCompare(b.nameAz, 'az'))));
route('GET', '/api/courses/admin/list', () => ok(coursesSorted().map(courseRow)), A);
route('POST', '/api/courses/admin', ({ body }) => {
  const c = { id: newId('course'), level: 'beginner', isPopular: 'false', rating: '5.0', studentsCount: '0', image: null, price: null, duration: null, categoryId: null, teacherId: null, syllabusAz: null, syllabusEn: null, syllabusRu: null, ...body, createdAt: nowIso(), updatedAt: nowIso() };
  db.courses.push(c);
  return ok(c, 'Kurs uğurla yaradıldı'); // real controller passes 201 in the wrong argument -> 200
}, A);
route('PUT', '/api/courses/admin/:id', ({ params, body }) => {
  const c = byId(db.courses, params.id);
  if (!c) return fail(404, 'Kurs tapılmadı');
  Object.assign(c, body, { id: c.id, updatedAt: nowIso() });
  return ok(c, 'Kurs uğurla yeniləndi');
}, A);
route('DELETE', '/api/courses/admin/:id', ({ params }) => {
  const i = db.courses.findIndex((x) => x.id === params.id);
  if (i < 0) return fail(404, 'Kurs tapılmadı');
  const [d] = db.courses.splice(i, 1);
  return ok(d, 'Kurs uğurla silindi');
}, A);
route('GET', '/api/courses/:slug', ({ params, q }) => {
  const c = db.courses.find((x) => x.slug === params.slug);
  if (!c) return fail(404, 'Kurs tapılmadı');
  return ok(coursePublic(c, q.get('locale') ?? 'az', true));
});

/* categories */
const categoryRules = [
  ['nameAz', str(1), 'Azərbaycan dilində ad mütləqdir'],
  ['nameEn', str(1), 'İngilis dilində ad mütləqdir'],
  ['nameRu', str(1), 'Rus dilində ad mütləqdir'],
  ['slug', str(1), 'Slug mütləqdir'],
];
const zodFail = (msg) => fail(400, msg, { errorCode: 'VALIDATION_ERROR' });
route('GET', '/api/categories', () => ok(db.categories));
route('POST', '/api/categories/admin', ({ body }) => {
  const err = validate(body, categoryRules);
  if (err) return zodFail(err);
  const c = { id: newId('cat'), nameAz: body.nameAz, nameEn: body.nameEn, nameRu: body.nameRu, slug: body.slug, createdAt: nowIso() };
  db.categories.push(c);
  return ok(c, 'Kateqoriya uğurla yaradıldı', 201);
}, A);
route('PUT', '/api/categories/admin/:id', ({ params, body }) => {
  const err = validate(body, categoryRules);
  if (err) return zodFail(err);
  const c = byId(db.categories, params.id);
  if (!c) return fail(404, 'Kateqoriya tapılmadı');
  Object.assign(c, { nameAz: body.nameAz, nameEn: body.nameEn, nameRu: body.nameRu, slug: body.slug });
  return ok(c, 'Kateqoriya uğurla yeniləndi');
}, A);
route('DELETE', '/api/categories/admin/:id', ({ params }) => {
  const i = db.categories.findIndex((x) => x.id === params.id);
  if (i < 0) return fail(404, 'Kateqoriya tapılmadı');
  const [d] = db.categories.splice(i, 1);
  return ok(d, 'Kateqoriya uğurla silindi');
}, A);

/* teachers */
const teacherFields = (b) => ({
  name: b.name, slug: b.slug, image: b.image ?? '', bioAz: b.bioAz ?? '', bioEn: b.bioEn ?? '', bioRu: b.bioRu ?? '',
  positionAz: b.positionAz ?? '', positionEn: b.positionEn ?? '', positionRu: b.positionRu ?? '',
});
const teacherRules = [['name', str(2), 'Ad mütləqdir'], ['slug', str(1), 'Slug mütləqdir']];
route('GET', '/api/teachers/admin/list', () => ok(db.teachers), A);
route('POST', '/api/teachers/admin', ({ body }) => {
  const err = validate(body, teacherRules);
  if (err) return zodFail(err);
  const t = { id: newId('teacher'), ...teacherFields(body), createdAt: nowIso() };
  db.teachers.push(t);
  return ok(t, 'Müəllim uğurla yaradıldı', 201);
}, A);
route('PUT', '/api/teachers/admin/:id', ({ params, body }) => {
  const err = validate(body, teacherRules);
  if (err) return zodFail(err);
  const t = byId(db.teachers, params.id);
  if (!t) return fail(404, 'Müəllim tapılmadı');
  Object.assign(t, teacherFields(body));
  return ok(t, 'Müəllim uğurla yeniləndi');
}, A);
route('DELETE', '/api/teachers/admin/:id', ({ params }) => {
  const i = db.teachers.findIndex((x) => x.id === params.id);
  if (i < 0) return fail(404, 'Müəllim tapılmadı');
  const [d] = db.teachers.splice(i, 1);
  return ok(d, 'Müəllim uğurla silindi');
}, A);
route('GET', '/api/teachers', ({ q }) => ok(db.teachers.map((t) => teacherPublic(t, q.get('locale') ?? 'az'))));
route('GET', '/api/teachers/:slug', ({ params, q }) => {
  const locale = q.get('locale') ?? 'az';
  const t = db.teachers.find((x) => x.slug === params.slug);
  if (!t) return fail(404, 'Müəllim tapılmadı');
  const courses = db.courses.filter((c) => c.teacherId === t.id).map((c) => {
    const cat = byId(db.categories, c.categoryId);
    return {
      id: c.id, slug: c.slug, title: pick(c, 'title', locale), description: pick(c, 'description', locale), image: c.image,
      price: c.price, duration: c.duration, level: c.level, rating: c.rating,
      isPopular: c.isPopular, // real API returns the raw 'true' / 'false' string here
      category: cat ? { id: cat.id, name: pick(cat, 'name', locale), slug: cat.slug } : { id: 'default', name: 'Genel', slug: 'general' },
    };
  });
  return ok({ ...teacherPublic(t, locale), courses });
});

/* blog */
route('GET', '/api/blog', ({ q }) => {
  const locale = q.get('locale') ?? 'az';
  const exclude = q.get('excludeSlug');
  const limit = q.get('limit') ? parseInt(q.get('limit'), 10) : 100;
  const list = postsSorted().filter((p) => p.isPublished === 'true' && (!exclude || p.slug !== exclude)).slice(0, limit || 100);
  return ok(list.map((p) => ({
    id: p.id, slug: p.slug, title: pickOr(p, 'title', locale), excerpt: pickOr(p, 'excerpt', locale), image: p.image,
    readingTime: p.readingTime, createdAt: p.createdAt, author: authorOf(p),
  })));
});
route('GET', '/api/blog/admin/list', () => ok(postsSorted().map((p) => ({ post: p, author: authorOf(p) }))), A);
route('GET', '/api/blog/admin/:slug', ({ params }) => {
  const p = db.posts.find((x) => x.slug === params.slug);
  return p ? ok(p) : fail(404, 'Məqalə tapılmadı');
}, A);
route('GET', '/api/blog/:slug', ({ params, q }) => {
  const locale = q.get('locale') ?? 'az';
  const p = db.posts.find((x) => x.slug === params.slug); // real API does not filter unpublished here
  if (!p) return fail(404, 'Məqalə tapılmadı');
  return ok({
    id: p.id, slug: p.slug, title: pickOr(p, 'title', locale), content: pickOr(p, 'content', locale), excerpt: pickOr(p, 'excerpt', locale),
    image: p.image, readingTime: p.readingTime, createdAt: p.createdAt, updatedAt: p.updatedAt, author: authorOf(p),
  });
});
route('POST', '/api/blog', ({ body, user }) => {
  const p = { id: newId('post'), image: null, readingTime: null, isPublished: 'true', excerptAz: null, excerptEn: null, excerptRu: null, ...body, authorId: user.id, createdAt: nowIso(), updatedAt: nowIso() };
  db.posts.push(p);
  return ok(p, undefined, 201);
}, A);
route('PUT', '/api/blog/:id', ({ params, body }) => {
  const p = byId(db.posts, params.id);
  if (!p) return fail(404, 'Məqalə tapılmadı');
  Object.assign(p, body, { id: p.id, updatedAt: nowIso() });
  return ok(p);
}, A);
route('DELETE', '/api/blog/:id', ({ params }) => {
  const i = db.posts.findIndex((x) => x.id === params.id);
  if (i < 0) return fail(404, 'Məqalə tapılmadı');
  db.posts.splice(i, 1);
  return ok(undefined, 'Məqalə silindi');
}, A);

/* leads */
route('POST', '/api/leads', ({ body }) => {
  const err = validate(body, [
    ['name', str(2), 'Ad çox qısadır'],
    ['email', (v) => typeof v === 'string' && emailRx.test(v), 'Düzgün email daxil edin'],
    ['phone', str(7), 'Düzgün telefon nömrəsi daxil edin'],
    ['course', str(1), 'Kurs seçimi mütləqdir'],
  ]);
  if (err) return fail(400, err);
  const l = { id: newId('lead'), name: body.name, email: body.email, phone: body.phone, course: body.course, source: 'website', status: 'new', notes: null, createdAt: nowIso(), updatedAt: nowIso() };
  db.leads.push(l);
  return ok(l, 'Müraciət uğurla göndərildi', 201);
});
const leadsSorted = () => [...db.leads].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
route('GET', '/api/leads', () => ok(leadsSorted(), 'Müraciətlər gətirildi'), A);
route('GET', '/api/leads/export', () => {
  let csv = 'ID,Ad,Email,Telefon,Kurs,Status,Mənbə,Tarix\n';
  for (const l of leadsSorted()) csv += `"${l.id}","${l.name}","${l.email}","${l.phone || ''}","${l.course || ''}","${l.status}","${l.source || ''}","${l.createdAt}"\n`;
  return { status: 200, raw: csv, headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename=leads-export.csv' } };
}, A);
route('PATCH', '/api/leads/:id/status', ({ params, body }) => {
  const l = byId(db.leads, params.id);
  if (!l) return fail(404, 'Müraciət tapılmadı');
  l.status = body.status;
  l.updatedAt = nowIso();
  return ok(l, 'Status yeniləndi');
}, A);

/* contacts */
route('POST', '/api/contacts', ({ body }) => {
  const err = validate(body, [
    ['name', str(2), 'Ad çox qısadır'],
    ['email', (v) => typeof v === 'string' && emailRx.test(v), 'Düzgün email daxil edin'],
    ['subject', str(3), 'Mövzu çox qısadır'],
    ['message', str(10), 'Mesaj çox qısadır'],
  ]);
  if (err) return fail(400, err);
  const m = { id: newId('contact'), name: body.name, email: body.email, phone: null, subject: body.subject, message: body.message, isRead: 'false', createdAt: nowIso() };
  db.contactMessages.push(m);
  return ok(m, 'Mesajınız uğurla göndərildi', 201);
});
route('GET', '/api/contacts', () => ok([...db.contactMessages].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)), 'Mesajlar gətirildi'), A);
route('PATCH', '/api/contacts/:id/read', ({ params }) => {
  const m = byId(db.contactMessages, params.id);
  if (!m) return fail(404, 'Mesaj tapılmadı');
  m.isRead = 'true';
  return ok(m, 'Mesaj oxunmuş kimi qeyd edildi');
}, A);

/* newsletter */
route('POST', '/api/newsletter/subscribe', ({ body }) => {
  if (typeof body?.email !== 'string' || !emailRx.test(body.email)) return fail(400, 'Düzgün email daxil edin');
  let s = db.newsletterSubscribers.find((x) => x.email === body.email);
  if (s) s.status = 'active';
  else db.newsletterSubscribers.push((s = { id: newId('sub'), email: body.email, status: 'active', createdAt: nowIso() }));
  return ok(s, 'Abunəliyiniz uğurla tamamlandı'); // real API answers 200 here
});
route('GET', '/api/newsletter', () => ok([...db.newsletterSubscribers].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)), 'Abunəçilər gətirildi'), A);

/* admin */
route('GET', '/api/admin/stats', () => {
  const chartData = [];
  for (let d = 6; d >= 0; d -= 1) {
    const day = new Date(BASE_DATE - d * 86400000);
    day.setUTCHours(0, 0, 0, 0);
    const iso = day.toISOString();
    const n = db.leads.filter((l) => l.createdAt.slice(0, 10) === iso.slice(0, 10)).length;
    if (n) chartData.push({ date: iso, count: String(n) }); // Postgres COUNT(*) -> bigint string, empty days absent
  }
  return ok({ counts: { leads: db.leads.length, subscribers: db.newsletterSubscribers.length, posts: db.posts.length, messages: db.contactMessages.length }, chartData }, 'Statistikalar gətirildi');
}, A);
route('GET', '/api/admin/users', () => ok(db.admins.map(adminPublic), 'Adminlər siyahısı'), A);
route('POST', '/api/admin/users', ({ body, user }) => {
  if (!user.isSuperAdmin) return fail(403, 'Yalnız Super Admin yeni istifadəçi yarada bilər');
  if (db.admins.some((a) => a.email === body.email)) return fail(400, 'Bu email ilə artıq hesab mövcuddur');
  const a = { id: newId('admin'), email: body.email, name: body.name, isSuperAdmin: !!body.isSuperAdmin, createdAt: nowIso(), updatedAt: nowIso() };
  db.admins.push(a);
  return ok(adminPublic(a), 'Admin uğurla yaradıldı', 201);
}, A);
route('DELETE', '/api/admin/users/:id', ({ params, user }) => {
  if (!user.isSuperAdmin) return fail(403, 'Yalnız Super Admin istifadəçi silə bilər');
  if (user.id === params.id) return fail(403, 'Öz hesabınızı silə bilməzsiniz');
  const i = db.admins.findIndex((a) => a.id === params.id);
  if (i < 0) return fail(404, 'Admin tapılmadı');
  if (db.admins.length <= 1) return fail(400, 'Sistemdəki son admin silinə bilməz');
  db.admins.splice(i, 1);
  return ok(undefined, 'Admin uğurla silindi');
}, A);
route('PUT', '/api/admin/profile', ({ body, user }) => {
  if (db.admins.some((a) => a.email === body.email && a.id !== user.id)) return fail(400, 'Bu email başqa hesaba aiddir');
  Object.assign(user, { name: body.name ?? user.name, email: body.email ?? user.email, updatedAt: nowIso() });
  return ok(adminPublic(user), 'Profil uğurla yeniləndi');
}, A);
route('PUT', '/api/admin/profile/password', ({ body }) => {
  if (body.oldPassword === 'wrong') return fail(400, 'Mövcud şifrə yalnışdır');
  return ok(undefined, 'Şifrə uğurla dəyişdirildi. Zəhmət olmasa yenidən daxil olun.');
}, A);

/* faqs */
const faqsSorted = (all) => [...db.faqs].filter((f) => all || f.isActive).sort((a, b) => a.order - b.order);
route('GET', '/api/faqs', () => ok(faqsSorted(false), 'FAQs retrieved successfully'));
route('GET', '/api/faqs/admin/all', () => ok(faqsSorted(true), 'All FAQs retrieved successfully'), A);
const faqValid = (b, partial) => {
  for (const k of ['question', 'answer']) {
    if (b[k] === undefined && partial) continue;
    if (!b[k] || ['az', 'en', 'ru'].some((l) => !str(1)(b[k][l]))) return `${k}: Required`;
  }
  return null;
};
route('POST', '/api/faqs/admin', ({ body }) => {
  const err = faqValid(body, false);
  if (err) return zodFail(err);
  const f = { id: newId('faq'), question: body.question, answer: body.answer, order: body.order ?? 0, isActive: body.isActive ?? true, createdAt: nowIso(), updatedAt: nowIso() };
  db.faqs.push(f);
  return ok(f, 'FAQ created successfully', 201);
}, A);
route('PUT', '/api/faqs/admin/:id/status', ({ params, body }) => {
  if (typeof body.isActive !== 'boolean') return zodFail('isActive: Expected boolean');
  const f = byId(db.faqs, params.id);
  if (!f) return fail(404, 'FAQ not found');
  Object.assign(f, { isActive: body.isActive, updatedAt: nowIso() });
  return ok(f, `FAQ ${body.isActive ? 'activated' : 'deactivated'} successfully`);
}, A);
route('PUT', '/api/faqs/admin/:id', ({ params, body }) => {
  const err = faqValid(body, true);
  if (err) return zodFail(err);
  const f = byId(db.faqs, params.id);
  if (!f) return fail(404, 'FAQ not found');
  for (const k of ['question', 'answer', 'order', 'isActive']) if (body[k] !== undefined) f[k] = body[k];
  f.updatedAt = nowIso();
  return ok(f, 'FAQ updated successfully');
}, A);
route('DELETE', '/api/faqs/admin/:id', ({ params }) => {
  const i = db.faqs.findIndex((x) => x.id === params.id);
  if (i < 0) return fail(404, 'FAQ not found');
  db.faqs.splice(i, 1);
  return ok(undefined, 'FAQ deleted successfully');
}, A);

/* team */
const teamRules = [
  ['name', str(2), 'Ad mütləqdir'],
  ['positionAz', str(1), 'Azərbaycan dilində vəzifə mütləqdir'],
  ['positionEn', str(1), 'İngilis dilində vəzifə mütləqdir'],
  ['positionRu', str(1), 'Rus dilində vəzifə mütləqdir'],
];
const teamFields = (b) => ({ name: b.name, positionAz: b.positionAz, positionEn: b.positionEn, positionRu: b.positionRu, image: b.image ?? '', order: Number.isNaN(Number(b.order)) ? 0 : Number(b.order ?? 0) });
route('GET', '/api/team', ({ q }) => {
  const locale = q.get('locale') ?? 'az';
  return ok([...db.teamMembers].sort((a, b) => a.order - b.order).map((m) => ({ id: m.id, name: m.name, image: m.image, position: pick(m, 'position', locale), order: m.order })));
});
route('POST', '/api/team/admin', ({ body }) => {
  const err = validate(body, teamRules);
  if (err) return zodFail(err);
  const m = { id: newId('team'), ...teamFields(body), createdAt: nowIso() };
  db.teamMembers.push(m);
  return ok(m, 'Komanda üzvü uğurla yaradıldı', 201);
}, A);
route('PUT', '/api/team/admin/:id', ({ params, body }) => {
  const err = validate(body, teamRules);
  if (err) return zodFail(err);
  const m = byId(db.teamMembers, params.id);
  if (!m) return fail(404, 'Komanda üzvü tapılmadı');
  Object.assign(m, teamFields(body));
  return ok(m, 'Komanda üzvü uğurla yeniləndi');
}, A);
route('DELETE', '/api/team/admin/:id', ({ params }) => {
  const i = db.teamMembers.findIndex((x) => x.id === params.id);
  if (i < 0) return fail(404, 'Komanda üzvü tapılmadı');
  const [d] = db.teamMembers.splice(i, 1);
  return ok(d, 'Komanda üzvü uğurla silindi');
}, A);

/* upload */
let uploadSeq = 0;
route('POST', '/api/upload', ({ body }) => {
  if (!body.__raw) return fail(400, 'Fayl tapılmadı');
  return ok({ url: imageUrl(`upload-${(uploadSeq += 1)}`) }, undefined, 201); // real API: "/uploads/<file>" relative path
}, A);
route('POST', '/api/upload/signature', () => ok({ signature: 'mock-signature-0000000000000000', cloudName: 'mock-cloud', apiKey: 'mock-api-key' }), A);

/* mock-only */
route('GET', '/api/mock-image/:file', ({ params, q }) => {
  const m = params.file.match(/^([\w.-]+?)\.(png|svg)$/);
  if (!m) return fail(404, 'Unknown mock image');
  const w = Math.min(2000, Math.max(16, Number(q.get('w')) || 960));
  const h = Math.min(2000, Math.max(16, Number(q.get('h')) || 600));
  return m[2] === 'svg'
    ? { status: 200, raw: mockSvg(m[1], w, h), headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' } }
    : { status: 200, raw: mockPng(m[1], w, h), headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' } };
});
route('POST', '/api/__mock/reset', () => {
  db = fixtures();
  lastLoginId = 'admin-1';
  return ok({ reset: true });
});

/* ------------------------------------------------------------------ server */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const origin = req.headers.origin;
  const cors = {
    'Access-Control-Allow-Origin': origin || '*',
    ...(origin && { 'Access-Control-Allow-Credentials': 'true', Vary: 'Origin' }),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': req.headers['access-control-request-headers'] || 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    'Access-Control-Expose-Headers': 'Content-Disposition',
    'Access-Control-Max-Age': '600',
  };
  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors);
    return res.end();
  }
  const started = Date.now();
  const body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) ? await readBody(req) : {};
  let result;
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const hit = routes.find((r) => r.method === req.method && r.rx.test(path));
  if (!hit) {
    const other = routes.find((r) => r.rx.test(path));
    process.stderr.write(`[mock-api] ${other ? 405 : 404} ${req.method} ${url.pathname}${url.search}\n`);
    result = other ? fail(405, `Method ${req.method} not allowed on ${url.pathname}`) : fail(404, `Mock API: no route for ${req.method} ${url.pathname}`);
  } else if (body.__invalidJson) {
    result = fail(400, 'Invalid JSON body');
  } else {
    const params = Object.fromEntries(hit.keys.map((k, i) => [k, decodeURIComponent(path.match(hit.rx)[i + 1])]));
    let user = null;
    if (hit.auth) {
      const t = tokenUser(req);
      if (t.error) result = fail(401, t.error);
      user = t.user;
    }
    if (!result) {
      try {
        result = hit.handler({ req, params, q: url.searchParams, body, user });
      } catch (e) {
        process.stderr.write(`[mock-api] 500 ${req.method} ${url.pathname}: ${e.stack}\n`);
        result = fail(500, 'Mock API internal error');
      }
    }
  }
  if (DELAY && !path.startsWith('/api/mock-image')) await new Promise((r) => setTimeout(r, DELAY));
  const headers = { ...cors, ...(result.headers || {}) };
  if (result.raw !== undefined) {
    res.writeHead(result.status, headers);
    res.end(result.raw);
  } else {
    res.writeHead(result.status, { ...headers, 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(result.body));
  }
  if (!QUIET && !path.startsWith('/api/mock-image')) console.log(`${req.method} ${url.pathname}${url.search} ${result.status} ${Date.now() - started}ms`);
});

server.on('error', (e) => {
  console.error(`[mock-api] ${e.code === 'EADDRINUSE' ? `port ${PORT} is already in use` : e.message}`);
  process.exit(1);
});
server.listen(PORT, () => {
  console.log(`mock-api listening on http://localhost:${PORT}/api${BULK ? ` (BULK=${BULK})` : ''}${DELAY ? ` (DELAY=${DELAY}ms)` : ''}${IMAGES !== 'png' ? ` (images: ${IMAGES})` : ''}`);
  console.log(`admin login: any email + password (default admin@cahan.az / mock-admin; password "wrong" -> 401)`);
});
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => server.close(() => process.exit(0)));
