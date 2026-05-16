'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import adminApi from '@/lib/adminApi';
import ImageUpload from './ImageUpload';

const formSchema = z.object({
  titleAz: z.string().min(1, 'Azərbaycan dilində başlıq mütləqdir'),
  titleEn: z.string().min(1, 'İngilis dilində başlıq mütləqdir'),
  titleRu: z.string().min(1, 'Rus dilində başlıq mütləqdir'),
  slug: z.string().min(1, 'Slug mütləqdir'),
  descriptionAz: z.string().min(1, 'Azərbaycan dilində təsvir mütləqdir'),
  descriptionEn: z.string().min(1, 'İngilis dilində təsvir mütləqdir'),
  descriptionRu: z.string().min(1, 'Rus dilində təsvir mütləqdir'),
  categoryId: z.string().min(1, 'Kateqoriya seçimi mütləqdir'),
  teacherId: z.string().min(1, 'Müəllim seçimi mütləqdir'),
  price: z.string().optional(),
  duration: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'all']),
  image: z.string().optional(),
  isPopular: z.enum(['true', 'false']),
  rating: z.string().optional(),
  studentsCount: z.string().optional(),
  syllabusAz: z.string().optional(),
  syllabusEn: z.string().optional(),
  syllabusRu: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  courseToEdit?: any | null;
}

export default function CourseModal({ isOpen, onClose, onSuccess, courseToEdit }: CourseModalProps) {
  const [activeTab, setActiveTab] = useState<'az' | 'en' | 'ru'>('az');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isPopular: 'false',
      level: 'beginner',
      rating: '5.0',
      studentsCount: '0'
    },
  });

  const titleAzWatcher = watch('titleAz');

  useEffect(() => {
    if (isOpen) {
      // Fetch categories and teachers for dropdowns
      adminApi.get('/courses/categories').then(res => setCategories(res.data.data || []));
      adminApi.get('/teachers').then(res => setTeachers(res.data.data || []));

      if (courseToEdit) {
        reset({
          titleAz: courseToEdit.title_az || '',
          titleEn: courseToEdit.title_en || '',
          titleRu: courseToEdit.title_ru || '',
          slug: courseToEdit.slug || '',
          descriptionAz: courseToEdit.description_az || '',
          descriptionEn: courseToEdit.description_en || '',
          descriptionRu: courseToEdit.description_ru || '',
          categoryId: courseToEdit.category_id || '',
          teacherId: courseToEdit.teacher_id || '',
          price: courseToEdit.price || '',
          duration: courseToEdit.duration || '',
          level: courseToEdit.level || 'beginner',
          image: courseToEdit.image || '',
          isPopular: courseToEdit.is_popular === 'true' || courseToEdit.is_popular === true ? 'true' : 'false',
          rating: courseToEdit.rating || '5.0',
          studentsCount: courseToEdit.students_count || '0',
          syllabusAz: courseToEdit.syllabus_az || '',
          syllabusEn: courseToEdit.syllabus_en || '',
          syllabusRu: courseToEdit.syllabus_ru || '',
        });
      } else {
        reset({
          titleAz: '', titleEn: '', titleRu: '', slug: '',
          descriptionAz: '', descriptionEn: '', descriptionRu: '',
          categoryId: '', teacherId: '', price: '', duration: '',
          level: 'beginner', image: '', isPopular: 'false', rating: '5.0', studentsCount: '0',
          syllabusAz: '', syllabusEn: '', syllabusRu: '',
        });
      }
      setActiveTab('az');
    }
  }, [isOpen, courseToEdit, reset]);

  // Auto-generate slug from AZ title if it's a new course
  useEffect(() => {
    if (!courseToEdit && titleAzWatcher) {
      const slugify = (text: string) => {
        return text
          .toString()
          .toLowerCase()
          .trim()
          .replace(/ə/g, 'e').replace(/ö/g, 'o').replace(/ğ/g, 'g').replace(/ı/g, 'i')
          .replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ü/g, 'u')
          .replace(/[\s\W-]+/g, '-').replace(/-+$/, '');
      };
      setValue('slug', slugify(titleAzWatcher), { shouldValidate: true });
    }
  }, [titleAzWatcher, courseToEdit, setValue]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      if (courseToEdit) {
        const res = await adminApi.put(`/courses/admin/${courseToEdit.id}`, data);
        if (res.data.success) {
          onSuccess();
          onClose();
        }
      } else {
        const res = await adminApi.post('/courses/admin', data);
        if (res.data.success) {
          onSuccess();
          onClose();
        }
      }
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Kursu yadda saxlamaq mümkün olmadı.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = (errs: any) => {
    // Switch to the first tab that has an error
    for (const tab of tabs) {
      if (tab.fields.some(field => errs[field])) {
        setActiveTab(tab.id as any);
        break;
      }
    }
  };

  const tabs = [
    { id: 'az', label: 'Azərbaycanca', fields: ['titleAz', 'descriptionAz'] },
    { id: 'en', label: 'İngiliscə', fields: ['titleEn', 'descriptionEn'] },
    { id: 'ru', label: 'Rusca', fields: ['titleRu', 'descriptionRu'] },
  ];

  const hasErrorInTab = (tabFields: string[]) => {
    return tabFields.some(field => errors[field as keyof FormData]);
  };

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
          <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          {/* Modal Content */}
          <motion.div
            className="relative z-10 w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {courseToEdit ? 'Kursu Redaktə Et' : 'Yeni Kurs'}
                </h2>
                <p className="text-slate-400 text-sm mt-1">Məlumatları daxil edin</p>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <form id="course-form" onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
                
                {/* Language Tabs */}
                <div className="flex p-1 bg-slate-800 rounded-xl w-fit relative">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id} type="button"
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`relative px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === tab.id ? 'bg-amber-500 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tab.label}
                      {hasErrorInTab(tab.fields) && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-800" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-5 bg-slate-800/20 p-5 rounded-2xl border border-slate-800/50">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Kursun Adı</label>
                    <input
                      {...register(activeTab === 'az' ? 'titleAz' : activeTab === 'en' ? 'titleEn' : 'titleRu')}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder="Ad..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Təsvir (Description)</label>
                    <textarea
                      {...register(activeTab === 'az' ? 'descriptionAz' : activeTab === 'en' ? 'descriptionEn' : 'descriptionRu')}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors h-32"
                      placeholder="Kurs haqqında məlumat..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Proqram (Syllabus - HTML dəstəklənir)</label>
                    <textarea
                      {...register(activeTab === 'az' ? 'syllabusAz' : activeTab === 'en' ? 'syllabusEn' : 'syllabusRu')}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors h-32"
                      placeholder="<ul><li>Mövzu 1</li>...</ul>"
                    />
                  </div>

                  {/* Show validation errors for the current tab fields */}
                  {activeTab === 'az' && (
                    <>
                      {errors.titleAz && <p className="text-red-500 text-xs">{errors.titleAz.message}</p>}
                      {errors.descriptionAz && <p className="text-red-500 text-xs">{errors.descriptionAz.message}</p>}
                    </>
                  )}
                  {activeTab === 'en' && (
                    <>
                      {errors.titleEn && <p className="text-red-500 text-xs">{errors.titleEn.message}</p>}
                      {errors.descriptionEn && <p className="text-red-500 text-xs">{errors.descriptionEn.message}</p>}
                    </>
                  )}
                  {activeTab === 'ru' && (
                    <>
                      {errors.titleRu && <p className="text-red-500 text-xs">{errors.titleRu.message}</p>}
                      {errors.descriptionRu && <p className="text-red-500 text-xs">{errors.descriptionRu.message}</p>}
                    </>
                  )}
                </div>

                {/* Common Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">URL Slug</label>
                    <input {...register('slug')} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white transition-colors" />
                    {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Kateqoriya</label>
                    <select {...register('categoryId')} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white transition-colors">
                      <option value="">Seçin...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.nameAz}</option>)}
                    </select>
                    {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Müəllim</label>
                    <select {...register('teacherId')} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white transition-colors">
                      <option value="">Seçin...</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    {errors.teacherId && <p className="text-red-500 text-xs mt-1">{errors.teacherId.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Qiymət</label>
                    <input {...register('price')} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white transition-colors" placeholder="Məs: 299 ₼" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Müddət</label>
                    <input {...register('duration')} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white transition-colors" placeholder="Məs: 3 ay" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Çətinlik (Level)</label>
                    <select {...register('level')} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white transition-colors">
                      <option value="beginner">Başlanğıc</option>
                      <option value="intermediate">Orta</option>
                      <option value="advanced">İrəli</option>
                      <option value="all">Hamı üçün</option>
                    </select>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium text-slate-300">Şəkil</label>
                    <Controller
                      name="image"
                      control={control}
                      render={({ field }) => (
                        <ImageUpload value={field.value || ''} onChange={field.onChange} />
                      )}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Populyar</label>
                    <select {...register('isPopular')} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white transition-colors">
                      <option value="false">Xeyr</option>
                      <option value="true">Bəli</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Reytinq (Məs: 4.9)</label>
                    <input {...register('rating')} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white transition-colors" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Tələbə Sayı (Məs: 324)</label>
                    <input {...register('studentsCount')} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white transition-colors" />
                  </div>

                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-900/50">
              <div className="flex flex-col items-end gap-2">
                {Object.keys(errors).length > 0 && (
                  <p className="text-red-500 text-xs font-medium">Bütün mütləq sahələri (AZ, EN, RU) doldurun</p>
                )}
                <div className="flex gap-3">
                  <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors" disabled={isSubmitting}>Ləğv et</button>
                  <button type="submit" form="course-form" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <Save size={18} />
                    {isSubmitting ? 'Saxlanılır...' : 'Yadda Saxla'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
