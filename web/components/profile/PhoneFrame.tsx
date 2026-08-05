import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * Standard-width iPhone frame (9:19.5). Content should fill the screen.
 * Uses a fixed px width so the frame keeps size in shrink-to-fit flex parents
 * (e.g. landing hero) — percentage-only width collapses when children are absolute.
 */
export function PhoneFrame({ children, className = "" }: Props) {
  return (
    <div
      className={`relative mx-auto w-[min(100%,292px)] min-w-[260px] shrink-0 ${className}`}
    >
      <div className="relative aspect-[9/19.5] w-full rounded-[2.5rem] bg-[#111318] p-[11px] shadow-[0_24px_48px_-12px_rgba(18,20,26,0.4)]">
        <div
          aria-hidden
          className="absolute top-[18%] -left-[2px] h-7 w-[2px] rounded-l-sm bg-[#2c3038]"
        />
        <div
          aria-hidden
          className="absolute top-[26%] -left-[2px] h-10 w-[2px] rounded-l-sm bg-[#2c3038]"
        />
        <div
          aria-hidden
          className="absolute top-[36%] -left-[2px] h-10 w-[2px] rounded-l-sm bg-[#2c3038]"
        />
        <div
          aria-hidden
          className="absolute top-[28%] -right-[2px] h-14 w-[2px] rounded-r-sm bg-[#2c3038]"
        />

        <div className="relative h-full w-full overflow-hidden rounded-[1.95rem] bg-[#eef0f3]">
          <div
            aria-hidden
            className="pointer-events-none absolute top-2.5 left-1/2 z-30 h-[22px] w-[88px] -translate-x-1/2 rounded-full bg-black"
          />

          <div className="absolute inset-0 overflow-y-auto overscroll-contain">
            {children}
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute bottom-1.5 left-1/2 z-30 h-[4px] w-[110px] -translate-x-1/2 rounded-full bg-black/20"
          />
        </div>
      </div>
    </div>
  );
}
