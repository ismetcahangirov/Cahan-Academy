import localFont from 'next/font/local';

/*
 * Self-hosted brand fonts (same families as the dashboard). The woff2 files in assets/fonts are
 * subsets of the upstream Google Fonts TTFs (SIL OFL, see assets/fonts/OFL.txt): Basic Latin,
 * Latin-1, Latin Extended-A, Ə/ə, Cyrillic, general punctuation, №, ₼/€/₽. One file per face, so
 * there is no unicode-range split to get wrong. Coverage proof: `npm run fonts:coverage`.
 * Rebuild recipe: apps/web/docs/DESIGN.md ("Fonts").
 *
 * Roles: script = Great Vibes (short fixed titles only), serif = EB Garamond (body, UI, data),
 * sc = Cormorant SC (labels, buttons, badges — always uppercase, see globals.css .sc).
 */
export const ebGaramond = localFont({
  src: [
    { path: '../assets/fonts/eb-garamond-var.woff2', weight: '400 800', style: 'normal' },
    { path: '../assets/fonts/eb-garamond-italic-var.woff2', weight: '400 800', style: 'italic' },
  ],
  variable: '--font-eb-garamond',
  display: 'swap',
  preload: true,
  fallback: ['Garamond', 'Georgia', 'serif'],
  adjustFontFallback: 'Times New Roman',
});

export const greatVibes = localFont({
  src: [{ path: '../assets/fonts/great-vibes-400.woff2', weight: '400', style: 'normal' }],
  variable: '--font-great-vibes',
  display: 'swap',
  preload: true,
  fallback: ['Segoe Script', 'cursive'],
  adjustFontFallback: false,
});

export const cormorantSC = localFont({
  src: [
    { path: '../assets/fonts/cormorant-sc-600.woff2', weight: '500 600', style: 'normal' },
    { path: '../assets/fonts/cormorant-sc-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-cormorant-sc',
  display: 'swap',
  preload: true,
  fallback: ['Georgia', 'serif'],
  adjustFontFallback: 'Times New Roman',
});

export const fontVariables = `${ebGaramond.variable} ${greatVibes.variable} ${cormorantSC.variable}`;
