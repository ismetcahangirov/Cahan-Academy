/**
 * Inline <head> script: applies the theme BEFORE first paint (no flash).
 * localStorage['theme'] = 'light' | 'dark'; missing/'system' = follow prefers-color-scheme.
 * Sets `.dark` + `color-scheme` on <html>. Everything is wrapped in try/catch (private mode, blocked storage).
 * <html> carries suppressHydrationWarning because this script changes its class before React hydrates.
 */
export const THEME_STORAGE_KEY = 'theme';

const script = `(function(){try{var d=document.documentElement,t=null;try{t=localStorage.getItem('${THEME_STORAGE_KEY}')}catch(e){}var k=t==='dark'||((t!=='light')&&window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches);d.classList.toggle('dark',k);d.style.colorScheme=k?'dark':'light'}catch(e){}})()`;

export default function ThemeScript() {
  return <script id="theme-init" dangerouslySetInnerHTML={{ __html: script }} />;
}
