'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, User, Mail, Phone } from 'lucide-react';
import { Course } from '@/types/course';

interface EnrollButtonProps {
  course: Course;
  locale: string;
  fullWidth?: boolean;
}

export default function EnrollButton({ course, locale, fullWidth }: EnrollButtonProps) {
  const [open, setOpen]       = useState(false);
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({ name: '', email: '', phone: '' });

  const labels = {
    az: { btn: 'Kursa Yazıl', title: 'Kursa Yazıl', name: 'Ad Soyad', email: 'Email', phone: 'Telefon', submit: 'Müraciət Et', success: 'Müraciətiniz qəbul edildi!' },
    en: { btn: 'Enroll Now',  title: 'Enroll Now',  name: 'Full Name', email: 'Email', phone: 'Phone', submit: 'Apply',  success: 'Your request has been received!' },
    ru: { btn: 'Записаться', title: 'Записаться на курс', name: 'Имя Фамилия', email: 'Email', phone: 'Телефон', submit: 'Подать заявку', success: 'Ваша заявка принята!' },
  }[locale] ?? { btn: 'Kursa Yazıl', title: 'Kursa Yazıl', name: 'Ad Soyad', email: 'Email', phone: 'Telefon', submit: 'Müraciət Et', success: 'Müraciətiniz qəbul edildi!' };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // TODO: wire up real API endpoint
    await new Promise((r) => setTimeout(r, 1200));
    setSent(true);
    setLoading(false);
    setTimeout(() => { setOpen(false); setSent(false); setForm({ name: '', email: '', phone: '' }); }, 2500);
  }

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
                <AnimatePresence mode="wait">
                  {sent ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center py-8 text-center"
                    >
                      <CheckCircle2 size={56} className="text-green-500 mb-4" />
                      <p className="font-heading text-xl font-bold text-foreground">{labels.success}</p>
                      <p className="text-muted-foreground text-sm mt-2">Tezliklə sizinlə əlaqə saxlayacağıq.</p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      className="space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {[
                        { id: 'name',  label: labels.name,  type: 'text',  icon: <User size={16} />,  required: true },
                        { id: 'email', label: labels.email, type: 'email', icon: <Mail size={16} />,  required: true },
                        { id: 'phone', label: labels.phone, type: 'tel',   icon: <Phone size={16} />, required: false },
                      ].map((field) => (
                        <div key={field.id}>
                          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                            {field.label}
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                              {field.icon}
                            </span>
                            <input
                              type={field.type}
                              required={field.required}
                              value={(form as any)[field.id]}
                              onChange={(e) => setForm((f) => ({ ...f, [field.id]: e.target.value }))}
                              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                              placeholder={field.label}
                            />
                          </div>
                        </div>
                      ))}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 active:scale-95 transition-all mt-2 disabled:opacity-70 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        ) : null}
                        {labels.submit}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
