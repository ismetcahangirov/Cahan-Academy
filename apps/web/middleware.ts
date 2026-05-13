import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales:       ['az', 'en', 'ru'],
  defaultLocale: 'az',
  localePrefix:  'as-needed',
});

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin panel qorunması — /dashboard/**
  const isAdminPath = /\/(az|en|ru)?\/?(dashboard)/.test(pathname);

  if (isAdminPath) {
    const token = request.cookies.get('refreshToken');
    if (!token) {
      const locale = pathname.split('/')[1] ?? 'az';
      const loginUrl = ['az', 'en', 'ru'].includes(locale)
        ? `/${locale}/login`
        : '/login';
      return NextResponse.redirect(new URL(loginUrl, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
