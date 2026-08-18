import { PhoneFrame } from "@/components/profile/PhoneFrame";

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

function SkeletonStack({
  rows,
  rowClassName,
  className = "",
  label,
}: {
  rows: number;
  rowClassName: string;
  className?: string;
  label: string;
}) {
  return (
    <div
      className={className}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className={rowClassName} />
      ))}
    </div>
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

export function ListSkeleton({
  rows = 4,
  className = "",
  rowClassName = "h-14 w-full rounded-xl",
}: {
  rows?: number;
  className?: string;
  rowClassName?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-2.5 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading"
    >
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className={rowClassName} />
      ))}
    </div>
  );
}

export function FormSkeleton({
  fields = 3,
  bordered = true,
}: {
  fields?: number;
  bordered?: boolean;
}) {
  const fieldsEl = (
    <div
      className="flex flex-col gap-5"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading form"
    >
      {Array.from({ length: fields }, (_, i) => (
        <Skeleton key={i} className="h-11 w-full rounded-xl" />
      ))}
    </div>
  );

  if (!bordered) return fieldsEl;

  return (
    <div
      className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5 sm:p-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading form"
    >
      <div>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-2 h-3 w-48" />
      </div>
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export function PhotosSkeleton() {
  return (
    <section
      className="overflow-hidden rounded-2xl border border-border bg-surface"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading photos"
    >
      <Skeleton className="h-36 w-full rounded-none sm:h-44" />
      <div className="flex items-end gap-4 px-5 pb-5">
        <Skeleton className="-mt-10 h-20 w-20 rounded-full border-4 border-surface sm:-mt-12 sm:h-24 sm:w-24" />
        <div className="mb-1 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-2 h-3 w-40" />
        </div>
      </div>
    </section>
  );
}

export function ThemeGridSkeleton() {
  return (
    <SkeletonStack
      rows={6}
      rowClassName="h-[5.75rem] w-full rounded-xl"
      className="grid grid-cols-2 gap-2.5 sm:grid-cols-3"
      label="Loading themes"
    />
  );
}

export function SettingsSkeleton() {
  return (
    <div
      className="flex min-h-[22rem] flex-col sm:min-h-[26rem] sm:flex-row"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading settings"
    >
      <div className="flex shrink-0 gap-1 border-b border-border p-3 sm:w-40 sm:flex-col sm:border-b-0 sm:border-r">
        <Skeleton className="h-9 w-24 rounded-lg sm:w-full" />
        <Skeleton className="h-9 w-24 rounded-lg sm:w-full" />
        <Skeleton className="h-9 w-20 rounded-lg sm:w-full" />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function ShopSkeleton() {
  return (
    <div
      className="flex flex-col gap-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading shop"
    >
      <section className="rounded-2xl border border-border bg-surface p-5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-2 h-3 w-52" />
        <ListSkeleton rows={2} className="mt-4" />
      </section>
      <Skeleton className="mt-2 h-4 w-24" />
      <Skeleton className="h-3 w-48" />
      <ListSkeleton rows={3} />
    </div>
  );
}

export function LinksSkeleton() {
  return (
    <div
      className="flex flex-col gap-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading links"
    >
      <Skeleton className="h-3 w-40" />
      <ListSkeleton rows={4} />
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  );
}

export function DashboardShellSkeleton() {
  return (
    <div
      className="flex h-full flex-col bg-bg"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="flex w-full shrink-0 flex-col border-b border-border bg-surface lg:h-full lg:w-[13.5rem] lg:border-b-0 lg:border-r xl:w-60">
          <div className="flex items-center gap-2.5 px-4 py-4 lg:px-3">
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex gap-1 overflow-x-auto px-2 pb-2 lg:flex-col lg:gap-1.5 lg:px-2.5">
            {Array.from({ length: 7 }, (_, i) => (
              <Skeleton key={i} className="h-9 w-20 shrink-0 rounded-lg lg:w-full" />
            ))}
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-bg-elevated lg:border-r lg:border-border">
          <header className="shrink-0 border-b border-border px-5 py-5 sm:px-8">
            <div className="mx-auto w-full max-w-xl">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="mt-2 h-4 w-64 max-w-full" />
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
            <div className="mx-auto w-full max-w-xl">
              <LinksSkeleton />
            </div>
          </div>
        </main>

        <aside className="hidden h-full min-w-0 shrink-0 flex-col overflow-hidden bg-[linear-gradient(165deg,#e6e9ef_0%,#f0f2f5_45%,#f3f4f6_100%)] lg:flex lg:w-[24rem] xl:w-[26rem]">
          <div className="px-5 py-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-1.5 h-3 w-32" />
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center px-5 pb-6">
            <PhoneFrame>
              <PreviewSkeleton />
            </PhoneFrame>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function LandingSkeleton() {
  return (
    <main
      className="flex min-h-[100svh] flex-1 flex-col bg-bg"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="flex h-14 items-center border-b border-border px-6">
        <Skeleton className="h-7 w-7 rounded-md" />
        <Skeleton className="ml-2.5 h-4 w-20" />
      </div>
      <section className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-14">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-5 h-12 w-full max-w-md sm:h-14" />
          <Skeleton className="mt-3 h-12 w-72 max-w-full" />
          <Skeleton className="mt-5 h-4 w-80 max-w-full" />
          <div className="mt-8 flex gap-3">
            <Skeleton className="h-11 w-32 rounded-xl" />
            <Skeleton className="h-11 w-28 rounded-xl" />
          </div>
        </div>
        <div className="hidden flex-col items-center justify-center border-l border-border bg-bg-elevated lg:flex">
          <Skeleton className="mb-4 h-3 w-28" />
          <PhoneFrame>
            <PreviewSkeleton />
          </PhoneFrame>
        </div>
      </section>
    </main>
  );
}
