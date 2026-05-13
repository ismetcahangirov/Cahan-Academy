'use client';

import React, { useState, useEffect } from 'react';
import adminApi from '@/lib/adminApi';
import { FileText, Plus, Edit, Trash2, ExternalLink, RefreshCcw, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

interface BlogPost {
  post: {
    id: string;
    slug: string;
    titleAz: string;
    isPublished: string;
    createdAt: string;
  };
  author: {
    name: string;
  } | null;
}

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const { data } = await adminApi.get('/blog/admin/list');
      if (data.success) {
        setPosts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Bu məqaləni silmək istədiyinizə əminsiniz?')) return;
    
    try {
      const { data } = await adminApi.delete(`/blog/${id}`);
      if (data.success) {
        setPosts(posts.filter(p => p.post.id !== id));
      }
    } catch (error) {
      alert('Silmə xətası');
    }
  };

  const togglePublish = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'true' ? 'false' : 'true';
      const { data } = await adminApi.put(`/blog/${id}`, { isPublished: newStatus });
      if (data.success) {
        setPosts(posts.map(p => p.post.id === id ? { ...p, post: { ...p.post, isPublished: newStatus } } : p));
      }
    } catch (error) {
      alert('Status dəyişmə xətası');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Bloq İdarəetməsi</h1>
          <p className="text-slate-400 text-sm">Məqalələrin yaradılması və redaktəsi</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPosts}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            <RefreshCcw size={18} />
          </button>
          <Link
            href="/admin/dashboard/blog/new"
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            Yeni Məqalə
          </Link>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">Məqalə</th>
                <th className="px-6 py-3 font-medium">Müəllif</th>
                <th className="px-6 py-3 font-medium">Tarix</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Yüklənir...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Məqalə tapılmadı.
                  </td>
                </tr>
              ) : (
                posts.map((item) => (
                  <tr key={item.post.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-amber-500">
                          <FileText size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-medium text-sm">{item.post.titleAz}</span>
                          <span className="text-slate-500 text-xs flex items-center gap-1">
                            /{item.post.slug}
                            <ExternalLink size={10} />
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {item.author?.name || 'Naməlum'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(item.post.createdAt).toLocaleDateString('az-AZ')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => togglePublish(item.post.id, item.post.isPublished)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                          item.post.isPublished === 'true' 
                            ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' 
                            : 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20'
                        }`}
                      >
                        {item.post.isPublished === 'true' ? (
                          <><Eye size={12} /> Dərc edilib</>
                        ) : (
                          <><EyeOff size={12} /> Qaralama</>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/dashboard/blog/edit/${item.post.id}`}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="Redaktə et"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.post.id)}
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
    </div>
  );
}
