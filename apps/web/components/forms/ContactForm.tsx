'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Mail, MessageSquare, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { submitContactForm } from '@/lib/api';

const contactSchema = z.object({
  name: z.string().min(2, 'Ad ən azı 2 simvol olmalıdır'),
  email: z.string().email('Düzgün email daxil edin'),
  subject: z.string().min(3, 'Mövzu ən azı 3 simvol olmalıdır'),
  message: z.string().min(10, 'Mesaj ən azı 10 simvol olmalıdır'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactForm() {
  const t = useTranslations('contact');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormValues) => {
    setStatus('loading');
    setErrorMessage('');
    try {
      await submitContactForm(data);
      setStatus('success');
      reset();
      setTimeout(() => setStatus('idle'), 5000);
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
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        <h3 className="text-2xl font-bold mb-3">{t('success')}</h3>
        <p className="text-muted-foreground max-w-xs">
          Mesajınız bizə çatdı. Ən qısa zamanda sizinlə əlaqə saxlayacağıq.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-8 text-primary font-bold hover:underline"
        >
          Yeni mesaj göndər
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Name */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <User size={14} />
            {t('name')}
          </label>
          <input
            {...register('name')}
            className={`w-full px-5 py-4 rounded-2xl bg-background border ${
              errors.name ? 'border-red-500/50' : 'border-border'
            } focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
            placeholder="Məs: Əli Əliyev"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Mail size={14} />
            {t('email')}
          </label>
          <input
            {...register('email')}
            className={`w-full px-5 py-4 rounded-2xl bg-background border ${
              errors.email ? 'border-red-500/50' : 'border-border'
            } focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
            placeholder="ali@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <Info size={14} />
          {t('subject')}
        </label>
        <input
          {...register('subject')}
          className={`w-full px-5 py-4 rounded-2xl bg-background border ${
            errors.subject ? 'border-red-500/50' : 'border-border'
          } focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
          placeholder="Müraciətinizin mövzusu"
        />
        {errors.subject && (
          <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>
        )}
      </div>

      {/* Message */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <MessageSquare size={14} />
          {t('message')}
        </label>
        <textarea
          {...register('message')}
          rows={5}
          className={`w-full px-5 py-4 rounded-2xl bg-background border ${
            errors.message ? 'border-red-500/50' : 'border-border'
          } focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none`}
          placeholder="Mesajınızı buraya yazın..."
        />
        {errors.message && (
          <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
        )}
      </div>

      <AnimatePresence>
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-sm"
          >
            <AlertCircle size={18} />
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-5 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
      >
        {status === 'loading' ? (
          <span className="w-6 h-6 rounded-full border-3 border-white/30 border-t-white animate-spin" />
        ) : (
          <Send size={20} />
        )}
        {t('send')}
      </button>
    </form>
  );
}
