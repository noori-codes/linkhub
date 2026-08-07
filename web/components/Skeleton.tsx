type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-lg bg-[#dde1e8]/70 ${className}`}
    />
  );
}

export function PreviewSkeleton() {
  return (
    <div
      className="flex h-full w-full flex-col items-center px-5 pt-14"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading preview"
    >
      <Skeleton className="h-20 w-20 rounded-full" />
      <Skeleton className="mt-4 h-4 w-28" />
      <Skeleton className="mt-2 h-3 w-40" />
      <div className="mt-8 flex w-full flex-col gap-2.5">
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div
      className="flex flex-col gap-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading analytics"
    >
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-2 h-3 w-48" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Skeleton className="h-18 w-full rounded-xl" />
          <Skeleton className="h-18 w-full rounded-xl" />
          <Skeleton className="h-18 w-full rounded-xl" />
          <Skeleton className="col-span-2 h-18 w-full rounded-xl sm:col-span-3" />
        </div>
      </section>
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-2 h-3 w-40" />
        <div className="mt-4 flex flex-col gap-2">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </section>
    </div>
  );
}
