import Image from "next/image";

type Size = "sm" | "md";

type Props = {
  label?: string;
  size?: Size;
  className?: string;
};

const sizeMap: Record<Size, { mark: number; ring: string }> = {
  sm: { mark: 20, ring: "h-7 w-7" },
  md: { mark: 28, ring: "h-10 w-10" },
};

/** Branded ink-mark loader for data waits. Prefer over plain “Loading…” text. */
export function Loader({ label, size = "md", className = "" }: Props) {
  const { mark, ring } = sizeMap[size];

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className={`relative inline-flex ${ring} items-center justify-center`}>
        <span
          aria-hidden
          className="absolute inset-0 animate-pulse rounded-xl bg-brand-muted"
        />
        <Image
          src="/linkhub-mark.png"
          alt=""
          width={mark}
          height={mark}
          unoptimized
          className="relative animate-pulse rounded-md"
        />
      </span>
      {label ? (
        <p className="text-sm text-text-muted">{label}</p>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </div>
  );
}
