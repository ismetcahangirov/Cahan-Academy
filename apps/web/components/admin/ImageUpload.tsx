'use client';

import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, Link2, X, Loader2 } from 'lucide-react';
import adminApi from '@/lib/adminApi';
import { getCloudinaryScript } from '@/lib/cloudinary';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [mode, setMode] = useState<'url' | 'upload'>('url');
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string>(value || '');
  const widgetRef = useRef<ReturnType<typeof window.cloudinary.createUploadWidget> | null>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    onChange(url);
    setPreview(url);
  };

  const handleCloudinaryUpload = async () => {
    setIsUploading(true);
    try {
      await getCloudinaryScript();

      if (widgetRef.current) {
        widgetRef.current.destroy();
        widgetRef.current = null;
      }

      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'cahan-academy',
          apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '',
          uploadSignature: async (callback: (sig: string) => void, paramsToSign: Record<string, unknown>) => {
            try {
              const { data } = await adminApi.post('/upload/signature', paramsToSign);
              if (data.success) {
                callback(data.data.signature);
              }
            } catch {
              // signature failed
            }
          },
          folder: 'cahan-academy',
          sources: ['local', 'url', 'camera'],
          multiple: false,
          maxFileSize: 10000000,
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
          styles: {
            palette: {
              window: '#1E293B',
              windowBorder: '#334155',
              tabIcon: '#F59E0B',
              menuIcons: '#94A3B8',
              textDark: '#F8FAFC',
              textLight: '#CBD5E1',
              link: '#F59E0B',
              action: '#F59E0B',
              inProgress: '#F59E0B',
              complete: '#10B981',
              error: '#EF4444',
              sourceBg: '#0F172A',
            },
          },
        },
        (error: unknown, result: { event: string; info?: { secure_url: string } }) => {
          if (result.event === 'success' && result.info) {
            const url = result.info.secure_url;
            onChange(url);
            setPreview(url);
            setIsUploading(false);
          }
          if (error || result.event === 'abort') {
            setIsUploading(false);
          }
        }
      );

      widget.open();
      widgetRef.current = widget;
    } catch {
      alert('Fayl yükləmək mümkün olmadı.');
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    onChange('');
    setPreview('');
    if (widgetRef.current) {
      widgetRef.current.destroy();
      widgetRef.current = null;
    }
  };

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
  const resolvedPreview =
    preview && (preview.startsWith('blob:') || preview.startsWith('http') || preview.startsWith('/'))
      ? preview.startsWith('/')
        ? apiBase + preview
        : preview
      : preview;

  return (
    <div className="space-y-3">
      <div className="flex p-1 bg-slate-800 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'url' ? 'bg-amber-500 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Link2 size={16} /> URL
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'upload' ? 'bg-amber-500 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Upload size={16} /> Fayl Yüklə
        </button>
      </div>

      {mode === 'url' ? (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <ImageIcon size={18} />
          </div>
          <input
            type="text"
            value={value || ''}
            onChange={handleUrlChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            placeholder="https://..."
          />
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={handleCloudinaryUpload}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Yüklənir...
              </>
            ) : (
              <>
                <Upload size={16} /> Şəkil Yüklə
              </>
            )}
          </button>
        </div>
      )}

      {resolvedPreview && (
        <div className="relative w-32 h-20 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 group">
          <img src={resolvedPreview} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-1 right-1 p-0.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
