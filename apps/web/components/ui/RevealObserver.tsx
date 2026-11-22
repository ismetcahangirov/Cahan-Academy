'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Pairs with <Reveal> (components/ui/Reveal.tsx); see the safety notes there. */
const SELECTOR = '.reveal, .reveal-stagger';

/**
 * Mount once (locale layout). Re-scans on route change and when new reveal nodes are added.
 * Positions come from IntersectionObserver entries only (no getBoundingClientRect → no forced layout,
 * and content-visibility:auto sections stay skipped until they approach the viewport).
 */
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const settle = (el: Element) => {
      el.classList.remove('is-pending');
      el.classList.add('is-in');
      // drop the reveal transition once it has played so hover transitions keep their own timing
      window.setTimeout(() => el.classList.remove('is-in'), 1400);
    };

    const first = new WeakSet<Element>(); // elements whose first observation is still pending
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target;
          if (first.has(el)) {
            first.delete(el);
            const vh = e.rootBounds?.height ?? window.innerHeight;
            // on screen (or above) at arm time: never hide it
            if (e.boundingClientRect.top < vh * 0.95) {
              io.unobserve(el);
              continue;
            }
            el.classList.add('is-pending');
            continue;
          }
          if (e.isIntersecting && e.intersectionRatio > 0.05) {
            io.unobserve(el);
            settle(el);
          }
        }
      },
      { threshold: [0, 0.08] }
    );

    const seen = new WeakSet<Element>();
    const arm = (root: ParentNode) => {
      root.querySelectorAll(SELECTOR).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        first.add(el);
        io.observe(el);
      });
    };

    // after the hydration burst: hiding below-the-fold content is not urgent
    const idle = 'requestIdleCallback' in window;
    const armTimer = idle
      ? window.requestIdleCallback(() => arm(document), { timeout: 1200 })
      : window.setTimeout(() => arm(document), 200);

    const mo = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((n) => {
          if (!(n instanceof Element)) return;
          if (n.matches(SELECTOR) && !seen.has(n)) {
            seen.add(n);
            first.add(n);
            io.observe(n);
          }
          arm(n);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (idle) window.cancelIdleCallback(armTimer);
      else window.clearTimeout(armTimer);
      io.disconnect();
      mo.disconnect();
      // never leave anything hidden behind when the observer goes away
      document.querySelectorAll('.is-pending').forEach((el) => el.classList.remove('is-pending'));
    };
  }, [pathname]);

  return null;
}
