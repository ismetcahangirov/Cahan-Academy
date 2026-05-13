'use client';

import React, { useState, useEffect } from 'react';
import adminApi from '@/lib/adminApi';
import { HelpCircle, Plus, Edit, Trash2, RefreshCcw, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQ {
  id: string;
  question: {
    az: string;
    en: string;
    ru: string;
  };
  answer: {
    az: string;
    en: string;
    ru: string;
  };
  order: number;
  isActive: boolean;
}

export default function FAQAdminPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchFaqs = async () => {
    setIsLoading(true);
    try {
      const { data } = await adminApi.get('/faqs/admin/all');
      if (data.success) {
        setFaqs(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Bu sualı silmək istədiyinizə əminsiniz?')) return;
    
    try {
      const { data } = await adminApi.delete(`/faqs/admin/${id}`);
      if (data.success) {
        setFaqs(faqs.filter(f => f.id !== id));
      }
    } catch (error) {
      alert('Silmə xətası');
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { data } = await adminApi.put(`/faqs/admin/${id}/status`, { isActive: !currentStatus });
      if (data.success) {
        setFaqs(faqs.map(f => f.id === id ? { ...f, isActive: !currentStatus } : f));
      }
    } catch (error) {
      alert('Status dəyişmə xətası');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Tez-tez verilən suallar (FAQ)</h1>
          <p className="text-slate-400 text-sm">Saytda görünən sualların idarə edilməsi</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchFaqs}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            <RefreshCcw size={18} />
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            Yeni Sual
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Yüklənir...</div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-12 text-slate-500">Heç bir sual tapılmadı.</div>
        ) : (
          faqs.sort((a, b) => a.order - b.order).map((faq) => (
            <div 
              key={faq.id} 
              className={`bg-slate-900 border transition-all rounded-xl overflow-hidden ${
                expandedId === faq.id ? 'border-amber-500/50 ring-1 ring-amber-500/20' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div 
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    faq.isActive ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800 text-slate-500'
                  }`}>
                    <HelpCircle size={18} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-white font-medium text-sm truncate">{faq.question.az}</span>
                    <span className="text-slate-500 text-xs">Sıra: {faq.order}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 ml-4" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => toggleStatus(faq.id, faq.isActive)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      faq.isActive ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-slate-500 hover:bg-slate-800'
                    }`}
                    title={faq.isActive ? 'Deaktiv et' : 'Aktiv et'}
                  >
                    {faq.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <button
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    title="Redaktə et"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Sil"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="text-slate-500 ml-2">
                    {expandedId === faq.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
              </div>

              {expandedId === faq.id && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Azərbaycanca</h4>
                      <p className="text-sm text-slate-300 font-medium">{faq.question.az}</p>
                      <p className="text-sm text-slate-400 leading-relaxed">{faq.answer.az}</p>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">İngiliscə</h4>
                      <p className="text-sm text-slate-300 font-medium">{faq.question.en}</p>
                      <p className="text-sm text-slate-400 leading-relaxed">{faq.answer.en}</p>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rusca</h4>
                      <p className="text-sm text-slate-300 font-medium">{faq.question.ru}</p>
                      <p className="text-sm text-slate-400 leading-relaxed">{faq.answer.ru}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
