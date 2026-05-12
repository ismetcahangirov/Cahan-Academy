import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import {
  Clock, Users, Star, CheckCircle2, ArrowLeft,
  BookOpen, Award, Globe, ChevronRight,
} from 'lucide-react';
import { Course } from '@/types/course';
import EnrollButton from '@/components/ui/EnrollButton';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

async function getCourse(slug: string, locale: string): Promise<Course | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
    const res = await fetch(`${apiUrl}/courses/${slug}?locale=${locale}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const course = await getCourse(slug, locale);
  if (!course) return { title: 'Kurs tapılmadı' };
  return {
    title: `${course.title} — Cahan Academy`,
    description: course.description,
  };
}

export async function generateStaticParams() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
    const res = await fetch(`${apiUrl}/courses`);
    if (!res.ok) return [];
    const data = await res.json();
    const courses: Course[] = data.data ?? [];

    const locales = ['az', 'en', 'ru'];
    return locales.flatMap((locale) =>
      courses.map((course) => ({
        locale,
        slug: course.slug,
      }))
    );
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'courses' });

  const course = await getCourse(slug, locale);
  if (!course) notFound();

  const levelLabel = {
    beginner:     t('level_beginner'),
    intermediate: t('level_intermediate'),
    advanced:     t('level_advanced'),
    all:          t('level_all'),
  }[course.level] ?? course.level;

  // Highlight points (could later come from DB)
  const highlights = [
    'Peşəkar sertifikat',
    'Praktiki layihələr',
    '1-ə-1 müəllim dəstəyi',
    'Ömürlük giriş imkanı',
    'İş axtarışında kömək',
    'Onlayn və oflayn variantlar',
  ];

  // JSON-LD Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: 'Cahan Academy',
      sameAs: 'https://cahan.academy',
    },
    image: course.image,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: course.rating,
      reviewCount: course.studentsCount,
    },
    offers: {
      '@type': 'Offer',
      price: course.price?.replace(/[^0-9.]/g, '') || '0',
      priceCurrency: 'AZN',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <section className="relative pt-28 pb-0 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 left-1/3 w-[500px] h-[500px] rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute bottom-0 right-10 w-80 h-80 rounded-full bg-secondary/8 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-primary transition-colors">Ana Səhifə</Link>
            <ChevronRight size={14} />
            <Link href="/courses" className="hover:text-primary transition-colors">{t('page_title')}</Link>
            <ChevronRight size={14} />
            <span className="text-foreground font-medium truncate max-w-[200px]">{course.title}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center pb-16">
            {/* Left – Text */}
            <div>
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <span className="bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                  {course.category.name}
                </span>
                {course.isPopular && (
                  <span className="bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                    {t('filter_popular')}
                  </span>
                )}
                <span className="bg-accent text-muted-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
                  {levelLabel}
                </span>
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                {course.title}
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                {course.description}
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap gap-6 mb-8 text-sm">
                <div className="flex items-center gap-2">
                  <Star size={18} className="text-secondary fill-secondary" />
                  <span className="font-bold text-lg">{course.rating}</span>
                  <span className="text-muted-foreground">xal</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users size={18} className="text-primary" />
                  <span><strong className="text-foreground">{course.studentsCount}</strong> {t('students')}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock size={18} className="text-primary" />
                  <span><strong className="text-foreground">{course.duration}</strong></span>
                </div>
              </div>

              {/* Teacher mini-card */}
              {course.teacher?.name && (
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-accent/50 border border-border mb-8">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                    {course.teacher.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">Müəllim</div>
                    <div className="font-semibold text-foreground">{course.teacher.name}</div>
                    <div className="text-xs text-muted-foreground">{course.teacher.position}</div>
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="flex items-center gap-4 flex-wrap">
                <EnrollButton course={course} locale={locale} />
                <Link
                  href="/courses"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                >
                  <ArrowLeft size={16} />
                  Geri qayıt
                </Link>
              </div>
            </div>

            {/* Right – Image + Price Card */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/15 aspect-[4/3]">
                <Image
                  src={course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'}
                  alt={course.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* Floating price card */}
              <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-2xl p-5 shadow-2xl min-w-[200px]">
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Qiymət</div>
                <div className="font-heading text-3xl font-extrabold text-primary">{course.price}</div>
                <div className="text-xs text-muted-foreground mt-1">tam kurs daxildir</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-24 bg-accent/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Left – What you'll learn */}
            <div className="lg:col-span-2 space-y-12">
              <div>
                <h2 className="font-heading text-3xl font-bold mb-8 flex items-center gap-3">
                  <BookOpen className="text-primary" size={28} />
                  Bu kursdə nə öyrənəcəksiniz?
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {highlights.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                      <CheckCircle2 size={20} className="text-primary mt-0.5 shrink-0" />
                      <span className="text-sm font-medium text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teacher bio */}
              {course.teacher?.name && (
                <div>
                  <h2 className="font-heading text-3xl font-bold mb-8 flex items-center gap-3">
                    <Award className="text-primary" size={28} />
                    Müəllim haqqında
                  </h2>
                  <div className="flex items-start gap-6 p-6 rounded-2xl bg-card border border-border">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl shrink-0">
                      {course.teacher.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-heading text-xl font-bold mb-1">{course.teacher.name}</div>
                      <div className="text-primary text-sm font-semibold mb-3">{course.teacher.position}</div>
                      {course.teacher.bio && (
                        <p className="text-muted-foreground text-sm leading-relaxed">{course.teacher.bio}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right – Sidebar */}
            <div className="space-y-6">
              {/* Course info card */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
                <h3 className="font-heading text-lg font-bold mb-5">Kurs məlumatları</h3>
                <ul className="space-y-4 text-sm">
                  <li className="flex items-center justify-between border-b border-border pb-4">
                    <span className="flex items-center gap-2 text-muted-foreground"><Clock size={16} /> Müddət</span>
                    <span className="font-semibold">{course.duration}</span>
                  </li>
                  <li className="flex items-center justify-between border-b border-border pb-4">
                    <span className="flex items-center gap-2 text-muted-foreground"><Globe size={16} /> Dil</span>
                    <span className="font-semibold">Azərbaycan</span>
                  </li>
                  <li className="flex items-center justify-between border-b border-border pb-4">
                    <span className="flex items-center gap-2 text-muted-foreground"><Award size={16} /> Səviyyə</span>
                    <span className="font-semibold">{levelLabel}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground"><Users size={16} /> Tələbə</span>
                    <span className="font-semibold">{course.studentsCount}</span>
                  </li>
                </ul>

                <div className="mt-6 pt-6 border-t border-border">
                  <EnrollButton course={course} locale={locale} fullWidth />
                </div>
              </div>

              {/* Other courses CTA */}
              <div className="bg-primary/8 border border-primary/20 rounded-2xl p-6 text-center">
                <BookOpen size={32} className="text-primary mx-auto mb-3" />
                <p className="font-semibold mb-4 text-sm">Digər kurslarımıza da baxın</p>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 text-primary text-sm font-bold hover:underline"
                >
                  Bütün kurslar <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
