import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { getTeachers } from '@/lib/api';
import ScriptTitle from '../ornament/ScriptTitle';
import TeacherCard from '../cards/TeacherCard';
import Button from '../ui/Button';
import Reveal from '../ui/Reveal';

/**
 * TeachersPreview — up to four teachers from the API in arched ornate frames. Renders nothing when the
 * API returns no teachers (the section is optional on the home page). Async server component.
 */
export default async function TeachersPreview() {
  const locale = await getLocale();
  const t = await getTranslations('home');
  const teachers = (await getTeachers(locale)).slice(0, 4);
  if (!teachers.length) return null;

  return (
    <section aria-labelledby="teachers-title" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <ScriptTitle
            id="teachers-title"
            size="section"
            align="center"
            eyebrow={t('teachers_eyebrow')}
            title={t('teachers_title')}
          />
        </Reveal>
        <Reveal as="ul" stagger className="mt-12 grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {teachers.map((teacher) => (
            <li key={teacher.id}>
              <TeacherCard teacher={teacher} />
            </li>
          ))}
        </Reveal>
        <div className="mt-10 flex justify-center">
          <Button as={Link} href="/teachers" variant="outline" iconAfter={ArrowRight}>
            {t('teachers_all')}
          </Button>
        </div>
      </div>
    </section>
  );
}
