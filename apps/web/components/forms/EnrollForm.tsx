'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { submitEnrollForm } from '@/lib/api';

const enrollSchema = z.object({
  name: z.string().min(2, 'Ad ən azı 2 simvol olmalıdır'),
  email: z.string().email('Düzgün email daxil edin'),
  phone: z.string().min(7, 'Düzgün telefon nömrəsi daxil edin'),
  course: z.string().min(1, 'Kurs seçin'),
});

type EnrollFormValues = z.infer<typeof enrollSchema>;

interface EnrollFormProps {
  courseTitle: string;
  courseId: string;
  onSuccess?: () => void;
}

export default function EnrollForm({ courseTitle, courseId, onSuccess }: EnrollFormProps) {
  const t = useTranslations('enroll');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EnrollFormValues>({
    resolver: zodResolver(enrollSchema),
    defaultValues: {
      course: courseTitle,
    },
  });

  const onSubmit = async (data: EnrollFormValues) => {
    setStatus('loading');
    setErrorMessage('');
    try {
      await submitEnrollForm(data);
      setStatus('success');
      reset();
      if (onSuccess) {
        setTimeout(onSuccess, 3000);
      }
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || t('error'));
    }
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-8 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
        <h3 className="text-xl font-bold mb-2">{t('success')}</h3>
        <p className="text-muted-foreground text-sm">
          Qeydiyyatınız uğurla tamamlandı. Menecerlərimiz tezliklə sizinlə əlaqə saxlayacaq.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <User size={12} />
          {t('name')}
        </label>
        <input
          {...register('name')}
          className={`w-full px-4 py-3 rounded-xl bg-background border ${
            errors.name ? 'border-red-500/50' : 'border-border'
          } focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm`}
          placeholder="Əli Əliyev"
        />
        {errors.name && (
          <p className="text-red-500 text-[10px]">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <Mail size={12} />
          {t('email')}
        </label>
        <input
          {...register('email')}
          className={`w-full px-4 py-3 rounded-xl bg-background border ${
            errors.email ? 'border-red-500/50' : 'border-border'
          } focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm`}
          placeholder="ali@example.com"
        />
        {errors.email && (
          <p className="text-red-500 text-[10px]">{errors.email.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <Phone size={12} />
          {t('phone')}
        </label>
        <input
          {...register('phone')}
          className={`w-full px-4 py-3 rounded-xl bg-background border ${
            errors.phone ? 'border-red-500/50' : 'border-border'
          } focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm`}
          placeholder="+994 -- --- -- --"
        />
        {errors.phone && (
          <p className="text-red-500 text-[10px]">{errors.phone.message}</p>
        )}
      </div>

      {/* Course (Hidden or Read-only) */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <BookOpen size={12} />
          {t('course')}
        </label>
        <input
          {...register('course')}
          readOnly
          className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-muted-foreground text-sm"
        />
      </div>

      <AnimatePresence>
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-500 text-xs"
          >
            <AlertCircle size={14} />
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-4 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 mt-2"
      >
        {status === 'loading' ? (
          <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        ) : null}
        {t('submit')}
      </button>
    </form>
  );
}
