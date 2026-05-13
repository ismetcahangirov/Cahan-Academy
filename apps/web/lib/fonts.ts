import { Playfair_Display, Inter } from 'next/font/google';

export const playfair = Playfair_Display({
  subsets:  ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-heading',
  display:  'swap',
});

export const inter = Inter({
  subsets:  ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-body',
  display:  'swap',
});
