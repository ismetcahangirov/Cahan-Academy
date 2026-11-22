import { ImageResponse } from 'next/og';
import { SITE_URL } from '@/lib/utils';

// Brand colours only (#5C000E, white, black and their mixes). The domain shown is the canonical one.
const SITE_HOST = new URL(SITE_URL).host;
import { getBlogPost } from '@/lib/api';

export const runtime = 'edge';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: { locale: string; slug: string } }) {
  const { locale, slug } = params;
  const post = await getBlogPost(slug, locale).catch(() => null);

  if (!post) {
    return new ImageResponse(
      <div style={{ background: '#5C000E', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 48 }}>
        Cahan Academy Blog
      </div>
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: '#5C000E',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          fontFamily: 'sans-serif',
          padding: '80px',
          color: 'white',
          position: 'relative',
        }}
      >
        {/* Background Overlay for text readability */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #1E0005 0%, rgba(92,0,14,0) 60%)' }} />

        <div style={{ display: 'flex', flexDirection: 'column', zIndex: 10 }}>
          <div style={{ background: '#EBE0E2', color: '#5C000E', padding: '8px 16px', borderRadius: '8px', fontSize: '20px', fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: '24px' }}>
            BLOQ MƏQALƏSİ
          </div>
          
          <h1 style={{ fontSize: '64px', fontWeight: 'bold', margin: '0 0 24px 0', lineHeight: 1.2 }}>
            {post.title}
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
             <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EBE0E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C000E', fontSize: '24px', fontWeight: 'bold' }}>
               {post.author?.name?.charAt(0) || 'C'}
             </div>
             <div style={{ display: 'flex', flexDirection: 'column' }}>
               <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{post.author?.name || 'Cahan Academy'}</span>
               <span style={{ fontSize: '16px', opacity: 0.8 }}>{SITE_HOST}</span>
             </div>
          </div>
        </div>

        {/* Brand Icon */}
        <div
            style={{
              position: 'absolute',
              top: '60px',
              right: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#EBE0E2',
              color: '#5C000E',
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              fontSize: '48px',
              fontWeight: 'bold',
            }}
          >
            C
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
