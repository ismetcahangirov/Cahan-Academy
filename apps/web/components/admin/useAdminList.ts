'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import adminApi from '@/lib/adminApi';
import { apiMessage } from './utils';

/**
 * Loads an admin list from the API (`{ success, data }`), exposes loading / error / reload and a setter for
 * optimistic updates. The error text is shown in the page (EmptyState + retry), never in an alert().
 *
 * const { items, setItems, loading, error, reload } = useAdminList<Teacher>('/teachers/admin/list');
 */
export function useAdminList<T>(url: string) {
  const t = useTranslations('admin');
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const tRef = useRef(t);
  tRef.current = t;

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await adminApi.get(url);
      if (data.success) setItems(data.data ?? []);
      else setError(data.message || tRef.current('common.load_error'));
    } catch (e) {
      setError(apiMessage(e, tRef.current('common.load_error')));
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { items, setItems, loading, error, reload };
}
