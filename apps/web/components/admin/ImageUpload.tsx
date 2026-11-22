'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { AlertCircle, Image as ImageIcon, Link2, Upload, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import adminApi from '@/lib/adminApi';
import { getCloudinaryScript } from '@/lib/cloudinary';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';

/**
 * ImageUpload — image by URL or Cloudinary upload, with a framed preview. Palette-only chrome; the Cloudinary
 * widget (an iframe) gets a palette theme. Errors are shown inline (no alert()).
 * Pass `id` + `describedBy` from <FormField>'s render prop so the URL input is tied to the label.
 *
 * <FormField label={t('common.image')}>{(id) => <ImageUpload id={id} value={v} onChange={set} />}</FormField>
 */
interface Props {
  value: string;
  onChange: (url: string) => void;
  id?: string;
}

const WIDGET_PALETTE = {
  window: '#FFFFFF',
  windowBorder: '#C6A6AB',
  tabIcon: '#5C000E',
  menuIcons: '#5C000E',
  textDark: '#170004',
  textLight: '#FFFFFF',
  link: '#5C000E',
  action: '#5C000E',
  inProgress: '#5C000E',
  complete: '#5C000E',
  error: '#5C000E',
  sourceBg: '#F5F0F1',
};

export default function ImageUpload({ value, onChange, id }: Props) {
  const t = useTranslations('admin');
  const [mode, setMode] = useState<'url' | 'upload'>('url');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const widgetRef = useRef<ReturnType<typeof window.cloudinary.createUploadWidget> | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
  const preview = value ? (value.startsWith('/') ? apiBase + value : value) : '';

  const handleCloudinaryUpload = async () => {
    setIsUploading(true);
    setError('');
    try {
      await getCloudinaryScript();
      widgetRef.current?.destroy();
      widgetRef.current = null;
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'cahan-academy',
          apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '',
          uploadSignature: async (callback: (sig: string) => void, paramsToSign: Record<string, unknown>) => {
            try {
              const { data } = await adminApi.post('/upload/signature', paramsToSign);
              if (data.success) callback(data.data.signature);
            } catch {
              setError(t('image.upload_error'));
              setIsUploading(false);
            }
          },
          folder: 'cahan-academy',
          sources: ['local', 'url', 'camera'],
          multiple: false,
          maxFileSize: 10000000,
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
          styles: { palette: WIDGET_PALETTE },
        },
        (err: unknown, result: { event: string; info?: { secure_url: string } }) => {
          if (result?.event === 'success' && result.info) {
            onChange(result.info.secure_url);
            setIsUploading(false);
          }
          if (err || result?.event === 'abort' || result?.event === 'close') setIsUploading(false);
        }
      );
      widget.open();
      widgetRef.current = widget;
    } catch {
      setError(t('image.upload_error'));
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    onChange('');
    widgetRef.current?.destroy();
    widgetRef.current = null;
  };

  const tabClass = (active: boolean) => cn('btn btn-sm', active ? 'btn-primary' : 'btn-ghost');

  return (
    <div className="space-y-3">
      <div role="group" aria-label={t('image.source')} className="inline-flex gap-1 rounded-full border border-line bg-surface-2 p-1">
        <button type="button" aria-pressed={mode === 'url'} onClick={() => setMode('url')} className={tabClass(mode === 'url')}>
          <Link2 size={15} strokeWidth={1.6} aria-hidden="true" /> {t('image.by_url')}
        </button>
        <button type="button" aria-pressed={mode === 'upload'} onClick={() => setMode('upload')} className={tabClass(mode === 'upload')}>
          <Upload size={15} strokeWidth={1.6} aria-hidden="true" /> {t('image.upload')}
        </button>
      </div>

      {mode === 'url' ? (
        <Input
          id={id}
          type="url"
          icon={ImageIcon}
          value={value || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          placeholder="https://"
          aria-label={t('common.image')}
        />
      ) : (
        <Button variant="outline" icon={Upload} onClick={handleCloudinaryUpload} loading={isUploading}>
          {isUploading ? t('image.uploading') : t('image.choose')}
        </Button>
      )}

      {error && (
        <p role="alert" className="field-error">
          <AlertCircle aria-hidden="true" strokeWidth={2} />
          {error}
        </p>
      )}

      {preview && (
        <div className="photo-frame relative inline-block max-w-full">
          {/* user photo: exempt from the colour audit; plain <img> so any host works */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={t('image.preview')} data-user-image className="max-h-40 w-auto max-w-full rounded-[var(--radius-sm)] object-cover" />
          <Button
            variant="outline"
            size="sm"
            iconOnly
            icon={X}
            onClick={clearImage}
            aria-label={t('image.remove')}
            title={t('image.remove')}
            className="!absolute right-1.5 top-1.5 !bg-surface"
          />
        </div>
      )}
    </div>
  );
}
