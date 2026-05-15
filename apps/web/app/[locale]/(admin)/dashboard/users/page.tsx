'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import adminApi from '@/lib/adminApi';
import { Shield, ShieldAlert, Trash2, UserPlus, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  isSuperAdmin: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    isSuperAdmin: false
  });

  const fetchAdmins = async () => {
    try {
      const { data } = await adminApi.get('/admin/users');
      if (data.success) {
        setAdmins(data.data);
      }
    } catch (error) {
      toast.error('Adminləri yükləmək mümkün olmadı');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Bu admini silmək istədiyinizə əminsiniz?')) return;
    try {
      const { data } = await adminApi.delete(`/admin/users/${id}`);
      if (data.success) {
        toast.success(data.message);
        setAdmins(prev => prev.filter(a => a.id !== id));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Admini silmək mümkün olmadı');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data } = await adminApi.post('/admin/users', formData);
      if (data.success) {
        toast.success(data.message);
        setIsModalOpen(false);
        setFormData({ name: '', email: '', password: '', isSuperAdmin: false });
        fetchAdmins();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Admin yaratmaq mümkün olmadı');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">İstifadəçilər</h1>
          <p className="text-slate-400 mt-1">Sistem idarəçilərini buradan idarə edin.</p>
        </div>
        {user?.isSuperAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-900 rounded-lg font-medium hover:bg-amber-400 transition-colors"
          >
            <UserPlus size={18} />
            Yeni Admin
          </button>
        )}
      </div>

      {!user?.isSuperAdmin && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
          <ShieldAlert className="text-blue-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-blue-500 font-medium">Məlumat</h3>
            <p className="text-blue-400/80 text-sm mt-1">
              Siz yalnız izləyici (adi admin) hüquqlarına sahibsiniz. Yeni istifadəçi yaratmaq və ya mövcud istifadəçiləri silmək üçün Super Admin hüququ tələb olunur.
            </p>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/50 text-slate-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Ad</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Rol</th>
                <th className="px-6 py-4 font-medium">Yaradılma Tarixi</th>
                {user?.isSuperAdmin && <th className="px-6 py-4 font-medium text-right">Əməliyyatlar</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-white">{admin.name}</td>
                  <td className="px-6 py-4 text-slate-300">{admin.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      admin.isSuperAdmin 
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      <Shield size={12} />
                      {admin.isSuperAdmin ? 'Super Admin' : 'Admin'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {new Date(admin.createdAt).toLocaleDateString('az-AZ')}
                  </td>
                  {user?.isSuperAdmin && (
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(admin.id)}
                        disabled={admin.id === user.id}
                        className={`p-2 rounded-lg transition-colors ${
                          admin.id === user.id 
                            ? 'text-slate-600 cursor-not-allowed' 
                            : 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                        }`}
                        title={admin.id === user.id ? 'Öz hesabınızı silə bilməzsiniz' : 'Sil'}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-xl font-semibold text-white">Yeni Admin Yarat</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Ad</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  placeholder="Adminin adı"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  placeholder="admin@misal.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Şifrə</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  placeholder="Ən azı 6 simvol"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isSuperAdmin"
                  checked={formData.isSuperAdmin}
                  onChange={(e) => setFormData({ ...formData, isSuperAdmin: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900"
                />
                <label htmlFor="isSuperAdmin" className="text-sm text-slate-300 select-none cursor-pointer">
                  Super Admin hüququ ver
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-amber-500 text-slate-900 rounded-lg font-medium hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Yaradılır...' : 'Yarat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
