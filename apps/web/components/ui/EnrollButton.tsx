'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Course } from '@/types/course';
import EnrollForm from '../forms/EnrollForm';
import Modal from './Modal';
import { buttonClass } from './Button';

/**
 * EnrollButton — primary CTA on a course page; opens the enrolment form in a <Modal>
 * (script title, course name as the serif entity line, focus trap, Escape).
 * Props kept from the previous version: course, locale (unused now: labels come from messages), fullWidth.
 */
interface EnrollButtonProps {
  course: Course;
  locale?: string;
  fullWidth?: boolean;
}

export default function EnrollButton({ course, fullWidth }: EnrollButtonProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('enroll');
  const tn = useTranslations('nav');

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={buttonClass({ size: 'lg', block: fullWidth })}
      >
        {tn('enroll')}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t('title')}
        entity={course.title}
        subtitle={course.category?.name}
      >
        <EnrollForm
          courseTitle={course.title}
          courseId={course.id}
          onSuccess={() => {
            window.setTimeout(() => setOpen(false), 2000);
          }}
        />
      </Modal>
    </>
  );
}
