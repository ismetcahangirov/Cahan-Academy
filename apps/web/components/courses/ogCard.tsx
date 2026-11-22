import { ImageResponse } from 'next/og';
import { SITE_URL } from '@/lib/utils';

/**
 * Open Graph card for course / teacher pages (1200×630). Colour law: only tones on white → #5C000E →
 * black (deep wine gradient, #E2D1D4 / #C6A6AB light tones, white text), no shadows, no emoji.
 * A double hairline frame with small corner diamonds echoes the ornate frames of the site.
 */
export const OG_SIZE = { width: 1200, height: 630 };
const SITE_HOST = new URL(SITE_URL).host;

export function ogCard({
  eyebrow,
  title,
  text,
  facts = [],
}: {
  eyebrow?: string;
  title: string;
  text?: string | null;
  facts?: [string, string][];
}) {
  const corner = (pos: Record<string, number>) => (
    <div
      style={{
        position: 'absolute',
        width: 14,
        height: 14,
        background: '#C6A6AB',
        transform: 'rotate(45deg)',
        ...pos,
      }}
    />
  );
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: 'linear-gradient(160deg, #5C000E 0%, #3C0009 55%, #1E0005 100%)',
          color: '#FFFFFF',
          padding: 72,
        }}
      >
        <div style={{ position: 'absolute', top: 28, left: 28, right: 28, bottom: 28, border: '2px solid #86424D', display: 'flex' }} />
        <div style={{ position: 'absolute', top: 38, left: 38, right: 38, bottom: 38, border: '1px solid #C6A6AB', display: 'flex' }} />
        {corner({ top: 31, left: 31 })}
        {corner({ top: 31, right: 31 })}
        {corner({ bottom: 31, left: 31 })}
        {corner({ bottom: 31, right: 31 })}

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', padding: '0 40px' }}>
          {eyebrow && (
            <div style={{ display: 'flex', fontSize: 24, letterSpacing: 6, textTransform: 'uppercase', color: '#E2D1D4', marginBottom: 26 }}>
              {eyebrow}
            </div>
          )}
          <div style={{ display: 'flex', fontSize: title.length > 48 ? 56 : 68, fontWeight: 700, lineHeight: 1.1, maxWidth: 1000 }}>
            {title}
          </div>
          <div style={{ display: 'flex', width: 160, height: 2, background: '#C6A6AB', margin: '30px 0' }} />
          {text && (
            <div
              style={{
                display: 'flex',
                fontSize: 28,
                lineHeight: 1.4,
                color: '#E2D1D4',
                maxWidth: 960,
                maxHeight: 120,
                overflow: 'hidden',
              }}
            >
              {text.length > 170 ? `${text.slice(0, 167).trim()}…` : text}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 36 }}>
            <div style={{ display: 'flex', gap: 48 }}>
              {facts.map(([label, value]) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 18, letterSpacing: 4, textTransform: 'uppercase', color: '#C6A6AB' }}>{label}</span>
                  <span style={{ fontSize: 30, fontWeight: 700, marginTop: 6 }}>{value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: 30, fontWeight: 700 }}>Cahan Academy</span>
              <span style={{ fontSize: 20, color: '#C6A6AB', marginTop: 4 }}>{SITE_HOST}</span>
            </div>
          </div>
        </div>
      </div>
    ),
    OG_SIZE
  );
}
