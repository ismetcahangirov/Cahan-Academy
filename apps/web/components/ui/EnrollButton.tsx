'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, User, Mail, Phone } from 'lucide-react';
import { Course } from '@/types/course';
import EnrollForm from '../forms/EnrollForm';

interface EnrollButtonProps {
  course: Course;
  locale: string;
  fullWidth?: boolean;
}

export default function EnrollButton({ course, locale, fullWidth }: EnrollButtonProps) {
  const [open, setOpen]       = useState(false);

  const labels = {
    az: { btn: 'Kursa Yazıl', title: 'Kursa Yazıl', name: 'Ad Soyad', email: 'Email', phone: 'Telefon', submit: 'Müraciət Et', success: 'Müraciətiniz qəbul edildi!' },
    en: { btn: 'Enroll Now',  title: 'Enroll Now',  name: 'Full Name', email: 'Email', phone: 'Phone', submit: 'Apply',  success: 'Your request has been received!' },
    ru: { btn: 'Записаться', title: 'Записаться на курс', name: 'Имя Фамилия', email: 'Email', phone: 'Телефон', submit: 'Подать заявку', success: 'Ваша заявка принята!' },
  }[locale] ?? { btn: 'Kursa Yazıl', title: 'Kursa Yazıl', name: 'Ad Soyad', email: 'Email', phone: 'Telefon', submit: 'Müraciət Et', success: 'Müraciətiniz qəbul edildi!' };


  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-white font-bold text-sm hover:bg-primary/90 active:scale-95 transition-all shadow-xl shadow-primary/25 ${fullWidth ? 'w-full' : ''}`}
      >
        {labels.btn}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Modal */}
            <motion.div
              className="relative z-10 w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            >
              {/* Header */}
              <div className="relative p-6 pb-4 bg-gradient-to-br from-primary/10 to-secondary/5 border-b border-border">
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <X size={18} />
                </button>
                <div className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">{course.category.name}</div>
                <h2 className="font-heading text-xl font-bold pr-8">{labels.title}</h2>
                <p className="text-muted-foreground text-sm mt-1 line-clamp-1">{course.title}</p>
              </div>

              {/* Body */}
              <div className="p-6">
                <EnrollForm 
                  courseTitle={course.title} 
                  courseId={course.id}
                  onSuccess={() => {
                    setTimeout(() => setOpen(false), 2000);
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
