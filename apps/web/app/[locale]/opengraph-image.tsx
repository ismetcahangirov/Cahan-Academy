import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Cahan Academy - Professional Technology Education';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: { locale: string } }) {
  const { locale } = params;

  // Tərcümə mətnləri (Hardcoded here for performance in edge runtime)
  const texts: any = {
    az: { title: 'Cahan Academy', subtitle: 'Peşəkar Texnologiya Təhsili' },
    en: { title: 'Cahan Academy', subtitle: 'Professional Tech Education' },
    ru: { title: 'Cahan Academy', subtitle: 'Профессиональное ИТ-образование' },
  };

  const { title, subtitle } = texts[locale] || texts.az;

  return new ImageResponse(
    (
      <div
        style={{
          background: '#800020', // Bordo
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          padding: '80px',
        }}
      >
        {/* Dekorativ Qızılı Çərçivə */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '40px',
            right: '40px',
            bottom: '40px',
            border: '4px solid #C9A84C', // Qızılı
            borderRadius: '20px',
            opacity: 0.5,
          }}
        />

        {/* Logo Placeholder / İkon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#C9A84C',
            color: '#800020',
            width: '100px',
            height: '100px',
            borderRadius: '20px',
            fontSize: '60px',
            fontWeight: 'bold',
            marginBottom: '40px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          }}
        >
          C
        </div>

        <h1
          style={{
            fontSize: '80px',
            fontWeight: 'bold',
            color: '#FFFFFF',
            margin: 0,
            textAlign: 'center',
          }}
        >
          {title}
        </h1>
        
        <p
          style={{
            fontSize: '32px',
            color: '#C9A84C',
            margin: '20px 0 0 0',
            textAlign: 'center',
            fontWeight: 'normal',
          }}
        >
          {subtitle}
        </p>

        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#FFFFFF',
            opacity: 0.8,
            fontSize: '24px',
          }}
        >
          <span>cahanacademy.az</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
