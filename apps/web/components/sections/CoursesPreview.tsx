import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { apiFetch } from '@/lib/api';
import type { Course } from '@/types/course';
import ScriptTitle from '../ornament/ScriptTitle';
import WaveEdge from '../ornament/WaveEdge';
import CourseCard from '../cards/CourseCard';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import Reveal from '../ui/Reveal';

/**
 * CoursesPreview — three courses from the API (popular first); the first carries the bookmark ribbon
 * (the one featured card of the view). API down / empty → EmptyState inside the section, never a blank
 * block. Parchment band with wavy joins top and bottom. Async server component.
 */
async function loadCourses(locale: string): Promise<Course[]> {
  try {
    const res = await apiFetch<{ data: Course[] }>(`/courses?locale=${locale}`, { tags: ['courses'], revalidate: 3600 });
    const list = Array.isArray(res?.data) ? res.data : [];
    return [...list].sort((a, b) => Number(b.isPopular) - Number(a.isPopular)).slice(0, 3);
  } catch {
    return [];
  }
}

export default async function CoursesPreview() {
  const locale = await getLocale();
  const t = await getTranslations('home');
  const courses = await loadCourses(locale);

  return (
    <section aria-labelledby="courses-title" className="cv-auto paper relative py-24 sm:py-28">
      <WaveEdge invert fill="var(--page-base)" className="absolute inset-x-0 -top-px" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <ScriptTitle
            id="courses-title"
            size="section"
            eyebrow={t('courses_eyebrow')}
            title={t('courses_title')}
            actions={
              <Button as={Link} href="/courses" variant="outline" size="sm" iconAfter={ArrowRight}>
                {t('courses_all')}
              </Button>
            }
          />
        </Reveal>

        {courses.length ? (
          <Reveal as="ul" stagger className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, i) => (
              <li key={course.id}>
                <CourseCard course={course} featured={i === 0} />
              </li>
            ))}
          </Reveal>
        ) : (
          <div className="card-paper mt-12">
            <EmptyState
              sketch="books"
              title={t('courses_empty_title')}
              description={t('courses_empty_desc')}
              action={
                <Button as={Link} href="/courses" variant="outline">
                  {t('courses_all')}
                </Button>
              }
            />
          </div>
        )}
      </div>
      <WaveEdge fill="var(--page-base)" className="absolute inset-x-0 -bottom-px" />
    </section>
  );
}
