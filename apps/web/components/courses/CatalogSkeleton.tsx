import { Skeleton } from '@/components/ui/Spinner';
import { LaceCorner } from '@/components/ornament/Lace';
import WaveEdge from '@/components/ornament/WaveEdge';
import { cn } from '@/lib/utils';

/**
 * Route-level loading states (app/…/loading.tsx) for the catalogue pages, in palette: the same wine head
 * band (static, no text) and parchment-toned skeleton blocks shaped like the real cards, so the page does
 * not jump when data arrives. `variant`: 'courses' | 'teachers'. (Detail routes have no loading.tsx: an unknown slug must answer 404, not
 * a streamed 200.) Announced once via role=status.
 */
function Head() {
  return (
    <div className="theme-wine hero-wine relative isolate h-[19rem] overflow-hidden sm:h-[21rem]">
      <LaceCorner corner="tl" className="absolute left-0 top-0 w-20 sm:w-36 lg:w-48" />
      <LaceCorner corner="tr" className="absolute right-0 top-0 w-20 sm:w-36 lg:w-48" />
      <WaveEdge fill="var(--page-base)" className="absolute inset-x-0 -bottom-px" />
    </div>
  );
}

function CourseSkeleton() {
  return (
    <div className="card p-3">
      <Skeleton className="aspect-[16/10] h-auto rounded-[var(--radius-md)]" />
      <div className="space-y-3 px-3 pb-3 pt-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between border-t border-line-hair pt-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

function TeacherSkeleton() {
  return (
    <div className="card flex flex-col items-center p-3 pb-5 sm:p-5">
      <Skeleton className="aspect-[4/5] h-auto w-full max-w-[15rem] rounded-t-[999px]" />
      <Skeleton className="mt-5 h-5 w-3/4" />
      <Skeleton className="mt-2 h-3 w-1/2" />
    </div>
  );
}

export default function CatalogSkeleton({ variant, label }: { variant: 'courses' | 'teachers'; label: string }) {
  return (
    <div role="status" aria-label={label}>
      <Head />
      <>
        <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className={cn('card relative z-[1] -mt-6 p-4 sm:-mt-10 sm:p-6', variant === 'teachers' && 'mx-auto max-w-3xl')}>
            <Skeleton className="h-11 rounded-[var(--radius-md)]" />
            {variant === 'courses' && (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-line-hair pt-5">
                {[5, 7, 6, 8, 6].map((w, i) => (
                  <div key={i} aria-hidden="true" className="skeleton h-10 rounded-full" style={{ width: `${w}rem` }} />
                ))}
              </div>
            )}
          </div>
          <ul
            className={cn(
              'mt-10 grid sm:mt-12',
              variant === 'courses' ? 'gap-6 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4'
            )}
          >
            {Array.from({ length: variant === 'courses' ? 6 : 8 }, (_, i) => (
              <li key={i}>{variant === 'courses' ? <CourseSkeleton /> : <TeacherSkeleton />}</li>
            ))}
          </ul>
        </div>
      </>
    </div>
  );
}
