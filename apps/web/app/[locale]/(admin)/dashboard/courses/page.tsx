'use client';

import React, { useState, useEffect } from 'react';
import adminApi from '@/lib/adminApi';
import { BookOpen, Plus, Edit, Trash2, ExternalLink, RefreshCcw } from 'lucide-react';
import CourseModal from '@/components/admin/CourseModal';

interface Course {
  id: string;
  slug: string;
  title_az: string;
  category_az: string;
  teacher_name: string;
  price: string;
  created_at: string;
  is_popular: string;
}

export default function CoursesAdminPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<any | null>(null);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const { data } = await adminApi.get('/courses/admin/list');
      if (data.success) {
        setCourses(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kursu silmək istədiyinizə əminsiniz?')) return;
    
    try {
      const { data } = await adminApi.delete(`/courses/admin/${id}`);
      if (data.success) {
        setCourses(prev => prev.filter(c => c.id !== id));
      } else {
        alert(data.message || 'Kursu silmək mümkün olmadı');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      const msg = error.response?.data?.message || 'Silmə xətası';
      alert(msg);
    }
  };

  const handleEdit = async (slug: string) => {
    // Find the course from our list since it already contains all necessary fields
    const rawCourse = courses.find(c => c.slug === slug);
    if (rawCourse) {
      setCourseToEdit(rawCourse);
      setIsModalOpen(true);
    } else {
      alert('Kurs tapılmadı');
    }
  };

  const handleModalSuccess = () => {
    fetchCourses();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Kurs İdarəetməsi</h1>
          <p className="text-slate-400 text-sm">Kursların yaradılması və redaktəsi</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCourses}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            <RefreshCcw size={18} />
          </button>
          <button
            onClick={() => {
              setCourseToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            Yeni Kurs
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">Kurs</th>
                <th className="px-6 py-3 font-medium">Kateqoriya / Müəllim</th>
                <th className="px-6 py-3 font-medium">Qiymət</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Yüklənir...</td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Kurs tapılmadı.</td>
                </tr>
              ) : (
                courses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-amber-500">
                          <BookOpen size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-medium text-sm">{item.title_az}</span>
                          <span className="text-slate-500 text-xs flex items-center gap-1">
                            /{item.slug}
                            <ExternalLink size={10} />
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-300">{item.category_az || 'Təyin edilməyib'}</span>
                        <span className="text-xs text-slate-500">{item.teacher_name || 'Təyin edilməyib'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {item.price || 'Ödənişsiz'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.is_popular === 'true' || (item.is_popular as unknown as boolean) === true
                            ? 'bg-amber-500/10 text-amber-500' 
                            : 'bg-slate-500/10 text-slate-500'
                        }`}
                      >
                        {item.is_popular === 'true' || (item.is_popular as unknown as boolean) === true ? 'Populyar' : 'Normal'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item.slug)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="Redaktə et"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <Trash2 size={16} />
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

      <CourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        courseToEdit={courseToEdit}
      />
    </div>
  );
}
