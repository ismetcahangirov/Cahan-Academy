import { cn } from '@/lib/utils';
import { EdelweissGlyph } from './Edelweiss';
import { BRAND_SPRITE } from '../brand/Brand';

/**
 * OrnamentDivider — edelweiss in the middle, plain strokes tapering from thick (centre) to thin (ends).
 * Goes under every ScriptTitle, between sections of long text, inside modals and cards.
 *
 * <OrnamentDivider />                       centred (default)
 * <OrnamentDivider align="start" />         glyph at the start, flourish running to the right
 * <OrnamentDivider motif="dot" />
 * Props: align 'center'|'start', motif 'edelweiss'|'dot'|'none', draw (one-shot stroke draw, inline paths;
 * default off = cached sprite symbol), className.
 */
function Flourish({ flip, draw, className }: { flip?: boolean; draw?: boolean; className?: string }) {
  if (!draw) {
    return (
      <svg
        viewBox="0 0 120 16"
        aria-hidden="true"
        focusable="false"
        preserveAspectRatio="xMaxYMid meet"
        className={cn('h-4 overflow-visible', className)}
        style={flip ? { transform: 'scaleX(-1)' } : undefined}
      >
        <use href={`${BRAND_SPRITE}#orn-flourish`} width="120" height="16" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 120 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMaxYMid meet"
      className={cn('h-4 overflow-visible', draw && 'orn-draw', className)}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path pathLength={1} vectorEffect="non-scaling-stroke" d="M1 8C30 8 55 8 74 8" />
      <path pathLength={1} vectorEffect="non-scaling-stroke" d="M74 8C86 8 90 2.5 97 2.8C103 3 104.5 9 100 10.2C96.5 11 94.5 7.2 97.5 6" />
      <path pathLength={1} vectorEffect="non-scaling-stroke" d="M74 8C86 8 90 13.5 97 13.2C103 13 104.5 7 100 5.8C96.5 5 94.5 8.8 97.5 10" />
      <path pathLength={1} vectorEffect="non-scaling-stroke" d="M105 8H117" />
      <circle cx="1.5" cy="8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Motif({ motif }: { motif: 'edelweiss' | 'dot' | 'none' }) {
  if (motif === 'none') return null;
  if (motif === 'dot') return <span className="mx-1 inline-block h-1.5 w-1.5 rotate-45 bg-current" aria-hidden="true" />;
  return <EdelweissGlyph className="h-4 w-4 shrink-0 text-current" />;
}

/** Plain tapered stroke: thickest next to the motif, thinning to a point at the outer end. */
function Taper({ flip, className }: { flip?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 120 4"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="none"
      className={cn('h-1', className)}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path d="M0 2L118 1Q120 2 118 3Z" fill="currentColor" />
    </svg>
  );
}

export default function OrnamentDivider({
  align = 'center',
  motif = 'edelweiss',
  line = 'taper',
  draw = false,
  className,
}: {
  align?: 'center' | 'start';
  motif?: 'edelweiss' | 'dot' | 'none';
  /** 'taper' = plain stroke tapering from thick (centre) to thin (default); 'flourish' = curled hairline. */
  line?: 'flourish' | 'taper';
  draw?: boolean;
  className?: string;
}) {
  const centerW = 'w-24 sm:w-32';
  const startW = 'w-40 sm:w-56';
  return (
    <div
      role="presentation"
      className={cn(
        'flex items-center text-ornament',
        line === 'taper' ? 'gap-2.5' : 'gap-1.5',
        align === 'center' ? 'justify-center' : 'justify-start',
        className
      )}
    >
      {align === 'center' &&
        (line === 'taper' ? <Taper className={centerW} /> : <Flourish draw={draw} className={centerW} />)}
      <Motif motif={motif} />
      {line === 'taper' ? (
        <Taper flip className={align === 'center' ? centerW : startW} />
      ) : (
        <Flourish flip draw={draw} className={align === 'center' ? centerW : startW} />
      )}
    </div>
  );
}
