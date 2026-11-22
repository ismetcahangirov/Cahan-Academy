'use client';

import { useEffect, useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui';

/**
 * ShareButton — native share sheet where the browser has one (phones), otherwise copies the page URL
 * and says so next to the button (icon + text, polite live region). No alert(), no colour signal.
 */
export default function ShareButton({ title, label, copiedLabel }: { title: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2500);
    return () => clearTimeout(id);
  }, [copied]);

  const share = async () => {
    const url = window.location.href;
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // share sheet dismissed or clipboard blocked: nothing to report
    }
  };

  return (
    <div className="inline-flex items-center gap-3">
      <Button variant="ghost" size="sm" icon={Share2} onClick={share}>
        {label}
      </Button>
      <span aria-live="polite" className="time-italic inline-flex items-center gap-1.5 text-[0.98rem] text-ink-muted">
        {copied && (
          <>
            <Check size={15} strokeWidth={1.8} className="text-accent-text" aria-hidden="true" />
            {copiedLabel}
          </>
        )}
      </span>
    </div>
  );
}
