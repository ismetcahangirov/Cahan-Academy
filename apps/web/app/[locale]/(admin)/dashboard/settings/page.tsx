'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import adminApi from '@/lib/adminApi';
import { Save, KeyRound, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSubmitting(true);
    
    try {
      const { data } = await adminApi.put('/admin/profile', profileData);
      if (data.success) {
        toast.success(data.message);
        // AuthContext istifadəçisini yeniləyirik
        updateUser(data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Profili yeniləmək mümkün olmadı');
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Yeni şifrələr uyğun gəlmir');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Yeni şifrə ən azı 6 simvol olmalıdır');
      return;
    }

    setIsPasswordSubmitting(true);
    
    try {
      const { data } = await adminApi.put('/admin/profile/password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      
      if (data.success) {
        toast.success(data.message);
        // Şifrə dəyişdikdən sonra sessiya ləğv edilir
        setTimeout(() => {
          logout();
        }, 1500);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Şifrəni dəyişmək mümkün olmadı');
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Tənzimləmələr</h1>
        <p className="text-slate-400 mt-1">Şəxsi məlumatlarınızı və təhlükəsizlik ayarlarınızı idarə edin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <UserIcon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Profil Məlumatları</h2>
              <p className="text-sm text-slate-400">Şəxsi məlumatlarınızı yeniləyin</p>
            </div>
          </div>
          
          <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Ad</label>
              <input
                type="text"
                required
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isProfileSubmitting || (profileData.name === user?.name && profileData.email === user?.email)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-amber-500 text-slate-900 rounded-lg font-medium hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {isProfileSubmitting ? 'Saxlanılır...' : 'Məlumatları Saxla'}
              </button>
            </div>
          </form>
        </div>

        {/* Security Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <KeyRound size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Təhlükəsizlik</h2>
              <p className="text-sm text-slate-400">Hesabınızın şifrəsini dəyişdirin</p>
            </div>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Mövcud Şifrə</label>
              <input
                type="password"
                required
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Yeni Şifrə</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Yeni Şifrə (Təkrar)</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPasswordSubmitting || !passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {isPasswordSubmitting ? 'Dəyişdirilir...' : 'Şifrəni Dəyişdir'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
