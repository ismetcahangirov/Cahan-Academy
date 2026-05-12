import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales:       ['az', 'en', 'ru'],
  defaultLocale: 'az',
  localePrefix:  'as-needed', // /az/... → /...
});

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin panel qorunması — /[locale]/admin/**
  const isAdminPath = /\/(az|en|ru)?\/?(admin)(?!\/login)/.test(pathname);

  if (isAdminPath) {
    const token = request.cookies.get('admin_token');
    if (!token) {
      const locale = pathname.split('/')[1] ?? 'az';
      const loginUrl = ['az', 'en', 'ru'].includes(locale)
        ? `/${locale}/admin/login`
        : '/admin/login';
      return NextResponse.redirect(new URL(loginUrl, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
