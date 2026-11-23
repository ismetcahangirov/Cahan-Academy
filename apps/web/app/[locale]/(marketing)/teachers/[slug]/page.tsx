import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { getTeacher, getTeachers } from '@/lib/api';
import { SITE_URL, absoluteUrl } from '@/lib/utils';
import JsonLd from '@/components/seo/JsonLd';
import CoverImage from '@/components/cards/CoverImage';
import { Button, Card, EmptyState } from '@/components/ui';
import Reveal from '@/components/ui/Reveal';
import { EdelweissCorner, EdelweissGlyph, OrnamentDivider, OrnateFrame, ScriptTitle, WaveEdge } from '@/components/ornament';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import CourseCard from '@/components/cards/CourseCard';
import { isRealImage, sketchFor } from '@/lib/media';
import { alternatesFor, metaDescription } from '@/lib/seo';

// ISR: static HTML, regenerated in the background at most this often (same window as the
// fetches it renders: teacher, 1 d). Explicit, so a page whose build-time fetch failed still revalidates.
export const revalidate = 86400;

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const teachers = await getTeachers();
  return ['az', 'en', 'ru'].flatMap((locale) => teachers.map((teacher) => ({ locale, slug: teacher.slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  // A-23: null only on a real 404; other API failures throw (the last good page is kept)
  const teacher = await getTeacher(slug, locale);
  if (!teacher) {
    const t = await getTranslations({ locale, namespace: 'teachers' });
    return { title: `${t('no_results_title')} — Cahan Academy`, robots: { index: false } };
  }
  const description = metaDescription(teacher.bio || teacher.position);
  return {
    title: `${teacher.name} — Cahan Academy`,
    description,
    alternates: alternatesFor(locale, `/teachers/${teacher.slug}`),
    openGraph: { title: teacher.name, description, type: 'profile', locale },
    twitter: { card: 'summary_large_image', title: teacher.name, description },
  };
}

export default async function TeacherDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const teacher = await getTeacher(slug, locale);
  if (!teacher) notFound();

  const [t, tp, tcp, tc, tn] = await Promise.all([
    getTranslations({ locale, namespace: 'teachers' }),
    getTranslations({ locale, namespace: 'teachersPage' }),
    getTranslations({ locale, namespace: 'coursesPage' }),
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'nav' }),
  ]);

  const image = isRealImage(teacher.image) ? teacher.image : null;
  const courses = teacher.courses ?? [];
  // the hero shows the bio clamped; a long bio is repeated in full in "About"
  const longBio = (teacher.bio?.length ?? 0) > 360;

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: teacher.name,
          url: absoluteUrl(locale, `/teachers/${teacher.slug}`),
          ...(teacher.position ? { jobTitle: teacher.position } : {}),
          ...(teacher.bio ? { description: teacher.bio } : {}),
          ...(image ? { image } : {}),
          worksFor: { '@type': 'EducationalOrganization', name: 'Cahan Academy', url: SITE_URL },
        }}
      />

      {/* ── Hero: wine band, framed arched portrait ─────────────────────────────────────────────── */}
      <section className="theme-wine hero-wine relative isolate overflow-hidden">
        <EdelweissCorner corner="tl" priority onWine className="absolute left-0 top-0 w-20 sm:w-32 lg:w-40" />
        <EdelweissCorner corner="tr" priority onWine delay={260} className="absolute right-0 top-0 hidden w-32 sm:block lg:w-40" />

        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 sm:pb-28 sm:pt-10 lg:px-8">
          <Breadcrumbs
            locale={locale}
            label={tcp('breadcrumb_label')}
            className="orn-reveal pl-14 sm:pl-24 lg:pl-32"
            items={[
              { name: tc('home'), path: '' },
              { name: t('page_title'), path: '/teachers' },
              { name: teacher.name, path: `/teachers/${teacher.slug}` },
            ]}
          />

          <div className="mt-8 grid items-center gap-10 md:grid-cols-[minmax(0,20rem)_1fr] lg:mt-12 lg:grid-cols-[minmax(0,24rem)_1fr] lg:gap-16">
            <div className="orn-rise mx-auto w-full max-w-[17rem] md:max-w-none">
              <OrnateFrame className="rounded-t-[999px] p-3 sm:p-4" corners="none">
                <CoverImage
                  src={image}
                  alt={teacher.name}
                  sketch={sketchFor(teacher.position, teacher.slug)}
                  rounded="arch"
                  priority
                  sizes="(min-width: 1024px) 24rem, (min-width: 768px) 20rem, 17rem"
                  className="aspect-[4/5] w-full"
                />
              </OrnateFrame>
            </div>

            <div className="orn-rise min-w-0 text-center md:text-left">
              <p className="font-script text-[2rem] leading-none text-ink-muted sm:text-[2.3rem]">{tp('detail_script')}</p>
              <h1 className="mt-2 break-words text-[2.3rem] font-semibold leading-[1.1] text-ink sm:text-[2.9rem]">{teacher.name}</h1>
              {teacher.position && <p className="sc mt-3 text-[0.95rem] text-ink-muted">{teacher.position}</p>}
              <OrnamentDivider align="start" className="mt-4 hidden md:flex" />
              <OrnamentDivider className="mt-4 md:hidden" />
              {teacher.bio && (
                <p
                  className={`mt-5 whitespace-pre-line text-[1.12rem] leading-relaxed text-ink-muted sm:text-[1.2rem] ${longBio ? 'line-clamp-6' : ''}`}
                >
                  {teacher.bio}
                </p>
              )}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center md:justify-start">
                {courses.length > 0 && (
                  <Button as="a" href="#teacher-courses" size="lg" iconAfter={ArrowDown}>
                    {tp('courses_title')}
                  </Button>
                )}
                <Button as={Link} href="/teachers" variant="ghost" icon={ArrowLeft}>
                  {t('back_to_list')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <WaveEdge fill="var(--page-base)" className="absolute inset-x-0 -bottom-px" />
      </section>

      {longBio && (
        <section aria-labelledby="bio-title" className="mx-auto max-w-3xl px-4 pt-14 sm:px-6">
          <Card variant="paper" className="p-6 sm:p-9">
            <ScriptTitle id="bio-title" size="section" title={tp('about_title')} />
            <p className="mt-6 whitespace-pre-line text-[1.1rem] leading-relaxed text-ink">{teacher.bio}</p>
          </Card>
        </section>
      )}

      <section
        id="teacher-courses"
        aria-labelledby="teacher-courses-title"
        className="mx-auto max-w-7xl scroll-mt-[var(--header-h)] px-4 pb-24 pt-14 sm:px-6 lg:px-8"
      >
        <ScriptTitle
          id="teacher-courses-title"
          size="section"
          title={tp('courses_title')}
          subtitle={courses.length ? tp('courses_count', { count: courses.length }) : undefined}
          actions={
            courses.length > 0 ? (
              <Button as={Link} href="/courses" variant="outline" size="sm" iconAfter={ArrowRight}>
                {tp('all_courses')}
              </Button>
            ) : undefined
          }
        />
        {courses.length ? (
          <Reveal as="ul" stagger className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, i) => (
              <li key={course.id}>
                <CourseCard course={course} featured={courses.length > 1 && i === 0 && course.isPopular} />
              </li>
            ))}
          </Reveal>
        ) : (
          <div className="card-paper mt-10">
            <EmptyState
              sketch="books"
              title={tp('no_courses_title')}
              description={tp('no_courses_desc')}
              action={
                <Button as={Link} href="/courses" variant="outline">
                  {tn('courses')}
                </Button>
              }
            />
          </div>
        )}
        <p className="mt-14 flex items-center justify-center gap-3">
          <EdelweissGlyph className="h-4 w-4 text-ornament" />
          <Link href="/teachers" className="sc text-[0.85rem] text-accent-text underline decoration-line-strong underline-offset-4 hover:decoration-current">
            {t('back_to_list')}
          </Link>
          <EdelweissGlyph className="h-4 w-4 text-ornament" />
        </p>
      </section>
    </>
  );
}
