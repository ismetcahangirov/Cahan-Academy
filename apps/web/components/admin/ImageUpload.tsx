'use client';

import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, Link2, X, Loader2 } from 'lucide-react';
import adminApi from '@/lib/adminApi';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [mode, setMode] = useState<'url' | 'upload'>('url');
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string>(value || '');
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    onChange(url);
    setPreview(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const { data } = await adminApi.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.success) {
        const uploadedUrl = data.data.url;
        onChange(uploadedUrl);
        setPreview(uploadedUrl);
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Fayl yükləmək mümkün olmadı.');
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    onChange('');
    setPreview('');
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';
  const resolvedPreview = preview && (preview.startsWith('blob:') || preview.startsWith('http') || preview.startsWith('/'))
    ? (preview.startsWith('/') ? apiBase + preview : preview)
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
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="flex items-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer text-sm font-medium transition-colors"
            >
              <Upload size={18} /> Fayl Seç
            </label>
            {selectedFile && (
              <span className="text-sm text-slate-400 truncate max-w-[200px]">{selectedFile.name}</span>
            )}
          </div>
          {selectedFile && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Yüklənir...
                </>
              ) : (
                <>
                  <Upload size={16} /> Yüklə
                </>
              )}
            </button>
          )}
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
