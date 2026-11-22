// Shared navigation model for Header, MobileMenu and Footer (labels come from messages `nav.*`).
export const NAV_LINKS = [
  { href: '/courses', key: 'courses' },
  { href: '/teachers', key: 'teachers' },
  { href: '/blog', key: 'blog' },
  { href: '/about', key: 'about' },
  { href: '/contact', key: 'contact' },
] as const;

export const FOOTER_LINKS = [...NAV_LINKS, { href: '/faq', key: 'faq' }] as const;

export const LOCALES = [
  { code: 'az', label: 'AZ', name: 'Azərbaycanca' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ru', label: 'RU', name: 'Русский' },
] as const;

/** true when `pathname` (without locale prefix) is inside the section `href` */
export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
