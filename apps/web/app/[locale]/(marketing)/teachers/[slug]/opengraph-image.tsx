import { ImageResponse } from 'next/og';
import { SITE_URL } from '@/lib/utils';

// Brand colours only (#5C000E, white, black and their mixes). The domain shown is the canonical one.
const SITE_HOST = new URL(SITE_URL).host;

export const runtime = 'edge';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

async function getTeacher(slug: string, locale: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const res = await fetch(`${apiUrl}/teachers/${slug}?locale=${locale}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: { locale: string; slug: string } }) {
  const { locale, slug } = params;
  const teacher = await getTeacher(slug, locale);

  if (!teacher) {
    return new ImageResponse(
      <div style={{ background: '#5C000E', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 48 }}>
        Cahan Academy
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
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'sans-serif',
          padding: '80px',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', width: '60%' }}>
          <div style={{ background: '#EBE0E2', color: '#5C000E', padding: '10px 20px', borderRadius: '10px', fontSize: '20px', fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: '30px', textTransform: 'uppercase' }}>
            Müəllim Heyəti
          </div>
          
          <h1 style={{ fontSize: '72px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
            {teacher.name}
          </h1>
          
          <p style={{ fontSize: '32px', color: '#EBE0E2', margin: '0 0 40px 0', fontWeight: 'bold' }}>
            {teacher.position}
          </p>
          
          <div style={{ borderLeft: '4px solid #EBE0E2', paddingLeft: '24px' }}>
            <p style={{ fontSize: '24px', opacity: 0.9, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontStyle: 'italic' }}>
              {teacher.bio}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '30%' }}>
            <div
                style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#EBE0E2',
                color: '#5C000E',
                width: '140px',
                height: '140px',
                borderRadius: '35px',
                fontSize: '90px',
                fontWeight: 'bold',
                boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                }}
            >
                C
            </div>
            <div style={{ marginTop: '40px', fontSize: '24px', fontWeight: 'bold', color: '#EBE0E2', opacity: 0.8 }}>
                {SITE_HOST}
            </div>
        </div>

        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', border: '2px solid #EBE0E2', opacity: 0.1 }} />
      </div>
    ),
    {
      ...size,
    }
  );
}
