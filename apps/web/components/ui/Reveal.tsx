import type { CSSProperties, ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Scroll reveal that can never leave content blank.
 *
 * <Reveal>…</Reveal>                         fade + 18px rise when it scrolls into view
 * <Reveal as="ul" stagger>…<li/>…</Reveal>   children arrive one after another (first 7 staggered)
 * <Reveal fade delay={120}>…</Reveal>        opacity only, 120 ms later
 *
 * How it stays safe: the markup is rendered VISIBLE (SSR / no-JS / crawlers / print). <RevealObserver/>
 * (components/ui/RevealObserver.tsx, mounted once in the locale layout) runs after hydration and only hides elements that are still below
 * the viewport, then reveals them with IntersectionObserver. Skipped entirely without IntersectionObserver
 * or with prefers-reduced-motion. Only transform/opacity animate. `<Reveal>` itself is a plain element, so
 * it renders fine inside server components.
 *
 * Do not put `card-hover` on a direct child of a `stagger` parent — wrap it (the reveal transition is
 * removed again once it has played, but keep the hover lift on its own element).
 */
export function Reveal({
  as,
  stagger = false,
  fade = false,
  delay,
  className,
  style,
  children,
  ...rest
}: {
  as?: ElementType;
  stagger?: boolean;
  fade?: boolean;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
} & Record<string, unknown>) {
  const Tag: ElementType = as || 'div';
  return (
    <Tag
      className={cn(stagger ? 'reveal-stagger' : 'reveal', fade && 'reveal-fade', className)}
      style={delay ? ({ ...style, '--reveal-delay': `${delay}ms` } as CSSProperties) : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
