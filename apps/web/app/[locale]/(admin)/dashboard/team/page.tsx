'use client';

import React, { useState, useEffect } from 'react';
import adminApi from '@/lib/adminApi';
import { Plus, Edit, Trash2, RefreshCcw, Users } from 'lucide-react';
import TeamMemberModal from '@/components/admin/TeamMemberModal';

interface TeamMember {
  id: string;
  name: string;
  positionAz: string;
  positionEn: string;
  positionRu: string;
  image: string | null;
  order: number;
}

export default function TeamAdminPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TeamMember | null>(null);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const { data } = await adminApi.get('/team');
      if (data.success) setMembers(data.data);
    } catch (error) {
      console.error('Failed to fetch team members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleEdit = (member: TeamMember) => {
    setEditTarget(member);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu komanda üzvünü silmək istədiyinizə əminsiniz?')) return;
    try {
      const { data } = await adminApi.delete(`/team/admin/${id}`);
      if (data.success) setMembers(members.filter(m => m.id !== id));
    } catch (error) {
      alert('Silmə xətası');
    }
  };

  const handleSuccess = () => {
    setModalOpen(false);
    setEditTarget(null);
    fetchMembers();
  };

  const sorted = [...members].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Komanda Üzvləri</h1>
          <p className="text-slate-400 text-sm">Komanda heyətinin idarə edilməsi</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchMembers} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors" title="Yenilə">
            <RefreshCcw size={18} />
          </button>
          <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg font-medium transition-colors">
            <Plus size={18} /> Yeni Üzv
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">Üzv</th>
                <th className="px-6 py-3 font-medium">Vəzifə (AZ)</th>
                <th className="px-6 py-3 font-medium">Vəzifə (EN)</th>
                <th className="px-6 py-3 font-medium">Sıra</th>
                <th className="px-6 py-3 font-medium text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Yüklənir...</td></tr>
              ) : sorted.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Heç bir komanda üzvü tapılmadı.</td></tr>
              ) : (
                sorted.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden flex items-center justify-center">
                          {member.image ? (
                            <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <Users size={20} className="text-slate-500" />
                          )}
                        </div>
                        <span className="text-white font-medium text-sm">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{member.positionAz}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{member.positionEn}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{member.order}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(member)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title="Redaktə et">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(member.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Sil">
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

      <TeamMemberModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditTarget(null); }} onSuccess={handleSuccess} memberToEdit={editTarget} />
    </div>
  );
}
