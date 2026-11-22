import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** Sent on every route. The admin CMS lives in this app, so framing is forbidden (clickjacking). */
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // `npm run lint` runs as its own CI step (root turbo lint), so the build does not repeat it.
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // Must match ALLOWED_IMAGE_HOST_SUFFIXES in apps/api/src/schemas/form.schema.ts: the API only
    // accepts image URLs on these hosts, because next/image throws for any other host.
    // (`example.com` was removed: no stored record uses it — checked against the production API
    // on 2026-11-22 — and placeholder images must be replaced by local artwork anyway.)
    remotePatterns: [
      // Local mock API images (scripts/mock-api.mjs) — only on a developer machine, never on Vercel.
      ...(process.env.VERCEL ? [] : [{ protocol: 'http' as const, hostname: 'localhost' }]),
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: '**.unsplash.com' },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
