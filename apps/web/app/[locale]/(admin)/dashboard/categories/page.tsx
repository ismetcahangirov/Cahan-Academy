'use client';

import React, { useState, useEffect } from 'react';
import adminApi from '@/lib/adminApi';
import { Plus, Edit, Trash2, RefreshCcw, Tags } from 'lucide-react';
import CategoryModal from '@/components/admin/CategoryModal';

interface Category {
  id: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  slug: string;
}

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const { data } = await adminApi.get('/categories');
      if (data.success) setCategories(data.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleEdit = (category: Category) => {
    setEditTarget(category);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kateqoriyanı silmək istədiyinizə əminsiniz?')) return;
    try {
      const { data } = await adminApi.delete(`/categories/admin/${id}`);
      if (data.success) setCategories(categories.filter(c => c.id !== id));
    } catch (error) {
      alert('Silmə xətası');
    }
  };

  const handleSuccess = () => {
    setModalOpen(false);
    setEditTarget(null);
    fetchCategories();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Kateqoriyalar</h1>
          <p className="text-slate-400 text-sm">Kurs kateqoriyalarının idarə edilməsi</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchCategories} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors" title="Yenilə">
            <RefreshCcw size={18} />
          </button>
          <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg font-medium transition-colors">
            <Plus size={18} /> Yeni Kateqoriya
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">Kateqoriya</th>
                <th className="px-6 py-3 font-medium">Slug</th>
                <th className="px-6 py-3 font-medium">Ad (EN)</th>
                <th className="px-6 py-3 font-medium">Ad (RU)</th>
                <th className="px-6 py-3 font-medium text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Yüklənir...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Heç bir kateqoriya tapılmadı.</td></tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <Tags size={16} className="text-amber-500" />
                        </div>
                        <span className="text-white font-medium text-sm">{category.nameAz}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-mono">{category.slug}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{category.nameEn}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{category.nameRu}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(category)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title="Redaktə et">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(category.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Sil">
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

      <CategoryModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditTarget(null); }} onSuccess={handleSuccess} categoryToEdit={editTarget} />
    </div>
  );
}
