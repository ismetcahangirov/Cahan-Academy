'use client';

import React, { useState, useEffect } from 'react';
import adminApi from '@/lib/adminApi';
import { Download, Search, RefreshCcw } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  status: string;
  createdAt: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const { data } = await adminApi.get('/leads');
      if (data.success) {
        setLeads(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleExportCSV = async () => {
    try {
      const response = await adminApi.get('/leads/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leads-export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('CSV eksport xətası');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const { data } = await adminApi.patch(`/leads/${id}/status`, { status });
      if (data.success) {
        setLeads(leads.map(l => l.id === id ? { ...l, status } : l));
      }
    } catch (error) {
      alert('Status yeniləmə xətası');
    }
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Müraciətlər</h1>
          <p className="text-slate-400 text-sm">Kurslara olan qeydiyyat müraciətlərinin siyahısı</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLeads}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            title="Yenilə"
          >
            <RefreshCcw size={18} />
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg font-medium transition-colors"
          >
            <Download size={18} />
            CSV Eksport
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search size={18} className="text-slate-500" />
          <input
            type="text"
            placeholder="Axtar (Ad, email, kurs...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-slate-200 placeholder-slate-500 text-sm w-full"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">İstifadəçi</th>
                <th className="px-6 py-3 font-medium">Kurs</th>
                <th className="px-6 py-3 font-medium">Tarix</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Yüklənir...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Müraciət tapılmadı.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium text-sm">{lead.name}</span>
                        <span className="text-slate-500 text-xs">{lead.email}</span>
                        <span className="text-slate-500 text-xs">{lead.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {lead.course}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(lead.createdAt).toLocaleDateString('az-AZ')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        lead.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                        lead.status === 'contacted' ? 'bg-blue-500/10 text-blue-500' :
                        lead.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {lead.status === 'pending' ? 'Gözləyir' :
                         lead.status === 'contacted' ? 'Əlaqə saxlanılıb' :
                         lead.status === 'completed' ? 'Tamamlanıb' : 'Ləğv edilib'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg focus:ring-amber-500 focus:border-amber-500 p-1 cursor-pointer"
                      >
                        <option value="pending">Gözləyir</option>
                        <option value="contacted">Əlaqə saxlanılıb</option>
                        <option value="completed">Tamamlanıb</option>
                        <option value="cancelled">Ləğv et</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
