# DESIGN_SYSTEM.md — Dizayn Sistemi

> **Layihə:** Academy Landing Page
> **Konsepsiya:** Classic & Elegant — Akademik Estetika
> **Framework:** Tailwind CSS 4 + CSS Custom Properties
> **Son yenilənmə:** 2026

---

## 1. Dizayn Fəlsəfəsi

```
Classic & Elegant — zaman sınaqından keçmiş akademik estetika.

Prinsiplər:
  ◆  Sakitlik    — gözü yorucu olmayan, nəfəs alan kompozisiya
  ◆  Nüfuz       — dərin tündlər, zərif qızılı vurğular
  ◆  Oxunaqlılıq — serif başlıqlar, yüksək kontrast
  ◆  Dürüstlük   — heç bir element funksiyasız olmamalıdır

İlham mənbələri:
  → Oksford, Kembric universitetlərinin vizual üslubu
  → Klassik kitab nəşriyyatı tipografiyası
  → Lüks tədris müəssisəsi brendinqi
```

---

## 2. Rəng Sistemi

### 2.1 Əsas Palitrası

```
PRIMARY — Dərin Antrasit
  HEX:   #1C1C1E
  RGB:   rgb(28, 28, 30)
  İstifadə: Başlıqlar, əsas mətn, dark bölmə arxa fonları, primary düymə

SECONDARY — Akademik Bordo
  HEX:   #800020
  RGB:   rgb(128, 0, 32)
  İstifadə: CTA düymələri, aktiv vəziyyət, vurğu mətnlər, link hover

ACCENT — Klassik Qızılı
  HEX:   #C9A84C
  RGB:   rgb(201, 168, 76)
  İstifadə: Dekorativ xətlər, badge, statistika rəqəmləri, qiymət
             Logo ikinci söz, fokus xətti, hover göstəriciləri

ACCENT-LIGHT — Açıq Qızılı
  HEX:   #E8D5A3
  RGB:   rgb(232, 213, 163)
  İstifadə: Gradient, light badge arxa fonu

ACCENT-DARK — Tünd Qızılı
  HEX:   #B8962E
  RGB:   rgb(184, 150, 46)
  İstifadə: Qızılı düymə hover vəziyyəti
```

### 2.2 Neytral Palitrası

```
BACKGROUND — Krem Ağ
  HEX:   #FAFAF8
  İstifadə: Sayt arxa fonu — saf ağdan daha yumşaq

SURFACE — Xalis Ağ
  HEX:   #FFFFFF
  İstifadə: Kart, modal, form arxa fonu

SURFACE-ALT — Çox Açıq Krem
  HEX:   #F5F5F3
  İstifadə: Alternativ bölmə arxa fonu, disabled input

BORDER — İncə Bej
  HEX:   #E8E4DC
  İstifadə: Kart kənarları, xətt ayırıcılar, input border

BORDER-DARK — Orta Bej
  HEX:   #D4CFC5
  İstifadə: Hover vəziyyətindəki border, güclü ayırıcı
```

### 2.3 Mətn Rəngləri

```
TEXT-PRIMARY   #1C1C1E   — Başlıqlar, əsas mətn
TEXT-SECONDARY #6B6B6B   — İkinci dərəcəli mətn, açıqlamalar
TEXT-MUTED     #9CA3AF   — Placeholder, hint, meta məlumat
TEXT-INVERSE   #FFFFFF   — Tünd fon üzərindəki mətn
TEXT-GOLD      #C9A84C   — Vurğu mətn, eyebrow, label
TEXT-BORDO     #800020   — Link, aktiv, CTA mətn
```

### 2.4 Funksional Rənglər

```
SUCCESS   #059669   bg: #ECFDF5   border: #A7F3D0
WARNING   #D97706   bg: #FFFBEB   border: #FDE68A
ERROR     #DC2626   bg: #FEF2F2   border: #FECACA
INFO      #2563EB   bg: #EFF6FF   border: #BFDBFE
```

### 2.5 Rəng Kontrast Cədvəli (WCAG 2.1)

| Fon | Mətn | Nisbət | Səviyyə |
|---|---|---|---|
| #FAFAF8 (krem) | #1C1C1E (tünd) | 18.5:1 | AAA ✅ |
| #FAFAF8 (krem) | #6B6B6B (boz) | 5.2:1 | AA ✅ |
| #1C1C1E (tünd) | #FFFFFF (ağ) | 19.1:1 | AAA ✅ |
| #1C1C1E (tünd) | #C9A84C (qızılı) | 5.8:1 | AA ✅ |
| #800020 (bordo) | #FFFFFF (ağ) | 9.4:1 | AAA ✅ |
| #FFFFFF (ağ) | #800020 (bordo) | 9.4:1 | AAA ✅ |

---

## 3. Tipografiya

### 3.1 Font Ailəsi

```
HEADING — Playfair Display (Serif)
  Funksiya: Başlıqlar, logo, eyebrow mətnlər
  Çəki: 400 (Regular), 600 (SemiBold), 700 (Bold), 900 (Black)
  Xarakter: Klassik, nüfuzlu, akademik

BODY — Inter (Sans-serif)
  Funksiya: Bütün gövdə mətnləri, UI elementlər, formlar
  Çəki: 400 (Regular), 500 (Medium), 600 (SemiBold)
  Xarakter: Müasir, oxunaqlı, neytral

MONO — JetBrains Mono (Monospace)
  Funksiya: Kod nümunələri (blog yazıları üçün)
  Çəki: 400 (Regular), 500 (Medium)
```

### 3.2 Next.js Font Konfiqurasiyası

```typescript
// lib/fonts.ts

import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google';

export const playfair = Playfair_Display({
  subsets:  ['latin'],
  variable: '--font-heading',
  display:  'swap',
  weight:   ['400', '600', '700', '900'],
});

export const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-body',
  display:  'swap',
  weight:   ['400', '500', '600'],
});

export const jetbrainsMono = JetBrains_Mono({
  subsets:  ['latin'],
  variable: '--font-mono',
  display:  'swap',
  weight:   ['400', '500'],
});

// app/layout.tsx-də istifadə:
export default function RootLayout({ children }) {
  return (
    <html
      className={`${playfair.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-body bg-bg text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
```

### 3.3 Tip Miqyası

```
Display XL    font-heading, text-7xl  (72px), font-bold,     leading-tight
  → Hero başlığı (h1 — mobil əsas bölmə)

Display LG    font-heading, text-6xl  (60px), font-bold,     leading-tight
  → Hero başlığı (h1 — desktop)

Heading 1     font-heading, text-5xl  (48px), font-bold,     leading-tight
  → Səhifə başlıqları (h1)

Heading 2     font-heading, text-4xl  (36px), font-semibold, leading-snug
  → Bölmə başlıqları (h2)

Heading 3     font-heading, text-3xl  (30px), font-semibold, leading-snug
  → Alt bölmə başlıqları (h3)

Heading 4     font-heading, text-2xl  (24px), font-semibold, leading-normal
  → Kart başlıqları (h4)

Heading 5     font-heading, text-xl   (20px), font-semibold, leading-normal
  → Kiçik başlıqlar (h5)

Body LG       font-body,    text-lg   (18px), font-normal,   leading-relaxed
  → Giriş, hero alt mətni

Body Base     font-body,    text-base (16px), font-normal,   leading-relaxed
  → Standart gövdə mətni

Body SM       font-body,    text-sm   (14px), font-normal,   leading-normal
  → İkinci dərəcəli mətn, meta

Label         font-body,    text-sm   (14px), font-medium,   tracking-wide
  → Form label, badge mətni

Caption       font-body,    text-xs   (12px), font-normal,   leading-normal
  → Footer mətn, qeydlər

Eyebrow       font-body,    text-xs   (12px), font-medium,   tracking-widest, uppercase
  → Bölmə üst etiketi ("Kurslarımız", "Haqqımızda")
```

---

## 4. Tailwind CSS 4 Konfiqurasiyası

```typescript
// tailwind.config.ts

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {

      // Rənglər
      colors: {
        primary:   '#1C1C1E',
        secondary: '#800020',
        accent: {
          DEFAULT: '#C9A84C',
          light:   '#E8D5A3',
          dark:    '#B8962E',
        },
        bg:      '#FAFAF8',
        surface: {
          DEFAULT: '#FFFFFF',
          alt:     '#F5F5F3',
        },
        border: {
          DEFAULT: '#E8E4DC',
          dark:    '#D4CFC5',
        },
        text: {
          primary:   '#1C1C1E',
          secondary: '#6B6B6B',
          muted:     '#9CA3AF',
          inverse:   '#FFFFFF',
          gold:      '#C9A84C',
          bordo:     '#800020',
        },
      },

      // Font ailələri
      fontFamily: {
        heading: ['var(--font-heading)', 'Georgia', 'serif'],
        body:    ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },

      // Özəl spacing
      spacing: {
        '18': '4.5rem',   // 72px — header hündürlüyü
        '22': '5.5rem',   // 88px
        '30': '7.5rem',   // 120px
      },

      // Letter spacing
      letterSpacing: {
        widest: '0.2em',
      },

      // Box shadow — classic stil
      boxShadow: {
        'classic':    '0 2px 8px rgba(28,28,30,0.06), 0 1px 3px rgba(28,28,30,0.04)',
        'classic-md': '0 4px 16px rgba(28,28,30,0.10), 0 2px 6px rgba(28,28,30,0.06)',
        'classic-lg': '0 8px 32px rgba(28,28,30,0.14), 0 4px 12px rgba(28,28,30,0.08)',
        'gold':       '0 4px 16px rgba(201,168,76,0.25)',
      },

      // Border radius
      borderRadius: {
        'classic': '0.375rem',  // 6px — kart, düymə
        'pill':    '9999px',    // Badge, chip
      },

      // Animasiya müddəti
      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
        '400': '400ms',
      },

      // Background gradient
      backgroundImage: {
        'hero-overlay':
          'linear-gradient(to right, rgba(28,28,30,0.85) 0%, rgba(28,28,30,0.60) 50%, transparent 100%)',
        'gold-line':
          'linear-gradient(90deg, transparent, #C9A84C, transparent)',
        'dark-gradient':
          'linear-gradient(135deg, #1C1C1E 0%, #2D1B2E 100%)',
        'cream-gradient':
          'linear-gradient(180deg, #FAFAF8 0%, #F0EDE6 100%)',
      },

      // Aspect ratio
      aspectRatio: {
        'course-card': '16 / 9',
        'teacher-avatar': '1 / 1',
        'og-image': '1200 / 630',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 5. CSS Custom Properties

```css
/* app/globals.css */

@import 'tailwindcss';

:root {
  /* === RƏNGLƏR === */
  --color-primary:          #1C1C1E;
  --color-secondary:        #800020;
  --color-accent:           #C9A84C;
  --color-accent-light:     #E8D5A3;
  --color-accent-dark:      #B8962E;

  --color-bg:               #FAFAF8;
  --color-surface:          #FFFFFF;
  --color-surface-alt:      #F5F5F3;
  --color-border:           #E8E4DC;
  --color-border-dark:      #D4CFC5;

  --color-text-primary:     #1C1C1E;
  --color-text-secondary:   #6B6B6B;
  --color-text-muted:       #9CA3AF;

  /* === TİPOQRAFİYA === */
  --font-heading:           'Playfair Display', Georgia, serif;
  --font-body:              'Inter', system-ui, sans-serif;
  --font-mono:              'JetBrains Mono', monospace;

  /* === SPACİNG === */
  --header-height:          72px;
  --section-padding-y:      80px;
  --container-max:          1280px;
  --container-padding:      1.5rem;

  /* === KƏNAR === */
  --radius-sm:              4px;
  --radius-md:              6px;
  --radius-lg:              12px;
  --radius-xl:              20px;
  --radius-full:            9999px;

  /* === KÖLGƏLİK === */
  --shadow-classic:         0 2px 8px rgba(28,28,30,0.06), 0 1px 3px rgba(28,28,30,0.04);
  --shadow-classic-md:      0 4px 16px rgba(28,28,30,0.10), 0 2px 6px rgba(28,28,30,0.06);
  --shadow-classic-lg:      0 8px 32px rgba(28,28,30,0.14), 0 4px 12px rgba(28,28,30,0.08);
  --shadow-gold:            0 4px 16px rgba(201,168,76,0.25);

  /* === ANİMASİYA === */
  --transition-fast:        150ms ease;
  --transition-base:        200ms ease;
  --transition-slow:        400ms ease;

  /* === Z-INDEX === */
  --z-base:                 0;
  --z-dropdown:             100;
  --z-sticky:               200;
  --z-modal-overlay:        300;
  --z-modal:                400;
  --z-toast:                500;
  --z-tooltip:              600;
}

/* === QİOBAL STİLLƏR === */

html {
  scroll-behavior: smooth;
  -webkit-font-smoothing:  antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering:          optimizeLegibility;
}

body {
  background-color: var(--color-bg);
  color:            var(--color-text-primary);
  font-family:      var(--font-body);
  line-height:      1.6;
}

/* Seçilmiş mətn — qızılı vurğu */
::selection {
  background-color: rgba(201, 168, 76, 0.25);
  color:            var(--color-primary);
}

/* Keyboard fokus xətti */
:focus-visible {
  outline:        2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius:  var(--radius-sm);
}

/* Skip to main — əlçatanlıq */
.skip-to-main {
  position:   absolute;
  top:        -100%;
  left:       1rem;
  z-index:    var(--z-toast);
  padding:    0.5rem 1rem;
  background: var(--color-primary);
  color:      white;
  border-radius: var(--radius-md);
  transition: top 0.2s;
}

.skip-to-main:focus {
  top: 1rem;
}

/* Scrollbar — Webkit */
::-webkit-scrollbar {
  width:  8px;
  height: 8px;
}
::-webkit-scrollbar-track  { background: var(--color-surface-alt); }
::-webkit-scrollbar-thumb  { background: var(--color-border-dark); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--color-text-muted); }

/* Container utility */
.container-classic {
  max-width:  var(--container-max);
  margin:     0 auto;
  padding-left:  var(--container-padding);
  padding-right: var(--container-padding);
}

/* Section padding */
.section-padding {
  padding-top:    var(--section-padding-y);
  padding-bottom: var(--section-padding-y);
}

/* Eyebrow — bölmə üst etiketi */
.eyebrow {
  font-family:     var(--font-body);
  font-size:       0.75rem;
  font-weight:     500;
  letter-spacing:  0.2em;
  text-transform:  uppercase;
  color:           var(--color-accent);
}

/* Qızılı dekorativ xətt */
.gold-line {
  display:    block;
  height:     2px;
  background: linear-gradient(90deg, transparent, var(--color-accent), transparent);
  border:     none;
}

/* Ornametal ayırıcı */
.ornament {
  display:         flex;
  align-items:     center;
  justify-content: center;
  gap:             1rem;
  color:           var(--color-accent);
}

.ornament::before,
.ornament::after {
  content:    '';
  display:    block;
  height:     1px;
  width:      4rem;
  background: currentColor;
  opacity:    0.5;
}
```

---

## 6. Spacing Sistemi

```
Tailwind spacing miqyası (default) + özəl əlavələr:

  4px  → space-1   — xırda boşluq (ikon-mətn arası)
  8px  → space-2   — daxili padding SM
  12px → space-3   — element arası boşluq
  16px → space-4   — standart padding
  20px → space-5   — form element boşluğu
  24px → space-6   — kart daxili padding
  32px → space-8   — bölmə daxili boşluq
  40px → space-10  — büyük element arası
  48px → space-12  — bölmə başlıq altı
  64px → space-16  — bölmə padding Y
  72px → space-18* — header hündürlüyü (özəl)
  80px → space-20  — section padding
  96px → space-24  — böyük bölmə padding
  120px → space-30* — hero bölmə üst boşluq (özəl)

* = Tailwind.config-da əlavə edilib
```

### Bölmə Padding Qaydası

```
Mobile  (< 768px):  py-16  (64px)
Tablet  (768-1024): py-20  (80px)
Desktop (> 1024px): py-24  (96px)

Nümunə:
<section className="py-16 md:py-20 lg:py-24">
```

---

## 7. Grid Sistemi

```typescript
// Standart grid layout-lar:

// 1 sütun → 2 → 3 (kurslar, müəllimlər)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

// 1 sütun → 2 → 4 (statistika)
<div className="grid grid-cols-2 lg:grid-cols-4 gap-8">

// 1 sütun → 3/5 + 2/5 bölünmüş layout (əlaqə səhifəsi)
<div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
  <div className="lg:col-span-3">  {/* Forma */}     </div>
  <div className="lg:col-span-2">  {/* Əlaqə info */}</div>
</div>

// 1 sütun → 2 + geniş sol (haqqımızda)
<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

// Footer — 1 → 2 → 4 sütun
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
  <div className="lg:col-span-2">  {/* Brend */}    </div>
  <div>                            {/* Keçidlər */} </div>
  <div>                            {/* Sosial */}   </div>
</div>
```

---

## 8. Animasiya Sistemi

### 8.1 Micro-animasiyalar (CSS)

```css
/* globals.css — CSS animasiyaları */

/* Fade in — elementlər görünür olduqda */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0);    }
}

/* Shimmer — skeleton loader */
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}

/* Pulse — loading göstərici */
@keyframes pulse-gold {
  0%, 100% { opacity: 1;   }
  50%       { opacity: 0.5; }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease forwards;
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    var(--color-surface-alt) 25%,
    var(--color-border)      50%,
    var(--color-surface-alt) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

### 8.2 Framer Motion Variantları

```typescript
// lib/animations.ts

export const fadeInUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: {
    opacity:    1,
    y:          0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: {
    opacity:    1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export const staggerContainer = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren:   0.2,
    },
  },
};

export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.95 },
  visible: {
    opacity:    1,
    scale:      1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

export const slideInLeft = {
  hidden:  { opacity: 0, x: -32 },
  visible: {
    opacity:    1,
    x:          0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// İstifadə nümunəsi:
// <motion.div
//   variants={staggerContainer}
//   initial="hidden"
//   whileInView="visible"
//   viewport={{ once: true, margin: '-100px' }}
// >
//   {courses.map(course => (
//     <motion.div key={course.id} variants={fadeInUp}>
//       <CourseCard course={course} />
//     </motion.div>
//   ))}
// </motion.div>
```

### 8.3 Hover Effektlər

```typescript
// Kart hover — Tailwind
className="
  border border-[#E8E4DC]
  hover:border-[#C9A84C]/30
  hover:shadow-classic-md
  transition-all duration-300
"

// Şəkil zoom — kart daxilindəki şəkil
// Kart: overflow-hidden
// Şəkil: group-hover:scale-105 transition-transform duration-500

// Link underline animasiyası
className="
  relative
  after:absolute after:bottom-0 after:left-0
  after:h-px after:w-0 after:bg-current
  after:transition-all after:duration-200
  hover:after:w-full
"

// Düymə press effekti
className="active:scale-[0.98] transition-transform duration-75"
```

---

## 9. Skeleton Loader Komponenti

```typescript
// components/ui/Skeleton.tsx

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  rounded?:   'sm' | 'md' | 'lg' | 'full';
}

export function Skeleton({ className, rounded = 'md' }: SkeletonProps) {
  const roundedMap = {
    sm:   'rounded-sm',
    md:   'rounded-md',
    lg:   'rounded-lg',
    full: 'rounded-full',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-[#E8E4DC]',
        roundedMap[rounded],
        className
      )}
      role="status"
      aria-label="Yüklənir..."
    />
  );
}

// CourseCard skeleton:
export function CourseCardSkeleton() {
  return (
    <div className="bg-white border border-[#E8E4DC] rounded-lg overflow-hidden">
      <Skeleton className="h-52 w-full" rounded="sm" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-4 w-16"  rounded="full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between pt-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

// TeacherCard skeleton:
export function TeacherCardSkeleton() {
  return (
    <div className="text-center p-8 bg-white border border-[#E8E4DC] rounded-lg">
      <Skeleton className="w-28 h-28 mx-auto mb-5" rounded="full" />
      <Skeleton className="h-6 w-40 mx-auto mb-2" />
      <Skeleton className="h-4 w-28 mx-auto mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mx-auto" />
    </div>
  );
}
```

---

## 10. Kart Variantları

```typescript
// 3 əsas kart variantı:

// 1. Standard — ağ fon, incə border
className="bg-white border border-[#E8E4DC] rounded-lg
           shadow-classic hover:shadow-classic-md
           hover:border-[#C9A84C]/30
           transition-all duration-300"

// 2. Tünd — dark bölmə üçün
className="bg-[#1C1C1E]/50 border border-[#E8E4DC]/10 rounded-lg
           hover:border-[#C9A84C]/40
           transition-colors duration-300"

// 3. Gold Accent — xüsusi vurğu kartı
className="bg-white border-2 border-[#C9A84C]/30 rounded-lg
           shadow-gold
           relative overflow-hidden
           before:absolute before:top-0 before:left-0 before:right-0
           before:h-1 before:bg-[#C9A84C]"

// 4. Stat kart — rəqəm göstərmək üçün
className="text-center p-8
           border border-[#E8E4DC]/10 rounded-lg
           hover:border-[#C9A84C]/40
           transition-colors duration-300
           group"
```

---

## 11. İkon Sistemi

```typescript
// Lucide React istifadəsi — standart ölçülər

// Kiçik (meta məlumat, badge)
<Clock className="w-3.5 h-3.5" aria-hidden="true" />

// Orta (button icon, list item)
<ChevronRight className="w-4 h-4" aria-hidden="true" />

// Böyük (feature kart)
<BookOpen className="w-6 h-6" aria-hidden="true" />

// XL (hero, CTA)
<GraduationCap className="w-8 h-8" aria-hidden="true" />

// Kurs xüsusiyyətləri üçün ikonlar:
import { Clock, Users, Award, BookOpen, Video, Globe } from 'lucide-react';

// Sosial media üçün:
import { Linkedin, Github, Twitter, Youtube, Instagram } from 'lucide-react';

// UI üçün:
import {
  ChevronRight, ChevronDown, Menu, X,
  Check, AlertCircle, Info, Mail, Phone, MapPin,
  ArrowRight, ExternalLink, Search
} from 'lucide-react';

// QAYDA: Bütün dekorativ ikonlarda aria-hidden="true"
// Funksional ikonlarda (tək başına düymə) aria-label tələb olunur
```

---

## 12. Responsiv Dizayn Kəsimləri

```
Breakpoint sistemi (Tailwind default):

  sm:   640px+  → 2 sütun layout başlayır
  md:   768px+  → Tablet görünüşü, nav göstərilir
  lg:   1024px+ → Desktop layout, full grid
  xl:   1280px+ → Geniş layout (container max-width)
  2xl:  1536px+ → Ultra geniş (nadir istifadə)

Dizayn qaydaları:
  ◆  Mobile-first yazılır (əvvəl kiçik, sonra böyük)
  ◆  sm: breakpoint-dən başlayır (640px)
  ◆  Mətn ölçüsü: mobile text-4xl → lg: text-7xl
  ◆  Grid: grid-cols-1 → md:grid-cols-2 → lg:grid-cols-3
  ◆  Padding: px-4 → sm:px-6 → lg:px-8
```

---

## 13. Qaranlıq Rejim (Gələcək)

```typescript
// Hazırkı versiyada qaranlıq rejim dəstəklənmir.
// Gələcək versiya üçün CSS dəyişənlər hazırdır:

// tailwind.config.ts
// darkMode: 'class'  ← aktivləşdirmə üçün

// globals.css
// .dark {
//   --color-bg:           #0F0F10;
//   --color-surface:      #1C1C1E;
//   --color-surface-alt:  #2D2D2F;
//   --color-border:       #3A3A3C;
//   --color-text-primary: #FAFAF8;
// }
```

---

## 14. Dizayn Yoxlama Siyahısı

```
RƏNGLƏR
  [ ]  Bütün mətn-fon kombinasiyaları WCAG AA keçir
  [ ]  Fokus halqası görünür (qızılı, 2px)
  [ ]  Error rəngi qırmızı (#DC2626)
  [ ]  Success rəngi yaşıl (#059669)
  [ ]  Seçilmiş mətn qızılı arxa fonla göstərilir

TİPOQRAFİYA
  [ ]  Playfair Display bütün başlıqlarda yüklənib
  [ ]  Inter bütün gövdə mətlərindədir
  [ ]  font-display: swap aktiv
  [ ]  Hər breakpoint-də oxunaqlı ölçü

KOMPONENTLƏR
  [ ]  Button — bütün 5 variant görsel yoxlanıb
  [ ]  Input — normal / error / disabled vəziyyəti
  [ ]  Kart — hover effekti düzgün işləyir
  [ ]  Badge — bütün variantlar kontrast WCAG AA keçir

ANİMASİYA
  [ ]  prefers-reduced-motion aktiv olanlar üçün
       animasiyalar söndürülüb
  [ ]  Hover effektlər 150-300ms arası
  [ ]  Heç bir animasiya 500ms-dən uzun deyil

RESPONSİV
  [ ]  375px (iPhone SE) — düzgün görünür
  [ ]  390px (iPhone 14) — düzgün görünür
  [ ]  768px (iPad)      — düzgün görünür
  [ ]  1024px (Laptop)   — düzgün görünür
  [ ]  1440px (Desktop)  — düzgün görünür
```

```css
/* prefers-reduced-motion dəstəyi */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration:        0.01ms !important;
    animation-iteration-count: 1      !important;
    transition-duration:       0.01ms !important;
    scroll-behavior:           auto   !important;
  }
}
```
