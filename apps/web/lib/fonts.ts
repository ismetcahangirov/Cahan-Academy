import localFont from 'next/font/local';

/*
 * Self-hosted brand fonts. EB Garamond and Cormorant SC are subsets of the upstream Google Fonts TTFs
 * (SIL OFL, see assets/fonts/OFL.txt):
 *   *-latin     Basic Latin, Latin-1, Latin Extended-A, Ə/ə, punctuation, №, ₼/€  (az + en pages)
 *   *-cyrillic  Cyrillic (ru pages only download these — unicode-range)
 *   cormorant-sc-*  one file per weight with both ranges (small)
 *   cahan-display-regular  the academy's own title face (SIL OFL, assets/fonts/OFL-CahanDisplay.txt; OTFs + README in
 *                    docs/brand/font/cahan-display). Covers Latin + every Azerbaijani letter + Russian
 *                    Cyrillic + № ₼ in one file, so it needs no unicode-range split.
 * Coverage proof: `npm run fonts:coverage`. Rebuild recipe: apps/web/docs/DESIGN.md ("Fonts").
 *
 * How the split works: the Latin face and the Cyrillic face are two families stacked in --font-serif
 * (globals.css). The Latin call has NO generated fallback (adjustFontFallback: false),
 * otherwise its metric-adjusted local fallback would catch Cyrillic before the Cyrillic webfont; the
 * Cyrillic call carries the metric-adjusted fallback, which is what renders while fonts load.
 *
 * Roles: title (--font-script, kept name) = Cahan Display 400 (short fixed titles only), serif = EB Garamond (body, UI, data),
 * sc = Cormorant SC (labels, buttons, badges — always uppercase, see globals.css .sc).
 */
// unicode-range values are repeated as literals below (next/font requires literal options):
//   latin    = Basic Latin, Latin-1, Latin Ext-A, Ə/ə, punctuation, №, ₼, €
//   cyrillic = U+0400-045F, U+0490-0491, U+04D8-04D9

/*
 * Preload: only what the first screen paints — EB Garamond Latin upright (body, nav, lead) and Cahan Display 400
 * (titles). Italic is below the fold (testimonials, card dates, article excerpt), so it is its own call with
 * preload: false; both calls declare the SAME font-family ('Cahan EB Garamond'), so the browser still sees one
 * family with an upright and an italic face (a second family would get a synthesized oblique instead).
 */
export const ebGaramond = localFont({
  src: [{ path: '../assets/fonts/eb-garamond-latin.woff2', weight: '400 800', style: 'normal' }],
  variable: '--font-eb-garamond',
  display: 'swap',
  preload: true,
  declarations: [
    { prop: 'font-family', value: "'Cahan EB Garamond'" },
    { prop: 'unicode-range', value: 'U+0000-00FF, U+0100-017F, U+018F, U+0192, U+0259, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0300-030C, U+0327, U+2000-206F, U+20AC, U+20BC, U+2116, U+2122, U+2190-2193, U+2212, U+2215, U+FEFF, U+FFFD' },
  ],
  adjustFontFallback: false,
});

export const ebGaramondItalic = localFont({
  src: [{ path: '../assets/fonts/eb-garamond-italic-latin.woff2', weight: '400 800', style: 'italic' }],
  display: 'swap',
  preload: false,
  declarations: [
    { prop: 'font-family', value: "'Cahan EB Garamond'" },
    { prop: 'unicode-range', value: 'U+0000-00FF, U+0100-017F, U+018F, U+0192, U+0259, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0300-030C, U+0327, U+2000-206F, U+20AC, U+20BC, U+2116, U+2122, U+2190-2193, U+2212, U+2215, U+FEFF, U+FFFD' },
  ],
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

/*
 * Cahan Display: hhea and OS/2 typo metrics are identical (950/-300, line gap 0) even though USE_TYPO_METRICS is
 * set, so next/font's generated fallback (which reads hhea) matches the line box browsers use — the automatic
 * 'Times New Roman' fallback is safe here (unlike a font whose hhea and typo metrics differ, which needs a
 * hand-written fallback @font-face). Titles always use weight 400, so only Regular ships; the Light and Bold
 * OTFs stay in docs/brand/font/cahan-display (subset one into assets/fonts and add it here when a design uses it).
 */
export const cahanDisplay = localFont({
  src: [{ path: '../assets/fonts/cahan-display-regular.woff2', weight: '400', style: 'normal' }],
  variable: '--font-cahan-display',
  display: 'swap',
  // titles now use Times New Roman (--font-title in globals.css); the face stays registered but is not preloaded,
  // so the browser only downloads it if a rule uses var(--font-cahan-display) again
  preload: false,
  fallback: ['Georgia', 'Times New Roman', 'serif'],
  adjustFontFallback: 'Times New Roman',
});

export const cormorantSC = localFont({
  src: [
    { path: '../assets/fonts/cormorant-sc-600.woff2', weight: '500 600', style: 'normal' },
    { path: '../assets/fonts/cormorant-sc-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-cormorant-sc',
  display: 'swap',
  // small labels only; not preloaded so the hero's title + serif faces get the bandwidth (LCP)
  preload: false,
  fallback: ['Georgia', 'serif'],
  adjustFontFallback: 'Times New Roman',
});

// ebGaramondItalic has no variable of its own: its @font-face joins --font-eb-garamond's family ('Cahan EB Garamond').
export const fontVariables = [ebGaramond, ebGaramondCyrillic, cahanDisplay, cormorantSC]
  .map((f) => f.variable)
  .join(' ');
