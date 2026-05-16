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
  name: z.string().min(2, 'Ad mütləqdir'),
  slug: z.string().min(1, 'Slug mütləqdir'),
  image: z.string().optional().default(''),
  bioAz: z.string().optional().default(''),
  bioEn: z.string().optional().default(''),
  bioRu: z.string().optional().default(''),
  positionAz: z.string().optional().default(''),
  positionEn: z.string().optional().default(''),
  positionRu: z.string().optional().default(''),
});

type FormData = z.infer<typeof formSchema>;

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  teacherToEdit?: any | null;
}

export default function TeacherModal({ isOpen, onClose, onSuccess, teacherToEdit }: TeacherModalProps) {
  const [activeTab, setActiveTab] = useState<'az' | 'en' | 'ru'>('az');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      image: '',
      bioAz: '', bioEn: '', bioRu: '',
      positionAz: '', positionEn: '', positionRu: '',
    },
  });

  const nameWatcher = watch('name');

  useEffect(() => {
    if (isOpen) {
      if (teacherToEdit) {
        reset({
          name: teacherToEdit.name || '',
          slug: teacherToEdit.slug || '',
          image: teacherToEdit.image || '',
          bioAz: teacherToEdit.bioAz || '',
          bioEn: teacherToEdit.bioEn || '',
          bioRu: teacherToEdit.bioRu || '',
          positionAz: teacherToEdit.positionAz || '',
          positionEn: teacherToEdit.positionEn || '',
          positionRu: teacherToEdit.positionRu || '',
        });
      } else {
        reset({ name: '', slug: '', image: '', bioAz: '', bioEn: '', bioRu: '', positionAz: '', positionEn: '', positionRu: '' });
      }
      setActiveTab('az');
    }
  }, [isOpen, teacherToEdit, reset]);

  useEffect(() => {
    if (!teacherToEdit && nameWatcher) {
      const slugify = (text: string) => {
        return text
          .toString().toLowerCase().trim()
          .replace(/ə/g, 'e').replace(/ö/g, 'o').replace(/ğ/g, 'g').replace(/ı/g, 'i')
          .replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ü/g, 'u')
          .replace(/[\s\W-]+/g, '-').replace(/-+$/, '');
      };
      setValue('slug', slugify(nameWatcher), { shouldValidate: true });
    }
  }, [nameWatcher, teacherToEdit, setValue]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      if (teacherToEdit) {
        const res = await adminApi.put(`/teachers/admin/${teacherToEdit.id}`, data);
        if (res.data.success) { onSuccess(); onClose(); }
      } else {
        const res = await adminApi.post('/teachers/admin', data);
        if (res.data.success) { onSuccess(); onClose(); }
      }
    } catch (error) {
      console.error('Error saving teacher:', error);
      alert('Müəllimi yadda saxlamaq mümkün olmadı.');
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
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div className="relative z-10 w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
              <div>
                <h2 className="text-xl font-bold text-white">{teacherToEdit ? 'Müəllimi Redaktə Et' : 'Yeni Müəllim'}</h2>
                <p className="text-slate-400 text-sm mt-1">Müəllim məlumatlarını 3 dildə daxil edin</p>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <form id="teacher-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex p-1 bg-slate-800 rounded-xl w-fit">
                  {tabs.map((tab) => (
                    <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-amber-500 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>{tab.label}</button>
                  ))}
                </div>

                <div className="space-y-5 bg-slate-800/20 p-5 rounded-2xl border border-slate-800/50">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Tərcümeyi-hal (Bio)</label>
                    <textarea
                      {...register(activeTab === 'az' ? 'bioAz' : activeTab === 'en' ? 'bioEn' : 'bioRu')}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors h-32"
                      placeholder="Müəllim haqqında..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Vəzifə</label>
                    <input
                      {...register(activeTab === 'az' ? 'positionAz' : activeTab === 'en' ? 'positionEn' : 'positionRu')}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder="Vəzifə..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Ad</label>
                    <input {...register('name')} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors" placeholder="Müəllim adı..." />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">URL Slug</label>
                    <input {...register('slug')} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors" />
                    {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
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
                </div>
              </form>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-900/50">
              <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors" disabled={isSubmitting}>Ləğv et</button>
              <button type="submit" form="teacher-form" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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
