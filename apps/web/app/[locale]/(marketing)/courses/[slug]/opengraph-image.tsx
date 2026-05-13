import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

async function getCourse(slug: string, locale: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const res = await fetch(`${apiUrl}/courses/${slug}?locale=${locale}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: { locale: string; slug: string } }) {
  const { locale, slug } = params;
  const course = await getCourse(slug, locale);

  if (!course) {
    return new ImageResponse(
      <div style={{ background: '#800020', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 48 }}>
        Cahan Academy
      </div>
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: '#800020',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'sans-serif',
          padding: '60px',
          color: 'white',
        }}
      >
        {/* Left side: Info */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '60%', zIndex: 10 }}>
          <div style={{ background: '#C9A84C', color: '#800020', padding: '10px 20px', borderRadius: '10px', fontSize: '24px', fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: '30px' }}>
            {course.category.name}
          </div>
          
          <h1 style={{ fontSize: '72px', fontWeight: 'bold', margin: '0 0 20px 0', lineHeight: 1.1 }}>
            {course.title}
          </h1>
          
          <p style={{ fontSize: '28px', opacity: 0.9, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {course.description}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginTop: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '18px', color: '#C9A84C', fontWeight: 'bold', textTransform: 'uppercase' }}>Müddət</span>
              <span style={{ fontSize: '24px' }}>{course.duration}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '18px', color: '#C9A84C', fontWeight: 'bold', textTransform: 'uppercase' }}>Reytinq</span>
              <span style={{ fontSize: '24px' }}>⭐ {course.rating}</span>
            </div>
          </div>
        </div>

        {/* Right side: Academy Identity */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '30%' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#C9A84C',
              color: '#800020',
              width: '120px',
              height: '120px',
              borderRadius: '30px',
              fontSize: '80px',
              fontWeight: 'bold',
              boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
            }}
          >
            C
          </div>
          <div style={{ marginTop: '30px', fontSize: '24px', fontWeight: 'bold', color: '#C9A84C' }}>
            cahanacademy.az
          </div>
        </div>

        {/* Decorative elements */}
        <div style={{ position: 'absolute', bottom: -50, right: -50, width: 300, height: 300, borderRadius: '50%', background: '#C9A84C', opacity: 0.1 }} />
      </div>
    ),
    {
      ...size,
    }
  );
}
