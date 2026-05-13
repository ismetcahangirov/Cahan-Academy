'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { subscribeNewsletter } from '@/lib/api';

const newsletterSchema = z.object({
  email: z.string().email('Düzgün email daxil edin'),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

export default function NewsletterForm() {
  const t = useTranslations('newsletter');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterFormValues) => {
    setStatus('loading');
    try {
      await subscribeNewsletter(data.email);
      setStatus('success');
      reset();
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="relative group">
        <input
          {...register('email')}
          type="email"
          placeholder={t('placeholder')}
          className={`w-full bg-background/10 border ${
            errors.email ? 'border-red-500/50' : 'border-background/20'
          } rounded-xl px-4 py-3.5 pr-12 text-sm text-background placeholder:text-background/40 focus:outline-none focus:border-secondary transition-all`}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-secondary text-foreground hover:bg-secondary/90 disabled:opacity-50 transition-all flex items-center justify-center"
        >
          {status === 'loading' ? (
            <span className="w-4 h-4 rounded-full border-2 border-foreground/30 border-t-foreground animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </form>

      <AnimatePresence>
        {errors.email && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-red-400 text-[10px] mt-2 ml-1"
          >
            {errors.email.message}
          </motion.p>
        )}
        
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-green-400 text-xs mt-3 ml-1"
          >
            <CheckCircle2 size={14} />
            {t('success')}
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-red-400 text-xs mt-3 ml-1"
          >
            <AlertCircle size={14} />
            {t('error')}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
