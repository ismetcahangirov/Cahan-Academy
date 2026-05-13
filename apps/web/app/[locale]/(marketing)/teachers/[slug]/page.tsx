import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { 
  ChevronRight, Linkedin, Twitter, Github, 
  BookOpen, Award, Mail, ArrowLeft, Star
} from 'lucide-react';
import { getTeacher } from '@/lib/api';
import CourseCard from '@/components/cards/CourseCard';
import JsonLd from '@/components/seo/JsonLd';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
    const res = await fetch(`${apiUrl}/teachers`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const data = await res.json();
    const teachers: any[] = data.data ?? [];

    const locales = ['az', 'en', 'ru'];
    return locales.flatMap((locale) =>
      teachers.map((t) => ({
        locale,
        slug: t.slug,
      }))
    );
  } catch (error) {
    console.error('Error generating static params for teachers:', error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const teacher = await getTeacher(slug, locale);
  if (!teacher) return { title: 'Müəllim tapılmadı' };
  return {
    title: `${teacher.name} — Cahan Academy`,
    description: teacher.bio,
  };
}

export default async function TeacherDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'teachers' });

  const teacher = await getTeacher(slug, locale);
  if (!teacher) notFound();

  // JSON-LD Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: teacher.name,
    jobTitle: teacher.position,
    description: teacher.bio,
    image: teacher.image,
    sameAs: [
      'https://linkedin.com',
      'https://twitter.com',
    ],
    worksFor: {
      '@type': 'Organization',
      name: 'Cahan Academy',
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Ana Səhifə',
        item: `https://cahanacademy.az/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: t('page_title'),
        item: `https://cahanacademy.az/${locale}/teachers`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: teacher.name,
        item: `https://cahanacademy.az/${locale}/teachers/${teacher.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen pt-28 pb-20">
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-12">
          <Link href="/" className="hover:text-primary transition-colors">Ana Səhifə</Link>
          <ChevronRight size={14} />
          <Link href="/teachers" className="hover:text-primary transition-colors">{t('page_title')}</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">{teacher.name}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left - Profile Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-border">
              <Image
                src={teacher.image || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800'}
                alt={teacher.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <h1 className="font-heading text-2xl font-bold mb-1">{teacher.name}</h1>
              <p className="text-primary font-semibold mb-6">{teacher.position}</p>
              
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-accent/50 hover:bg-primary/10 hover:text-primary transition-all group">
                  <span className="flex items-center gap-3 text-sm font-medium">
                    <Linkedin size={18} /> LinkedIn
                  </span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-accent/50 hover:bg-primary/10 hover:text-primary transition-all group">
                  <span className="flex items-center gap-3 text-sm font-medium">
                    <Twitter size={18} /> Twitter
                  </span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-accent/50 hover:bg-primary/10 hover:text-primary transition-all group">
                  <span className="flex items-center gap-3 text-sm font-medium">
                    <Mail size={18} /> Email
                  </span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Right - Bio & Courses */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="font-heading text-3xl font-bold mb-6 flex items-center gap-3">
                <Award className="text-primary" size={28} />
                Haqqında
              </h2>
              <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed">
                <p className="whitespace-pre-line">{teacher.bio}</p>
              </div>
            </div>

            {teacher.courses.length > 0 && (
              <div>
                <h2 className="font-heading text-3xl font-bold mb-8 flex items-center gap-3">
                  <BookOpen className="text-primary" size={28} />
                  Tədris etdiyi kurslar
                </h2>
                <div className="grid sm:grid-cols-2 gap-8">
                  {teacher.courses.map((course: any) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </div>
            )}

            <div className="pt-12 border-t border-border">
              <Link
                href="/teachers"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                <ArrowLeft size={18} />
                {t('back_to_list')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
