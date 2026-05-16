'use client';

import React, { useState, useEffect } from 'react';
import adminApi from '@/lib/adminApi';
import { Plus, Edit, Trash2, RefreshCcw, GraduationCap } from 'lucide-react';
import TeacherModal from '@/components/admin/TeacherModal';

interface Teacher {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  bioAz: string | null;
  bioEn: string | null;
  bioRu: string | null;
  positionAz: string | null;
  positionEn: string | null;
  positionRu: string | null;
}

export default function TeachersAdminPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Teacher | null>(null);

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const { data } = await adminApi.get('/teachers/admin/list');
      if (data.success) setTeachers(data.data);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTeachers(); }, []);

  const handleEdit = (teacher: Teacher) => {
    setEditTarget(teacher);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu müəllimi silmək istədiyinizə əminsiniz?')) return;
    try {
      const { data } = await adminApi.delete(`/teachers/admin/${id}`);
      if (data.success) setTeachers(teachers.filter(t => t.id !== id));
    } catch (error) {
      alert('Silmə xətası');
    }
  };

  const handleSuccess = () => {
    setModalOpen(false);
    setEditTarget(null);
    fetchTeachers();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Müəllimlər</h1>
          <p className="text-slate-400 text-sm">Müəllim heyətinin idarə edilməsi</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchTeachers} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors" title="Yenilə">
            <RefreshCcw size={18} />
          </button>
          <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg font-medium transition-colors">
            <Plus size={18} /> Yeni Müəllim
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">Müəllim</th>
                <th className="px-6 py-3 font-medium">Slug</th>
                <th className="px-6 py-3 font-medium">Vəzifə (AZ)</th>
                <th className="px-6 py-3 font-medium text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Yüklənir...</td></tr>
              ) : teachers.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Heç bir müəllim tapılmadı.</td></tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden flex items-center justify-center">
                          {teacher.image ? (
                            <img src={teacher.image} alt={teacher.name} className="w-full h-full object-cover" />
                          ) : (
                            <GraduationCap size={20} className="text-slate-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{teacher.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-mono">{teacher.slug}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{teacher.positionAz || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(teacher)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title="Redaktə et">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(teacher.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Sil">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TeacherModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditTarget(null); }} onSuccess={handleSuccess} teacherToEdit={editTarget} />
    </div>
  );
}
