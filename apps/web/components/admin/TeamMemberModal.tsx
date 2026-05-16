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
  positionAz: z.string().min(1, 'Azərbaycan dilində vəzifə mütləqdir'),
  positionEn: z.string().min(1, 'İngilis dilində vəzifə mütləqdir'),
  positionRu: z.string().min(1, 'Rus dilində vəzifə mütləqdir'),
  image: z.string().optional().default(''),
  order: z.number().int().default(0),
});

type FormData = z.infer<typeof formSchema>;

interface TeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  memberToEdit?: any | null;
}

export default function TeamMemberModal({ isOpen, onClose, onSuccess, memberToEdit }: TeamMemberModalProps) {
  const [activeTab, setActiveTab] = useState<'az' | 'en' | 'ru'>('az');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { image: '', order: 0 },
  });

  useEffect(() => {
    if (isOpen) {
      if (memberToEdit) {
        reset({
          name: memberToEdit.name || '',
          positionAz: memberToEdit.positionAz || '',
          positionEn: memberToEdit.positionEn || '',
          positionRu: memberToEdit.positionRu || '',
          image: memberToEdit.image || '',
          order: memberToEdit.order ?? 0,
        });
      } else {
        reset({ name: '', positionAz: '', positionEn: '', positionRu: '', image: '', order: 0 });
      }
      setActiveTab('az');
    }
  }, [isOpen, memberToEdit, reset]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      if (memberToEdit) {
        const res = await adminApi.put(`/team/admin/${memberToEdit.id}`, data);
        if (res.data.success) { onSuccess(); onClose(); }
      } else {
        const res = await adminApi.post('/team/admin', data);
        if (res.data.success) { onSuccess(); onClose(); }
      }
    } catch (error) {
      console.error('Error saving team member:', error);
      alert('Komanda üzvünü yadda saxlamaq mümkün olmadı.');
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
          <motion.div className="relative z-10 w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col" initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
              <div>
                <h2 className="text-xl font-bold text-white">{memberToEdit ? 'Komanda Üzvünü Redaktə Et' : 'Yeni Komanda Üzvü'}</h2>
                <p className="text-slate-400 text-sm mt-1">Məlumatları 3 dildə daxil edin</p>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <form id="team-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex p-1 bg-slate-800 rounded-xl w-fit">
                  {tabs.map((tab) => (
                    <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-amber-500 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>{tab.label}</button>
                  ))}
                </div>

                <div className="space-y-5 bg-slate-800/20 p-5 rounded-2xl border border-slate-800/50">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Vəzifə</label>
                    <input
                      {...register(activeTab === 'az' ? 'positionAz' : activeTab === 'en' ? 'positionEn' : 'positionRu')}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder="Vəzifə..."
                    />
                    {errors[activeTab === 'az' ? 'positionAz' : activeTab === 'en' ? 'positionEn' : 'positionRu'] && (
                      <p className="text-red-500 text-xs mt-1">{errors[activeTab === 'az' ? 'positionAz' : activeTab === 'en' ? 'positionEn' : 'positionRu']?.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Ad</label>
                    <input {...register('name')} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors" placeholder="Ad..." />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Sıra (Kiçik rəqəm öndə görünər)</label>
                    <input {...register('order', { valueAsNumber: true })} type="number" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors" />
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
              <button type="submit" form="team-form" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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
