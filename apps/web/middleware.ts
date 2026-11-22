import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/config';
import { ADMIN_MARKER_COOKIE } from './context/sessionMarker';

const intlMiddleware = createMiddleware(routing);

/**
 * Matches `/dashboard`, `/dashboard/...` and the same under a locale prefix — and nothing else.
 * The old regex matched "dashboard" anywhere, e.g. `/en/blog/dashboard-tips` redirected to login.
 */
const ADMIN_PATH = /^\/(?:(az|en|ru)\/)?dashboard(?:\/|$)/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = ADMIN_PATH.exec(pathname);

  // UX-only gate (see context/sessionMarker.ts): send visitors without a session marker to the
  // login page. The API enforces authorisation on every admin request regardless.
  if (match && !request.cookies.has(ADMIN_MARKER_COOKIE)) {
    const locale = match[1] ?? routing.defaultLocale;
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.search = '';
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  // Generated OG images are skipped too: Next links them as `/az/opengraph-image?…`, and the locale
  // middleware would 307 that (the default locale has no prefix); crawlers want a direct 200.
  matcher: ['/((?!api|_next|_vercel|.*opengraph-image|.*\\..*).*)'],
};
