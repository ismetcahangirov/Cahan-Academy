import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowDown, ArrowLeft, ArrowRight, Award, Clock, Layers, Star, Tag, Users, Wallet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { getCourse, getCourses, getTeachers, type CourseSummary } from '@/lib/api';
import { SITE_URL, absoluteUrl } from '@/lib/utils';
import JsonLd from '@/components/seo/JsonLd';
import EnrollForm from '@/components/forms/EnrollForm';
import CoverImage from '@/components/cards/CoverImage';
import { Badge, Button, Card } from '@/components/ui';
import Reveal from '@/components/ui/Reveal';
import {
  BookmarkRibbon,
  EdelweissGlyph,
  LaceCorner,
  OrnamentDivider,
  OrnateFrame,
  ScriptTitle,
  Timeline,
  TimelineItem,
  WaveEdge,
} from '@/components/ornament';
import Breadcrumbs from '@/components/courses/Breadcrumbs';
import CourseTile from '@/components/courses/CourseTile';
import StickyEnroll from '@/components/courses/StickyEnroll';
import { coverSrc, sketchFor } from '@/components/courses/media';
import { alternatesFor, metaDescription } from '@/components/courses/seo';
import { parseSyllabus, toRoman } from '@/components/courses/syllabus';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

type CourseDetail = CourseSummary & {
  syllabus?: string | null;
  teacher: CourseSummary['teacher'] & { bio?: string | null };
};

// A-23: getCourse returns null only on a real 404 and throws otherwise (the last good ISR page is kept)
const loadCourse = (slug: string, locale: string) => getCourse(slug, locale) as Promise<CourseDetail | null>;

export async function generateStaticParams() {
  const courses = await getCourses();
  return ['az', 'en', 'ru'].flatMap((locale) => courses.map((course) => ({ locale, slug: course.slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const course = await loadCourse(slug, locale);
  if (!course) {
    const t = await getTranslations({ locale, namespace: 'courses' });
    return { title: `${t('no_results')} — Cahan Academy`, robots: { index: false } };
  }
  const description = metaDescription(course.description);
  return {
    title: `${course.title} — Cahan Academy`,
    description,
    alternates: alternatesFor(locale, `/courses/${course.slug}`),
    openGraph: { title: course.title, description, type: 'website', locale },
    twitter: { card: 'summary_large_image', title: course.title, description },
  };
}

function Fact({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon aria-hidden="true" size={18} strokeWidth={1.6} className="mt-0.5 shrink-0 text-ornament" />
      <dt className="sc min-w-0 flex-1 pt-0.5 text-[0.8rem] text-ink-muted">{label}</dt>
      <dd className="num text-right text-[1.05rem] font-semibold text-ink">{children}</dd>
    </div>
  );
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const course = await loadCourse(slug, locale);
  if (!course) notFound();

  const [t, tp, tc, tt, all, teachers] = await Promise.all([
    getTranslations({ locale, namespace: 'courses' }),
    getTranslations({ locale, namespace: 'coursesPage' }),
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'teachers' }),
    getCourses(locale),
    course.teacher?.name ? getTeachers(locale) : Promise.resolve([]),
  ]);

  const levelLabel =
    { beginner: t('level_beginner'), intermediate: t('level_intermediate'), advanced: t('level_advanced'), all: t('level_all') }[
      course.level
    ] ?? course.level;
  const syllabus = parseSyllabus(course.syllabus);
  const teacher = course.teacher?.name ? course.teacher : null;
  // the course endpoint has no teacher slug: link the profile when the name matches a listed teacher
  const teacherSlug = teacher ? teachers.find((x) => x.name === teacher.name)?.slug : undefined;
  const sameCategory = all.filter((c) => c.slug !== course.slug && c.category?.slug === course.category?.slug);
  const related = (sameCategory.length ? sameCategory : all.filter((c) => c.slug !== course.slug && c.isPopular)).slice(0, 3);
  const image = coverSrc(course.image);
  const sketch = sketchFor(course.category?.slug, course.category?.name, course.title);
  const priceNumber = course.price?.replace(',', '.').match(/\d+(\.\d+)?/)?.[0];
  const highlights = [1, 2, 3, 4, 5, 6].map((n) => tp(`highlight_${n}`));
  const url = absoluteUrl(locale, `/courses/${course.slug}`);
  // the hero shows the description clamped to 4 lines; repeat it in "About" only when it is long
  const longDescription = (course.description?.length ?? 0) > 260;

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: course.title,
          description: course.description,
          url,
          inLanguage: locale,
          ...(image ? { image } : {}),
          provider: { '@type': 'EducationalOrganization', name: 'Cahan Academy', url: SITE_URL },
          ...(priceNumber
            ? { offers: { '@type': 'Offer', category: 'Paid', price: priceNumber, priceCurrency: 'AZN', url } }
            : {}),
        }}
      />

      {/* ── Hero: wine band, framed cover with the bookmark ribbon ─────────────────────────────── */}
      <section className="theme-wine hero-wine relative isolate overflow-hidden">
        <LaceCorner corner="tl" priority className="absolute left-0 top-0 w-20 sm:w-32 lg:w-44" />
        <LaceCorner corner="tr" priority className="absolute right-0 top-0 hidden w-32 sm:block lg:w-44" />

        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 sm:pb-28 sm:pt-10 lg:px-8">
          <Breadcrumbs
            locale={locale}
            label={tp('breadcrumb_label')}
            className="orn-reveal pl-14 sm:pl-24 lg:pl-32"
            items={[
              { name: tc('home'), path: '' },
              { name: t('page_title'), path: '/courses' },
              { name: course.title, path: `/courses/${course.slug}` },
            ]}
          />

          <div className="mt-8 grid items-center gap-10 lg:mt-12 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <div className="orn-rise min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {course.category?.name && <Badge tone="solid">{course.category.name}</Badge>}
                <Badge>{levelLabel}</Badge>
                {course.isPopular && <Badge tone="accent">{t('filter_popular')}</Badge>}
              </div>
              <p className="font-script mt-6 text-[2rem] leading-none text-ink-muted sm:text-[2.3rem]">{tp('detail_script')}</p>
              <h1 className="mt-2 break-words text-[2.2rem] font-semibold leading-[1.12] text-ink sm:text-[2.8rem]">
                {course.title}
              </h1>
              <OrnamentDivider align="start" className="mt-4" />
              {course.description && (
                <p className="mt-5 line-clamp-4 max-w-2xl text-[1.12rem] leading-relaxed text-ink-muted sm:text-[1.2rem]">
                  {course.description}
                </p>
              )}

              <dl className="mt-7 grid grid-cols-3 divide-x divide-line border-y border-line py-4">
                {[
                  [tp('meta_price'), course.price ?? tp('price_on_request')],
                  [tp('meta_duration'), course.duration ?? '—'],
                  [tp('meta_level'), levelLabel],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0 px-2 text-center first:pl-0 last:pr-0 sm:px-4">
                    <dt className="sc text-[0.72rem] text-ink-subtle sm:text-[0.8rem]">{label}</dt>
                    <dd className="num mt-1 break-words text-[1.02rem] font-semibold leading-snug text-ink sm:text-[1.2rem]">{value}</dd>
                  </div>
                ))}
              </dl>

              {(course.rating || course.studentsCount) && (
                <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-[1rem] text-ink-muted">
                  {course.rating && (
                    <li className="flex items-center gap-1.5">
                      <Star aria-hidden="true" size={16} strokeWidth={1.6} className="fill-current text-ornament" />
                      <span className="num font-semibold text-ink">{course.rating}</span>
                      <span className="sr-only">{tp('meta_rating')}</span>
                    </li>
                  )}
                  {course.studentsCount && (
                    <li className="flex items-center gap-1.5">
                      <Users aria-hidden="true" size={16} strokeWidth={1.6} className="text-ornament" />
                      <span className="num">{course.studentsCount}</span> {t('students')}
                    </li>
                  )}
                </ul>
              )}

              <div id="course-cta" className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button as="a" href="#enroll" size="lg" iconAfter={ArrowDown}>
                  {t('enroll_btn')}
                </Button>
                <Button as={Link} href="/courses" variant="ghost" icon={ArrowLeft}>
                  {tp('back')}
                </Button>
              </div>
            </div>

            <div className="orn-rise relative mx-auto w-full max-w-xl lg:max-w-none">
              <OrnateFrame className="p-3 sm:p-4" cornerSize="h-6 w-6 sm:h-8 sm:w-8">
                <BookmarkRibbon length={96} width={22} className="right-10" />
                <CoverImage
                  src={image}
                  alt={course.title}
                  sketch={sketch}
                  priority
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="aspect-[4/3]"
                />
              </OrnateFrame>
            </div>
          </div>
        </div>

        <WaveEdge fill="var(--page-base)" className="absolute inset-x-0 -bottom-px" />
      </section>

      {/* ── Body: about + curriculum | facts + teacher ───────────────────────────────────────────── */}
      <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10 lg:px-8 lg:pt-14">
        <div className="min-w-0 space-y-8">
          <Card as="section" variant="paper" aria-labelledby="about-title" className="p-6 sm:p-9">
            <ScriptTitle id="about-title" size="section" title={longDescription ? tp('about_title') : tp('highlights_title')} />
            {longDescription && (
              <>
                <p className="mt-6 whitespace-pre-line text-[1.1rem] leading-relaxed text-ink">{course.description}</p>
                <h3 className="sc mt-8 text-[0.9rem] text-ink-muted">{tp('highlights_title')}</h3>
              </>
            )}
            <ul className="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[1.05rem] text-ink">
                  <EdelweissGlyph className="mt-1 h-4 w-4 shrink-0 text-ornament" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          {syllabus.length > 0 && (
            <Reveal>
              <OrnateFrame as="section" paper id="syllabus" aria-labelledby="syllabus-title" className="p-6 sm:p-9" corners="diagonal">
                <ScriptTitle
                  id="syllabus-title"
                  size="section"
                  title={tp('syllabus_title')}
                  subtitle={tp('syllabus_count', { count: syllabus.length })}
                />
                <Timeline className="mt-8">
                  {syllabus.map((item, i) => (
                    <TimelineItem
                      key={`${i}-${item.title}`}
                      time={toRoman(i + 1)}
                      title={item.title}
                      meta={item.description}
                      state={i === 0 ? 'current' : 'upcoming'}
                      className={i === syllabus.length - 1 ? '[&>div:last-child]:pb-0' : undefined}
                    />
                  ))}
                </Timeline>
              </OrnateFrame>
            </Reveal>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
          {/* on phones the hero already carries these facts and the sticky bar the action */}
          <Card variant="ornate" className="hidden p-6 lg:block">
            <h2 className="sc text-center text-[0.95rem] text-ink-muted">{tp('facts_title')}</h2>
            <OrnamentDivider className="mt-2" />
            <dl className="mt-3 divide-y divide-line-hair">
              <Fact icon={Wallet} label={tp('meta_price')}>
                {course.price ?? tp('price_on_request')}
              </Fact>
              {course.duration && (
                <Fact icon={Clock} label={tp('meta_duration')}>
                  {course.duration}
                </Fact>
              )}
              <Fact icon={Layers} label={tp('meta_level')}>
                {levelLabel}
              </Fact>
              {course.category?.name && (
                <Fact icon={Tag} label={tp('meta_category')}>
                  {course.category.name}
                </Fact>
              )}
              {course.studentsCount && (
                <Fact icon={Users} label={tp('meta_students')}>
                  {course.studentsCount}
                </Fact>
              )}
              {course.rating && (
                <Fact icon={Award} label={tp('meta_rating')}>
                  {course.rating}
                </Fact>
              )}
            </dl>
            <Button as="a" href="#enroll" block className="mt-5">
              {t('enroll_btn')}
            </Button>
          </Card>

          {teacher && (
            <Card as="section" aria-labelledby="teacher-title" className="relative p-6 text-center">
              <p id="teacher-title" className="font-script text-[1.9rem] leading-none text-accent-text dark:text-ink">
                {tp('teacher_title')}
              </p>
              <CoverImage
                src={coverSrc(teacher.image)}
                alt=""
                sketch="notebook"
                rounded="arch"
                sizes="10rem"
                className="mx-auto mt-5 aspect-[4/5] w-32"
              />
              <EdelweissGlyph className="mx-auto mt-4 h-4 w-4" />
              <p className="mt-2 text-[1.25rem] font-semibold leading-snug text-ink">
                {teacherSlug ? (
                  <Link
                    href={`/teachers/${teacherSlug}`}
                    className="outline-none after:absolute after:inset-0 after:rounded-[var(--radius-lg)] after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--focus)]"
                  >
                    {teacher.name}
                  </Link>
                ) : (
                  teacher.name
                )}
              </p>
              {teacher.position && <p className="sc mt-1 text-[0.8rem] text-ink-muted">{teacher.position}</p>}
              {teacher.bio && <p className="mt-3 line-clamp-4 text-[1rem] leading-relaxed text-ink-muted">{teacher.bio}</p>}
              {teacherSlug && (
                <span className="sc mt-4 inline-flex items-center gap-1.5 text-[0.85rem] text-accent-text" aria-hidden="true">
                  {tt('view_profile')}
                  <ArrowRight size={15} strokeWidth={1.6} />
                </span>
              )}
            </Card>
          )}
        </aside>
      </div>

      {/* ── Enrolment: parchment band with the framed form ──────────────────────────────────────── */}
      <section id="enroll" aria-labelledby="enroll-title" className="paper relative scroll-mt-[var(--header-h)] py-20 sm:py-24">
        <WaveEdge invert fill="var(--page-base)" className="absolute inset-x-0 -top-px" />
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <OrnateFrame className="px-5 py-9 sm:px-10 sm:py-11">
            <ScriptTitle
              id="enroll-title"
              as="h2"
              size="section"
              align="center"
              title={tp('enroll_title')}
              entity={course.title}
              lead={tp('enroll_lead')}
            />
            <div className="mt-8">
              <EnrollForm courseTitle={course.title} courseId={course.id} />
            </div>
          </OrnateFrame>
        </div>
        <WaveEdge fill="var(--page-base)" className="absolute inset-x-0 -bottom-px" />
      </section>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="cv-auto mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
          <ScriptTitle
            id="related-title"
            size="section"
            title={tp('related_title')}
            actions={
              <Button as={Link} href="/courses" variant="outline" size="sm" iconAfter={ArrowRight}>
                {tp('back')}
              </Button>
            }
          />
          <Reveal as="ul" stagger className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((c) => (
              <li key={c.id}>
                <CourseTile course={c} />
              </li>
            ))}
          </Reveal>
        </section>
      )}

      <StickyEnroll
        label={t('enroll_btn')}
        price={course.price ?? tp('price_on_request')}
        priceLabel={tp('meta_price')}
        watch={['course-cta', 'enroll']}
      />
    </>
  );
}
