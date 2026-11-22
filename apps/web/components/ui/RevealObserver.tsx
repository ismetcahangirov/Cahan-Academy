'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Pairs with <Reveal> (components/ui/Reveal.tsx); see the safety notes there. */
const SELECTOR = '.reveal, .reveal-stagger';

/** Mount once (locale layout). Re-scans on route change and when new reveal nodes are added. */
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

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.unobserve(e.target);
          settle(e.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    const seen = new WeakSet<Element>();
    const arm = (root: ParentNode) => {
      const vh = window.innerHeight;
      root.querySelectorAll(SELECTOR).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        // only hide what the visitor cannot see yet — never anything already on screen
        if (el.getBoundingClientRect().top < vh * 0.95) return;
        el.classList.add('is-pending');
        io.observe(el);
      });
    };

    arm(document);

    const mo = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((n) => {
          if (n instanceof Element) arm(n.matches(SELECTOR) ? (n.parentNode ?? document) : n);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      // never leave anything hidden behind when the observer goes away
      document.querySelectorAll('.is-pending').forEach((el) => el.classList.remove('is-pending'));
    };
  }, [pathname]);

  return null;
}

