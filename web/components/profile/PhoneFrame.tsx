import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * Compact phone chrome for dashboard / landing previews.
 * Bezel stays dark; the screen itself stays light so loading / light themes look normal.
 */
export function PhoneFrame({ children, className = "" }: Props) {
  return (
    <div
      className={`relative mx-auto w-[min(100%,292px)] min-w-[260px] shrink-0 ${className}`}
    >
      <div className="relative aspect-[9/19.5] w-full rounded-[2.35rem] bg-[#1a1d24] p-[10px] shadow-[0_28px_56px_-18px_rgba(18,20,26,0.45)] ring-1 ring-black/25">
        <div
          aria-hidden
          className="absolute top-[17%] left-0 h-6 w-[3px] -translate-x-[1px] rounded-l-[2px] bg-[#2a2e36]"
        />
        <div
          aria-hidden
          className="absolute top-[25%] left-0 h-9 w-[3px] -translate-x-[1px] rounded-l-[2px] bg-[#2a2e36]"
        />
        <div
          aria-hidden
          className="absolute top-[34%] left-0 h-9 w-[3px] -translate-x-[1px] rounded-l-[2px] bg-[#2a2e36]"
        />
        <div
          aria-hidden
          className="absolute top-[27%] right-0 h-12 w-[3px] translate-x-[1px] rounded-r-[2px] bg-[#2a2e36]"
        />

        <div className="relative isolate h-full w-full overflow-hidden rounded-[1.85rem] bg-[#eef0f3]">
          <div
            aria-hidden
            className="pointer-events-none absolute top-[11px] left-1/2 z-30 flex h-[26px] w-[92px] -translate-x-1/2 items-center justify-center rounded-full bg-[#0b0c0f] shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
          >
            <span className="mr-5 h-[7px] w-[7px] rounded-full bg-[#1c2028] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]" />
          </div>

          <div className="absolute inset-0 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {children}
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute bottom-2 left-1/2 z-30 h-[3px] w-24 -translate-x-1/2 rounded-full bg-black/20"
          />
        </div>
      </div>
    </div>
  );
}
