'use client';

import React, { useState, useEffect } from 'react';
import adminApi from '@/lib/adminApi';
import { Search, RefreshCcw, Mail, MailOpen } from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  isRead: string;
  createdAt: string;
}

export default function ContactsPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const { data } = await adminApi.get('/contacts');
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const { data } = await adminApi.patch(`/contacts/${id}/read`);
      if (data.success) {
        setMessages(messages.map(m => m.id === id ? { ...m, isRead: 'true' } : m));
      }
    } catch (error) {
      alert('Status yeniləmə xətası');
    }
  };

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Mesajlar</h1>
          <p className="text-slate-400 text-sm">Əlaqə səhifəsindən göndərilən mesajların siyahısı</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchMessages}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            title="Yenilə"
          >
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search size={18} className="text-slate-500" />
          <input
            type="text"
            placeholder="Axtar (Ad, email, mövzu...)"
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
                <th className="px-6 py-3 font-medium">Mövzu / Mesaj</th>
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
              ) : filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Mesaj tapılmadı.
                  </td>
                </tr>
              ) : (
                filteredMessages.map((message) => (
                  <tr key={message.id} className={`hover:bg-slate-800/30 transition-colors ${message.isRead === 'false' ? 'bg-slate-800/10' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium text-sm">{message.name}</span>
                        <span className="text-slate-500 text-xs">{message.email}</span>
                        <span className="text-slate-500 text-xs">{message.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col max-w-xs">
                        <span className="text-slate-300 text-sm font-medium">{message.subject}</span>
                        <span className="text-slate-500 text-xs truncate mt-1" title={message.message}>{message.message}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(message.createdAt).toLocaleDateString('az-AZ')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        message.isRead === 'true' ? 'bg-slate-800 text-slate-400' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {message.isRead === 'true' ? 'Oxunub' : 'Yeni'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {message.isRead === 'false' ? (
                        <button
                          onClick={() => handleMarkAsRead(message.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-xs font-medium rounded-lg transition-colors"
                          title="Oxunmuş kimi qeyd et"
                        >
                          <MailOpen size={14} />
                          Oxundu et
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-500 text-xs">
                          <Mail size={14} />
                          Oxunub
                        </span>
                      )}
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
