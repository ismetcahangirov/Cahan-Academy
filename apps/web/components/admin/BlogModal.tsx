'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Image as ImageIcon } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import adminApi from '@/lib/adminApi';

const formSchema = z.object({
  titleAz: z.string().min(1, 'Azərbaycan dilində başlıq mütləqdir'),
  titleEn: z.string().min(1, 'İngilis dilində başlıq mütləqdir'),
  titleRu: z.string().min(1, 'Rus dilində başlıq mütləqdir'),
  slug: z.string().min(1, 'Slug mütləqdir'),
  contentAz: z.string().min(1, 'Azərbaycan dilində məzmun mütləqdir'),
  contentEn: z.string().min(1, 'İngilis dilində məzmun mütləqdir'),
  contentRu: z.string().min(1, 'Rus dilində məzmun mütləqdir'),
  excerptAz: z.string().optional(),
  excerptEn: z.string().optional(),
  excerptRu: z.string().optional(),
  image: z.string().optional(),
  readingTime: z.string().optional(),
  isPublished: z.enum(['true', 'false']),
});

type FormData = z.infer<typeof formSchema>;

interface BlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  postToEdit?: any | null; // Can be better typed based on Post model
}

export default function BlogModal({ isOpen, onClose, onSuccess, postToEdit }: BlogModalProps) {
  const [activeTab, setActiveTab] = useState<'az' | 'en' | 'ru'>('az');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isPublished: 'true',
    },
  });

  const titleAzWatcher = watch('titleAz');

  useEffect(() => {
    if (isOpen) {
      if (postToEdit) {
        reset({
          titleAz: postToEdit.titleAz || '',
          titleEn: postToEdit.titleEn || '',
          titleRu: postToEdit.titleRu || '',
          slug: postToEdit.slug || '',
          contentAz: postToEdit.contentAz || '',
          contentEn: postToEdit.contentEn || '',
          contentRu: postToEdit.contentRu || '',
          excerptAz: postToEdit.excerptAz || '',
          excerptEn: postToEdit.excerptEn || '',
          excerptRu: postToEdit.excerptRu || '',
          image: postToEdit.image || '',
          readingTime: postToEdit.readingTime || '',
          isPublished: postToEdit.isPublished || 'true',
        });
      } else {
        reset({
          titleAz: '',
          titleEn: '',
          titleRu: '',
          slug: '',
          contentAz: '',
          contentEn: '',
          contentRu: '',
          excerptAz: '',
          excerptEn: '',
          excerptRu: '',
          image: '',
          readingTime: '',
          isPublished: 'true',
        });
      }
      setActiveTab('az');
    }
  }, [isOpen, postToEdit, reset]);

  // Auto-generate slug from AZ title if it's a new post
  useEffect(() => {
    if (!postToEdit && titleAzWatcher) {
      const slugify = (text: string) => {
        return text
          .toString()
          .toLowerCase()
          .trim()
          .replace(/ə/g, 'e')
          .replace(/ö/g, 'o')
          .replace(/ğ/g, 'g')
          .replace(/ı/g, 'i')
          .replace(/ş/g, 's')
          .replace(/ç/g, 'c')
          .replace(/ü/g, 'u')
          .replace(/[\s\W-]+/g, '-')
          .replace(/-+$/, '');
      };
      setValue('slug', slugify(titleAzWatcher), { shouldValidate: true });
    }
  }, [titleAzWatcher, postToEdit, setValue]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      if (postToEdit) {
        const res = await adminApi.put(`/blog/${postToEdit.id}`, data);
        if (res.data.success) {
          onSuccess();
          onClose();
        }
      } else {
        const res = await adminApi.post('/blog', data);
        if (res.data.success) {
          onSuccess();
          onClose();
        }
      }
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Məqaləni yadda saxlamaq mümkün olmadı.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'az', label: 'Azərbaycanca' },
    { id: 'en', label: 'İngiliscə' },
    { id: 'ru', label: 'Rusca' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            className="relative z-10 w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {postToEdit ? 'Məqaləni Redaktə Et' : 'Yeni Məqalə'}
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Məqalə məlumatlarını 3 dildə daxil edin
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <form id="blog-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Language Tabs */}
                <div className="flex p-1 bg-slate-800 rounded-xl w-fit">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? 'bg-amber-500 text-slate-900 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-5 bg-slate-800/20 p-5 rounded-2xl border border-slate-800/50">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Başlıq</label>
                    <input
                      {...register(activeTab === 'az' ? 'titleAz' : activeTab === 'en' ? 'titleEn' : 'titleRu')}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                      placeholder="Məqalənin başlığı..."
                    />
                    {errors[activeTab === 'az' ? 'titleAz' : activeTab === 'en' ? 'titleEn' : 'titleRu'] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[activeTab === 'az' ? 'titleAz' : activeTab === 'en' ? 'titleEn' : 'titleRu']?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Xülasə (Qısa təsvir)</label>
                    <textarea
                      {...register(activeTab === 'az' ? 'excerptAz' : activeTab === 'en' ? 'excerptEn' : 'excerptRu')}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none h-24"
                      placeholder="Məqalə haqqında qısa məlumat..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Məzmun</label>
                    <textarea
                      {...register(activeTab === 'az' ? 'contentAz' : activeTab === 'en' ? 'contentEn' : 'contentRu')}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors h-64 font-mono text-sm leading-relaxed"
                      placeholder="Məqalənin əsas məzmunu (HTML dəstəklənir)..."
                    />
                    {errors[activeTab === 'az' ? 'contentAz' : activeTab === 'en' ? 'contentEn' : 'contentRu'] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[activeTab === 'az' ? 'contentAz' : activeTab === 'en' ? 'contentEn' : 'contentRu']?.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Common Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">URL Slug</label>
                    <input
                      {...register('slug')}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                      placeholder="meqale-basligi"
                    />
                    {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Şəkil URL</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <ImageIcon size={18} />
                      </div>
                      <input
                        {...register('image')}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Oxuma Vaxtı</label>
                    <input
                      {...register('readingTime')}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                      placeholder="Məsələn: 5 dəq"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Status</label>
                    <select
                      {...register('isPublished')}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors appearance-none"
                    >
                      <option value="true">Aktiv (Saytda görünür)</option>
                      <option value="false">Qaralama (Gizli)</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-900/50">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                disabled={isSubmitting}
              >
                Ləğv et
              </button>
              <button
                type="submit"
                form="blog-form"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {isSubmitting ? 'Saxlanılır...' : 'Yadda Saxla'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
