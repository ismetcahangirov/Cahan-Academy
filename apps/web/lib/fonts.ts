import localFont from 'next/font/local';

/*
 * Self-hosted brand fonts (same families as the dashboard). The woff2 files in assets/fonts are subsets
 * of the upstream Google Fonts TTFs (SIL OFL, see assets/fonts/OFL.txt):
 *   *-latin     Basic Latin, Latin-1, Latin Extended-A, Ə/ə, punctuation, №, ₼/€  (az + en pages)
 *   *-cyrillic  Cyrillic (ru pages only download these — unicode-range)
 *   cormorant-sc-*  one file per weight with both ranges (small)
 * Coverage proof: `npm run fonts:coverage`. Rebuild recipe: apps/web/docs/DESIGN.md ("Fonts").
 *
 * How the split works: the Latin face and the Cyrillic face are two families stacked in --font-serif /
 * --font-script (globals.css). The Latin call has NO generated fallback (adjustFontFallback: false),
 * otherwise its metric-adjusted local fallback would catch Cyrillic before the Cyrillic webfont; the
 * Cyrillic call carries the metric-adjusted fallback, which is what renders while fonts load.
 *
 * Roles: script = Great Vibes (short fixed titles only), serif = EB Garamond (body, UI, data),
 * sc = Cormorant SC (labels, buttons, badges — always uppercase, see globals.css .sc).
 */
// unicode-range values are repeated as literals below (next/font requires literal options):
//   latin    = Basic Latin, Latin-1, Latin Ext-A, Ə/ə, punctuation, №, ₼, €
//   cyrillic = U+0400-045F, U+0490-0491, U+04D8-04D9

export const ebGaramond = localFont({
  src: [
    { path: '../assets/fonts/eb-garamond-latin.woff2', weight: '400 800', style: 'normal' },
    { path: '../assets/fonts/eb-garamond-italic-latin.woff2', weight: '400 800', style: 'italic' },
  ],
  variable: '--font-eb-garamond',
  display: 'swap',
  preload: true,
  declarations: [{ prop: 'unicode-range', value: 'U+0000-00FF, U+0100-017F, U+018F, U+0192, U+0259, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0300-030C, U+0327, U+2000-206F, U+20AC, U+20BC, U+2116, U+2122, U+2190-2193, U+2212, U+2215, U+FEFF, U+FFFD' }],
  adjustFontFallback: false,
});

export const ebGaramondCyrillic = localFont({
  src: [
    { path: '../assets/fonts/eb-garamond-cyrillic.woff2', weight: '400 800', style: 'normal' },
    { path: '../assets/fonts/eb-garamond-italic-cyrillic.woff2', weight: '400 800', style: 'italic' },
  ],
  variable: '--font-eb-garamond-cyr',
  display: 'swap',
  preload: false,
  declarations: [{ prop: 'unicode-range', value: 'U+0400-045F, U+0490-0491, U+04D8-04D9' }],
  fallback: ['Garamond', 'Georgia', 'serif'],
  adjustFontFallback: 'Times New Roman',
});

export const greatVibes = localFont({
  src: [{ path: '../assets/fonts/great-vibes-latin.woff2', weight: '400', style: 'normal' }],
  variable: '--font-great-vibes',
  display: 'swap',
  preload: true,
  declarations: [{ prop: 'unicode-range', value: 'U+0000-00FF, U+0100-017F, U+018F, U+0192, U+0259, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0300-030C, U+0327, U+2000-206F, U+20AC, U+20BC, U+2116, U+2122, U+2190-2193, U+2212, U+2215, U+FEFF, U+FFFD' }],
  adjustFontFallback: false,
});

export const greatVibesCyrillic = localFont({
  src: [{ path: '../assets/fonts/great-vibes-cyrillic.woff2', weight: '400', style: 'normal' }],
  variable: '--font-great-vibes-cyr',
  display: 'swap',
  preload: false,
  declarations: [{ prop: 'unicode-range', value: 'U+0400-045F, U+0490-0491, U+04D8-04D9' }],
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
  // small labels only; not preloaded so the hero's script + serif faces get the bandwidth (LCP)
  preload: false,
  fallback: ['Georgia', 'serif'],
  adjustFontFallback: 'Times New Roman',
});

export const fontVariables = [ebGaramond, ebGaramondCyrillic, greatVibes, greatVibesCyrillic, cormorantSC]
  .map((f) => f.variable)
  .join(' ');
