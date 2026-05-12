# COMPONENTS.md — UI Komponent Kataloqu

> **Layihə:** Academy Landing Page
> **Framework:** Next.js 15 + TypeScript + Tailwind CSS 4
> **Dizayn:** Classic & Elegant
> **Son yenilənmə:** 2026

---

## 1. Komponent İyerarxiyası

```
components/
│
├── ui/                    ← Atomik — yenidən istifadə olunan
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Textarea.tsx
│   ├── Badge.tsx
│   ├── Card.tsx
│   ├── Divider.tsx
│   ├── Spinner.tsx
│   ├── Toast.tsx
│   └── JsonLd.tsx
│
├── layout/                ← Qlobal çərçivə
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Navbar.tsx
│   ├── MobileMenu.tsx
│   └── LanguageSwitcher.tsx
│
├── sections/              ← Səhifə bölmələri (Server Components)
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── StatsSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── CoursesPreview.tsx
│   │   ├── TestimonialsSection.tsx
│   │   └── CTASection.tsx
│   ├── courses/
│   │   ├── CourseGrid.tsx
│   │   └── CourseCard.tsx
│   ├── teachers/
│   │   ├── TeacherGrid.tsx
│   │   └── TeacherCard.tsx
│   └── blog/
│       ├── BlogGrid.tsx
│       └── BlogCard.tsx
│
└── forms/                 ← Client Components ('use client')
    ├── ContactForm.tsx
    ├── EnrollForm.tsx
    └── NewsletterForm.tsx
```

---

## 2. UI — Atomik Komponentlər

### 2.1 Button

```typescript
// components/ui/Button.tsx

import { forwardRef } from 'react';
import { Spinner }    from './Spinner';
import { cn }         from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold';
type ButtonSize    = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  isLoading?: boolean;
  leftIcon?:  React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-[#1C1C1E] text-white hover:bg-[#2D2D2F] ' +
    'active:scale-[0.98] shadow-sm',
  secondary:
    'bg-[#800020] text-white hover:bg-[#6B001A] ' +
    'active:scale-[0.98] shadow-sm',
  outline:
    'border border-[#1C1C1E] text-[#1C1C1E] bg-transparent ' +
    'hover:bg-[#1C1C1E] hover:text-white',
  ghost:
    'text-[#1C1C1E] bg-transparent hover:bg-[#E8E4DC]',
  gold:
    'bg-[#C9A84C] text-[#1C1C1E] hover:bg-[#B8962E] ' +
    'active:scale-[0.98] font-semibold shadow-sm',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant   = 'primary',
      size      = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'rounded-md font-medium tracking-wide',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-[#C9A84C] focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Spinner size="sm" color="current" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

// İstifadə nümunələri:
// <Button variant="primary">Müraciət et</Button>
// <Button variant="gold" size="lg">Kursa yazıl</Button>
// <Button variant="outline" leftIcon={<ArrowLeft />}>Geri</Button>
// <Button isLoading>Göndərilir...</Button>
```

---

### 2.2 Input

```typescript
// components/ui/Input.tsx

import { forwardRef } from 'react';
import { cn }         from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:       string;
  error?:       string;
  hint?:        string;
  leftIcon?:    React.ReactNode;
  rightElement?: React.ReactNode;
  required?:    boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightElement, className, required, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#1C1C1E]"
          >
            {label}
            {required && (
              <span className="text-[#800020] ml-1" aria-hidden="true">*</span>
            )}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              'w-full px-4 py-3 rounded-md',
              'bg-white border border-[#E8E4DC]',
              'text-[#1C1C1E] placeholder:text-[#9CA3AF]',
              'text-base',
              'transition-colors duration-150',
              'focus:outline-none focus:border-[#800020] focus:ring-1 focus:ring-[#800020]',
              'disabled:bg-[#F5F5F3] disabled:cursor-not-allowed',
              error && 'border-red-400 focus:border-red-400 focus:ring-red-400',
              leftIcon    && 'pl-10',
              rightElement && 'pr-10',
              className
            )}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-sm text-red-600 flex items-center gap-1">
            <span aria-hidden="true">⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-sm text-[#9CA3AF]">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

---

### 2.3 Badge

```typescript
// components/ui/Badge.tsx

import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'gold' | 'bordo' | 'green' | 'outline';

interface BadgeProps {
  children:  React.ReactNode;
  variant?:  BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-[#E8E4DC] text-[#1C1C1E]',
  gold:    'bg-[#C9A84C]/15 text-[#8B6914] border border-[#C9A84C]/30',
  bordo:   'bg-[#800020]/10 text-[#800020] border border-[#800020]/20',
  green:   'bg-emerald-50 text-emerald-700 border border-emerald-200',
  outline: 'border border-[#E8E4DC] text-[#6B6B6B] bg-transparent',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// İstifadə:
// <Badge variant="gold">Tövsiyə edilir</Badge>
// <Badge variant="bordo">3 ay</Badge>
// <Badge variant="green">Sertifikat</Badge>
```

---

### 2.4 Divider

```typescript
// components/ui/Divider.tsx — Classic dekorativ xətt

interface DividerProps {
  label?:    string;
  variant?:  'simple' | 'ornate' | 'gold';
  className?: string;
}

export function Divider({ label, variant = 'simple', className }: DividerProps) {
  if (variant === 'gold') {
    return (
      <div className={`flex items-center justify-center gap-4 ${className}`}>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#C9A84C]/50" />
        <div className="w-2 h-2 rotate-45 bg-[#C9A84C]" />
        {label && (
          <>
            <span className="text-sm text-[#C9A84C] tracking-widest uppercase font-medium">
              {label}
            </span>
            <div className="w-2 h-2 rotate-45 bg-[#C9A84C]" />
          </>
        )}
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#C9A84C]/50" />
      </div>
    );
  }

  if (label) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="h-px flex-1 bg-[#E8E4DC]" />
        <span className="text-sm text-[#9CA3AF] tracking-wider uppercase">
          {label}
        </span>
        <div className="h-px flex-1 bg-[#E8E4DC]" />
      </div>
    );
  }

  return <hr className={`border-[#E8E4DC] ${className}`} />;
}
```

---

## 3. Layout Komponentlər

### 3.1 Header

```typescript
// components/layout/Header.tsx
// Server Component — statik

import Link           from 'next/link';
import Image          from 'next/image';
import { Navbar }     from './Navbar';
import { MobileMenu } from './MobileMenu';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAF8]/95 backdrop-blur-sm border-b border-[#E8E4DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10">
              <Image
                src="/images/logo.svg"
                alt="Cahan Academy logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="font-heading text-lg font-bold text-[#1C1C1E] tracking-wider uppercase">
                Cahan
              </span>
              <span className="font-heading text-lg font-bold text-[#800020] tracking-wider uppercase ml-1.5">
                Academy
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <Navbar />

          {/* Sağ hissə */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />

            <Link
              href="/contact"
              className="hidden md:inline-flex items-center px-5 py-2.5
                         bg-[#800020] text-white text-sm font-medium rounded-md
                         hover:bg-[#6B001A] transition-colors tracking-wide"
            >
              Müraciət et
            </Link>

            {/* Mobil menyu */}
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
```

---

### 3.2 Navbar

```typescript
// components/layout/Navbar.tsx
'use client';

import Link       from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn }     from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/',          key: 'home'     },
  { href: '/courses',   key: 'courses'  },
  { href: '/teachers',  key: 'teachers' },
  { href: '/blog',      key: 'blog'     },
  { href: '/about',     key: 'about'    },
  { href: '/contact',   key: 'contact'  },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const t        = useTranslations('nav');

  return (
    <nav className="hidden md:flex items-center gap-1" aria-label="Əsas naviqasiya">
      {NAV_ITEMS.map(({ href, key }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/');

        return (
          <Link
            key={key}
            href={href}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md',
              'transition-colors duration-150',
              'relative group',
              isActive
                ? 'text-[#800020]'
                : 'text-[#1C1C1E] hover:text-[#800020]'
            )}
          >
            {t(key)}
            {/* Aktiv göstərici xətt */}
            <span
              className={cn(
                'absolute bottom-0 left-1/2 -translate-x-1/2',
                'h-0.5 bg-[#C9A84C] rounded-full',
                'transition-all duration-200',
                isActive ? 'w-1/2' : 'w-0 group-hover:w-1/3'
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
```

---

### 3.3 Footer

```typescript
// components/layout/Footer.tsx
// Server Component

import Link  from 'next/link';
import Image from 'next/image';
import { Divider } from '@/components/ui/Divider';

const QUICK_LINKS = [
  { href: '/courses',  label: 'Kurslar'   },
  { href: '/teachers', label: 'Müəllimlər' },
  { href: '/about',    label: 'Haqqımızda' },
  { href: '/blog',     label: 'Blog'       },
  { href: '/faq',      label: 'FAQ'        },
  { href: '/contact',  label: 'Əlaqə'      },
];

const SOCIAL_LINKS = [
  { href: 'https://instagram.com/cahanacademy', label: 'Instagram', icon: 'instagram' },
  { href: 'https://facebook.com/cahanacademy',  label: 'Facebook',  icon: 'facebook'  },
  { href: 'https://linkedin.com/company/cahanacademy', label: 'LinkedIn', icon: 'linkedin' },
  { href: 'https://youtube.com/@cahanacademy',  label: 'YouTube',   icon: 'youtube'   },
];

export function Footer() {
  return (
    <footer className="bg-[#1C1C1E] text-white" aria-label="Sayt altlığı">

      {/* Əsas footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brend sütunu */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Image src="/images/logo-white.svg" alt="Cahan Academy" width={40} height={40} />
              <span className="font-heading text-xl tracking-wider uppercase">
                Cahan <span className="text-[#C9A84C]">Academy</span>
              </span>
            </div>
            <p className="text-[#9CA3AF] leading-relaxed max-w-sm">
              Bakıda peşəkar tədris mərkəzi. Gələcəyinizi bizimlə qurun —
              proqramlaşdırma, dizayn, riyaziyyat kursları.
            </p>

            {/* Əlaqə məlumatları */}
            <div className="mt-6 space-y-2 text-sm text-[#9CA3AF]">
              <p>📍 Nizami küçəsi 100, Bakı AZ1000</p>
              <p>
                📞{' '}
                <a href="tel:+994501234567" className="hover:text-[#C9A84C] transition-colors">
                  +994 50 123 45 67
                </a>
              </p>
              <p>
                📧{' '}
                <a href="mailto:info@cahanacademy.az" className="hover:text-[#C9A84C] transition-colors">
                  info@cahanacademy.az
                </a>
              </p>
            </div>
          </div>

          {/* Sürətli keçidlər */}
          <div>
            <h3 className="font-heading text-sm tracking-widest uppercase text-[#C9A84C] mb-4">
              Keçidlər
            </h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[#9CA3AF] hover:text-white text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sosial media */}
          <div>
            <h3 className="font-heading text-sm tracking-widest uppercase text-[#C9A84C] mb-4">
              Sosial Media
            </h3>
            <div className="flex flex-wrap gap-3">
              {SOCIAL_LINKS.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-full border border-[#E8E4DC]/20
                             flex items-center justify-center
                             hover:border-[#C9A84C] hover:text-[#C9A84C]
                             text-[#9CA3AF] transition-all duration-200"
                >
                  <span className="text-xs">{label[0]}</span>
                </a>
              ))}
            </div>

            {/* İş saatları */}
            <div className="mt-6 text-sm text-[#9CA3AF]">
              <p className="font-medium text-white mb-2">İş saatları</p>
              <p>B.e — Cümə: 09:00 — 20:00</p>
              <p>Şənbə: 10:00 — 17:00</p>
            </div>
          </div>
        </div>
      </div>

      <Divider className="border-[#E8E4DC]/10 mx-4 sm:mx-8" />

      {/* Alt xətt */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9CA3AF]">
          <p>© {new Date().getFullYear()} Cahan Academy. Bütün hüquqlar qorunur.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Məxfilik Siyasəti
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              İstifadə Şərtləri
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

---

## 4. Ana Səhifə Bölmələri

### 4.1 HeroSection

```typescript
// components/sections/home/HeroSection.tsx
// Server Component

import Image  from 'next/image';
import Link   from 'next/link';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';

interface HeroSectionProps {
  locale: 'az' | 'en' | 'ru';
}

const content = {
  az: {
    eyebrow:  'Bakıda Peşəkar Tədris Mərkəzi',
    heading:  'Gələcəyinizi Bizimlə Qurun',
    subheading:
      'Proqramlaşdırma, dizayn, riyaziyyat kursları. Peşəkar müəllimlər, ' +
      'sertifikat proqramları, çevik cədvəl.',
    cta:         'Kurslara bax',
    ctaSecondary: 'Müraciət et',
  },
  en: {
    eyebrow:  'Professional Education Center in Baku',
    heading:  'Build Your Future With Us',
    subheading:
      'Programming, design, mathematics courses. Professional teachers, ' +
      'certification programs, flexible schedule.',
    cta:         'View Courses',
    ctaSecondary: 'Contact Us',
  },
  ru: {
    eyebrow:  'Профессиональный учебный центр в Баку',
    heading:  'Постройте своё будущее с нами',
    subheading:
      'Курсы программирования, дизайна, математики. Профессиональные ' +
      'преподаватели, сертификаты, гибкое расписание.',
    cta:         'Смотреть курсы',
    ctaSecondary: 'Связаться',
  },
};

export function HeroSection({ locale }: HeroSectionProps) {
  const t = content[locale];

  return (
    <section
      className="relative min-h-[90vh] flex items-center pt-18"
      aria-label="Əsas bölmə"
    >
      {/* Arxa fon şəkli */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-bg.jpg"
          alt=""
          fill
          priority
          fetchPriority="high"
          className="object-cover"
          sizes="100vw"
          quality={85}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1C1C1E]/85 via-[#1C1C1E]/60 to-transparent" />
      </div>

      {/* Məzmun */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl">

          {/* Eyebrow mətn */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-[#C9A84C]" />
            <span className="text-[#C9A84C] text-sm font-medium tracking-widest uppercase">
              {t.eyebrow}
            </span>
          </div>

          {/* Əsas başlıq — h1 — LCP elementi */}
          <h1 className="font-heading text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
            {t.heading}
          </h1>

          {/* Alt mətn */}
          <p className="text-lg text-white/80 leading-relaxed mb-10 max-w-xl">
            {t.subheading}
          </p>

          {/* CTA düymələri */}
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Button
              variant="gold"
              size="lg"
              rightIcon={<span aria-hidden="true">→</span>}
            >
              <Link href="/courses">{t.cta}</Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-[#1C1C1E]"
            >
              <Link href="/contact">{t.ctaSecondary}</Link>
            </Button>
          </div>

          {/* Statistika sırası */}
          <div className="flex items-center gap-8 mt-14 pt-10 border-t border-white/20">
            {[
              { value: '500+', label: 'Məzun tələbə' },
              { value: '15+',  label: 'Aktiv kurs' },
              { value: '8+',   label: 'Peşəkar müəllim' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="font-heading text-3xl font-bold text-[#C9A84C]">{value}</p>
                <p className="text-white/60 text-sm mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

### 4.2 StatsSection

```typescript
// components/sections/home/StatsSection.tsx

interface Stat {
  value:  string;
  label:  string;
  suffix?: string;
}

const stats: Stat[] = [
  { value: '500', suffix: '+', label: 'Məzun tələbə'    },
  { value: '15',  suffix: '+', label: 'Aktiv kurs'      },
  { value: '98',  suffix: '%', label: 'Razılıq nisbəti' },
  { value: '8',   suffix: '+', label: 'Peşəkar müəllim' },
];

export function StatsSection() {
  return (
    <section className="bg-[#1C1C1E] py-20" aria-label="Statistikalar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Bölmə başlığı */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-16 bg-[#C9A84C]/50" />
            <span className="text-[#C9A84C] text-xs tracking-widest uppercase">
              Rəqəmlərlə
            </span>
            <div className="h-px w-16 bg-[#C9A84C]/50" />
          </div>
          <h2 className="font-heading text-3xl text-white">
            Niyə Cahan Academy?
          </h2>
        </div>

        {/* Statistika kartları */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(({ value, suffix, label }) => (
            <div
              key={label}
              className="text-center p-8 border border-[#E8E4DC]/10 rounded-lg
                         hover:border-[#C9A84C]/40 transition-colors duration-300"
            >
              <p className="font-heading text-5xl font-bold text-[#C9A84C] mb-2">
                {value}
                <span className="text-3xl">{suffix}</span>
              </p>
              <p className="text-[#9CA3AF] text-sm tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

### 4.3 CourseCard

```typescript
// components/sections/courses/CourseCard.tsx
// Server Component

import Image from 'next/image';
import Link  from 'next/link';
import { Badge }  from '@/components/ui/Badge';
import { Clock, Users, Award } from 'lucide-react';
import type { Course } from '@academy/shared-types';

interface CourseCardProps {
  course: Course;
  locale: 'az' | 'en' | 'ru';
}

export function CourseCard({ course, locale }: CourseCardProps) {
  const href  = `/${locale === 'az' ? '' : locale + '/'}courses/${course.slug}`;
  const title = course.title[locale];
  const desc  = course.shortDesc?.[locale] || course.description[locale];

  return (
    <article className="group bg-white border border-[#E8E4DC] rounded-lg overflow-hidden hover:shadow-lg hover:border-[#C9A84C]/30 transition-all duration-300">

      {/* Şəkil */}
      <div className="relative h-52 overflow-hidden bg-[#E8E4DC]">
        {course.imageUrl ? (
          <Image
            src={course.imageUrl}
            alt={`${title} — Cahan Academy`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1C1C1E] to-[#2D1B2E]">
            <span className="font-heading text-4xl text-[#C9A84C]">CA</span>
          </div>
        )}

        {/* Featured badge */}
        {course.isFeatured && (
          <div className="absolute top-3 left-3">
            <Badge variant="gold">Tövsiyə edilir</Badge>
          </div>
        )}

        {/* Sertifikat badge */}
        {course.certificate && (
          <div className="absolute top-3 right-3">
            <Badge variant="green">Sertifikat</Badge>
          </div>
        )}
      </div>

      {/* Məzmun */}
      <div className="p-6">

        {/* Səviyyə */}
        {course.level && (
          <Badge variant="outline" className="mb-3">{course.level}</Badge>
        )}

        {/* Başlıq */}
        <h3 className="font-heading text-xl font-semibold text-[#1C1C1E] mb-2 line-clamp-2 group-hover:text-[#800020] transition-colors">
          <Link href={href} className="focus:outline-none focus-visible:underline">
            {title}
          </Link>
        </h3>

        {/* Açıqlama */}
        <p className="text-[#6B6B6B] text-sm leading-relaxed line-clamp-2 mb-5">
          {desc}
        </p>

        {/* Meta məlumatlar */}
        <div className="flex items-center gap-4 text-xs text-[#9CA3AF] mb-5">
          {course.duration && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              {course.duration}
            </span>
          )}
          {course.groupSize && (
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" aria-hidden="true" />
              Maks. {course.groupSize} nəfər
            </span>
          )}
          {course.certificate && (
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" aria-hidden="true" />
              Sertifikat
            </span>
          )}
        </div>

        {/* Qiymət + CTA */}
        <div className="flex items-center justify-between pt-5 border-t border-[#E8E4DC]">
          <div>
            {course.price ? (
              <p className="font-heading text-2xl font-bold text-[#1C1C1E]">
                {Number(course.price).toLocaleString('az-AZ')}
                <span className="text-base font-normal text-[#6B6B6B] ml-1">AZN</span>
              </p>
            ) : (
              <p className="text-[#800020] font-medium">Pulsuz</p>
            )}
          </div>

          <Link
            href={href}
            className="inline-flex items-center gap-1.5 text-sm font-medium
                       text-[#800020] hover:text-[#6B001A] transition-colors"
            aria-label={`${title} kursuna ətraflı bax`}
          >
            Ətraflı
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
```

---

### 4.4 TeacherCard

```typescript
// components/sections/teachers/TeacherCard.tsx

import Image from 'next/image';
import Link  from 'next/link';
import { Linkedin, Github, Twitter } from 'lucide-react';
import type { Teacher } from '@academy/shared-types';

interface TeacherCardProps {
  teacher: Teacher;
  locale:  'az' | 'en' | 'ru';
}

export function TeacherCard({ teacher, locale }: TeacherCardProps) {
  const href  = `/teachers/${teacher.slug}`;
  const title = teacher.title[locale];
  const bio   = teacher.bio[locale];

  return (
    <article className="group text-center p-8 bg-white border border-[#E8E4DC] rounded-lg hover:shadow-md hover:border-[#C9A84C]/30 transition-all duration-300">

      {/* Avatar */}
      <div className="relative w-28 h-28 mx-auto mb-5">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#C9A84C]/20 to-[#800020]/20" />
        {teacher.avatarUrl ? (
          <Image
            src={teacher.avatarUrl}
            alt={`${teacher.name} — ${title}`}
            fill
            className="object-cover rounded-full ring-2 ring-[#E8E4DC] group-hover:ring-[#C9A84C] transition-all"
            sizes="112px"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-[#1C1C1E] flex items-center justify-center ring-2 ring-[#E8E4DC]">
            <span className="font-heading text-2xl text-[#C9A84C]">
              {teacher.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Ad */}
      <h3 className="font-heading text-xl font-semibold text-[#1C1C1E] mb-1 group-hover:text-[#800020] transition-colors">
        <Link href={href}>{teacher.name}</Link>
      </h3>

      {/* Vəzifə */}
      <p className="text-[#C9A84C] text-sm font-medium tracking-wide mb-4">
        {title}
      </p>

      {/* Bio */}
      <p className="text-[#6B6B6B] text-sm leading-relaxed line-clamp-3 mb-6">
        {bio}
      </p>

      {/* Sosial keçidlər */}
      <div className="flex items-center justify-center gap-3">
        {teacher.linkedinUrl && (
          <a
            href={teacher.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${teacher.name} LinkedIn`}
            className="w-9 h-9 rounded-full border border-[#E8E4DC] flex items-center justify-center text-[#9CA3AF] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all"
          >
            <Linkedin className="w-4 h-4" />
          </a>
        )}
        {teacher.githubUrl && (
          <a
            href={teacher.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${teacher.name} GitHub`}
            className="w-9 h-9 rounded-full border border-[#E8E4DC] flex items-center justify-center text-[#9CA3AF] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all"
          >
            <Github className="w-4 h-4" />
          </a>
        )}
        {teacher.twitterUrl && (
          <a
            href={teacher.twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${teacher.name} Twitter`}
            className="w-9 h-9 rounded-full border border-[#E8E4DC] flex items-center justify-center text-[#9CA3AF] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all"
          >
            <Twitter className="w-4 h-4" />
          </a>
        )}
      </div>
    </article>
  );
}
```

---

## 5. Form Komponentlər

### 5.1 ContactForm

```typescript
// components/forms/ContactForm.tsx
'use client';

import { useState }         from 'react';
import { useForm }          from 'react-hook-form';
import { zodResolver }      from '@hookform/resolvers/zod';
import { z }                from 'zod';
import { Input }            from '@/components/ui/Input';
import { Button }           from '@/components/ui/Button';

const schema = z.object({
  name:    z.string().min(2, 'Ad ən az 2 simvol olmalıdır'),
  email:   z.string().email('Düzgün email daxil edin'),
  phone:   z.string().regex(/^(\+994|0)(50|51|55|60|70|77|99)\d{7}$/, 'Düzgün nömrə daxil edin').optional().or(z.literal('')),
  message: z.string().min(10, 'Mesaj ən az 10 simvol olmalıdır').max(1000),
});

type FormData = z.infer<typeof schema>;

type FormState = 'idle' | 'loading' | 'success' | 'error';

export function ContactForm() {
  const [state,   setState]   = useState<FormState>('idle');
  const [errMsg,  setErrMsg]  = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setState('loading');
    setErrMsg('');

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/contact`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(data),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Xəta baş verdi');
      }

      setState('success');
      reset();
    } catch (err: any) {
      setState('error');
      setErrMsg(err.message || 'Xəta baş verdi. Yenidən cəhd edin.');
    }
  }

  if (state === 'success') {
    return (
      <div className="text-center py-12 px-6 bg-white border border-[#E8E4DC] rounded-lg">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#C9A84C]/10 flex items-center justify-center">
          <span className="text-3xl">✓</span>
        </div>
        <h3 className="font-heading text-2xl text-[#1C1C1E] mb-3">
          Müraciətiniz qəbul edildi
        </h3>
        <p className="text-[#6B6B6B] mb-6">
          24 saat ərzində sizinlə əlaqə saxlayacağıq.
        </p>
        <Button variant="outline" onClick={() => setState('idle')}>
          Yeni müraciət
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
      aria-label="Əlaqə forması"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          label="Adınız"
          placeholder="Anar Hüseynov"
          required
          error={errors.name?.message}
          autoComplete="name"
          {...register('name')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="anar@example.com"
          required
          error={errors.email?.message}
          autoComplete="email"
          {...register('email')}
        />
      </div>

      <Input
        label="Telefon"
        type="tel"
        placeholder="+994 50 123 45 67"
        hint="Opsional — daha sürətli əlaqə üçün"
        error={errors.phone?.message}
        autoComplete="tel"
        {...register('phone')}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#1C1C1E]">
          Mesaj <span className="text-[#800020]" aria-hidden="true">*</span>
        </label>
        <textarea
          rows={5}
          placeholder="Sualınızı yazın..."
          className="w-full px-4 py-3 rounded-md bg-white border border-[#E8E4DC]
                     text-[#1C1C1E] placeholder:text-[#9CA3AF]
                     focus:outline-none focus:border-[#800020] focus:ring-1 focus:ring-[#800020]
                     resize-none transition-colors"
          aria-required="true"
          aria-invalid={!!errors.message}
          {...register('message')}
        />
        {errors.message && (
          <p role="alert" className="text-sm text-red-600">
            ⚠ {errors.message.message}
          </p>
        )}
      </div>

      {state === 'error' && (
        <div role="alert" className="px-4 py-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {errMsg}
        </div>
      )}

      <Button
        type="submit"
        variant="secondary"
        size="lg"
        isLoading={state === 'loading'}
        fullWidth
      >
        {state === 'loading' ? 'Göndərilir...' : 'Müraciəti göndər'}
      </Button>

      <p className="text-xs text-[#9CA3AF] text-center">
        Məlumatlarınız üçüncü tərəflərlə paylaşılmır.
        <br />
        <a href="/privacy-policy" className="hover:text-[#1C1C1E] transition-colors underline">
          Məxfilik siyasəti
        </a>
      </p>
    </form>
  );
}
```

---

### 5.2 NewsletterForm

```typescript
// components/forms/NewsletterForm.tsx
'use client';

import { useState }  from 'react';
import { Button }    from '@/components/ui/Button';

export function NewsletterForm() {
  const [email,   setEmail]   = useState('');
  const [state,   setState]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setState('loading');

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/newsletter/subscribe`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email }),
        }
      );

      const json = await res.json();

      if (res.status === 409) {
        setState('error');
        setMessage('Bu email artıq abunədir.');
        return;
      }

      if (!res.ok) throw new Error(json.message);

      setState('success');
      setEmail('');
    } catch {
      setState('error');
      setMessage('Xəta baş verdi. Yenidən cəhd edin.');
    }
  }

  if (state === 'success') {
    return (
      <p className="text-[#C9A84C] font-medium">
        ✓ Abunəliyiniz qəbul edildi! Email ünvanınızı təsdiq edin.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email ünvanınız"
        required
        aria-label="Newsletter üçün email"
        className="flex-1 px-4 py-3 rounded-md bg-white/10 border border-white/20
                   text-white placeholder:text-white/50
                   focus:outline-none focus:border-[#C9A84C]
                   transition-colors"
      />
      <Button
        type="submit"
        variant="gold"
        isLoading={state === 'loading'}
      >
        Abunə ol
      </Button>
      {state === 'error' && (
        <p role="alert" className="text-red-400 text-sm w-full">{message}</p>
      )}
    </form>
  );
}
```

---

## 6. CTASection

```typescript
// components/sections/home/CTASection.tsx
// Server Component

import Link from 'next/link';
import { Button }       from '@/components/ui/Button';
import { NewsletterForm } from '@/components/forms/NewsletterForm';
import { Divider }      from '@/components/ui/Divider';

export function CTASection() {
  return (
    <section className="bg-[#1C1C1E] py-24" aria-label="Çağırış bölməsi">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        <Divider variant="gold" label="İndi Başla" className="mb-12" />

        <h2 className="font-heading text-4xl lg:text-5xl text-white mb-6">
          Gələcəyinizə İnvest Edin
        </h2>
        <p className="text-[#9CA3AF] text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
          Hər gün yeni bir şey öyrənin. Peşəkar müəllimlərimiz sizinlə
          addım-addım irəliləyəcək.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button variant="gold" size="lg">
            <Link href="/courses">Kurslara bax</Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-white/30 text-white hover:bg-white hover:text-[#1C1C1E]"
          >
            <Link href="/contact">Müraciət et</Link>
          </Button>
        </div>

        <Divider className="border-white/10 mb-12" />

        {/* Newsletter */}
        <div>
          <h3 className="font-heading text-xl text-white mb-3">
            Xəbərlərdən xəbərdar olun
          </h3>
          <p className="text-[#9CA3AF] text-sm mb-6">
            Yeni kurslar, endirimlər və akademiya xəbərləri üçün abunə olun.
          </p>
          <div className="max-w-md mx-auto">
            <NewsletterForm />
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## 7. Əlçatanlıq (Accessibility) Qaydaları

```
FOCUS İDARƏSİ
  ✅ Bütün interaktiv elementlər focus-visible ilə görünür
  ✅ focus-visible:ring-[#C9A84C] — qızılı fokus xətti
  ✅ Skip to main content linki (keyboard istifadəçiləri üçün)

SEMANTİK HTML
  ✅ <header>, <nav>, <main>, <section>, <article>, <footer>
  ✅ Hər <section>-da aria-label
  ✅ Şəkillərdə mənalı alt mətnlər
  ✅ Dekorativ şəkillərdə alt="" + aria-hidden="true"
  ✅ Form elementlərinin <label> ilə əlaqəsi (htmlFor/id)

FORM
  ✅ aria-required="true" — məcburi sahələr
  ✅ aria-invalid={!!error} — xətalı sahələr
  ✅ aria-describedby — xəta mesajı ilə əlaqə
  ✅ role="alert" — xəta mesajları
  ✅ noValidate — brauzer validasiyasını söndür, Zod istifadə et

RƏNG KONTRASİ
  ✅ Əsas mətn (#1C1C1E üzərindəki): AAA səviyyəsi
  ✅ İkinci dərəcəli mətn (#6B6B6B): AA səviyyəsi
  ✅ Qızılı (#C9A84C) qaranlıq fonda: AA səviyyəsi
```

---

## 8. Komponent Yoxlama Siyahısı

```
UI KOMPONENTLƏRİ
  [ ]  Button — bütün variantlar render olunur
  [ ]  Button — isLoading vəziyyəti işləyir
  [ ]  Input — error vəziyyəti göstərilir
  [ ]  Input — hint mətn göstərilir
  [ ]  Badge — bütün variantlar render olunur
  [ ]  Divider — gold variant render olunur

LAYOUT
  [ ]  Header — mobile + desktop görünüşü
  [ ]  Navbar — aktiv link vurğulanır
  [ ]  Footer — bütün keçidlər işləyir
  [ ]  LanguageSwitcher — dil dəyişir
  [ ]  MobileMenu — açılır/bağlanır

SECTIONS
  [ ]  HeroSection — şəkil yüklənir, LCP < 2.5s
  [ ]  StatsSection — rəqəmlər düzgün göstərilir
  [ ]  CourseCard — qiymət formatlı göstərilir
  [ ]  CourseCard — şəkil olmadıqda fallback işləyir
  [ ]  TeacherCard — sosial keçidlər işləyir

FORMLAR
  [ ]  ContactForm — validasiya işləyir
  [ ]  ContactForm — uğurlu göndərmə sonrası success göstərilir
  [ ]  ContactForm — xəta vəziyyəti işləyir
  [ ]  NewsletterForm — uğurlu abunəlik
  [ ]  NewsletterForm — artıq abunə xətası

ƏLÇATANLIlıq
  [ ]  Bütün komponentlər keyboard ilə idarə olunur
  [ ]  Screen reader ilə test edilib (NVDA/VoiceOver)
  [ ]  Lighthouse Accessibility skoru > 95
```
