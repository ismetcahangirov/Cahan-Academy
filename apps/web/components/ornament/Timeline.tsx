import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { EdelweissGlyph } from './Edelweiss';

/**
 * Timeline — vertical hairline with dots; italic marks (time / step number) on the left, small-caps
 * titles on the right. "How it works" / learning path, schedules, history.
 *
 * <Timeline>
 *   <TimelineItem time="I" title="Kursu seçin" meta="…" state="done" />
 *   <TimelineItem time="II" title="Müraciət edin" state="current">…children…</TimelineItem>
 * </Timeline>
 * state: 'done' (filled dot) | 'current' (edelweiss) | 'upcoming' (outline dot, default) | 'cancelled'
 */
export type TimelineState = 'done' | 'current' | 'upcoming' | 'cancelled';

export function Timeline({ className, children }: { className?: string; children: ReactNode }) {
  return <ol className={cn('relative', className)}>{children}</ol>;
}

function Dot({ state }: { state: TimelineState }) {
  if (state === 'current') return <EdelweissGlyph className="h-5 w-5 text-accent-text" />;
  return (
    <span
      className={cn(
        'block h-2.5 w-2.5 rounded-full border-[1.5px] border-accent-text bg-page',
        state === 'done' && 'bg-accent-text',
        state === 'cancelled' && 'border-dashed border-line-strong'
      )}
    />
  );
}

export function TimelineItem({
  time,
  title,
  meta,
  state = 'upcoming',
  children,
  className,
}: {
  time?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  state?: TimelineState;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <li className={cn('relative grid grid-cols-[3.5rem_1.5rem_1fr] gap-x-2 sm:grid-cols-[5rem_1.75rem_1fr]', className)}>
      <div className="time-italic pt-0.5 text-right text-[1.1rem] text-ink-muted">{time}</div>
      <div className="relative flex justify-center">
        <span aria-hidden="true" className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-line-strong" />
        <span className="relative z-10 mt-1.5 flex h-5 items-start justify-center">
          <Dot state={state} />
        </span>
      </div>
      <div className={cn('pb-7', state === 'cancelled' && 'line-through decoration-line-strong')}>
        <p className={cn('sc text-[1rem]', state === 'current' ? 'text-accent-text' : 'text-ink')}>{title}</p>
        {meta && <p className="mt-1 text-[1rem] leading-relaxed text-ink-muted">{meta}</p>}
        {children && <div className="mt-2">{children}</div>}
      </div>
    </li>
  );
}

export default Timeline;
