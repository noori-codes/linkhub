"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { Skeleton } from "@/components/Skeleton";

type Props = {
  src: string;
  alt: string;
  className?: string;
  fallback?: ReactNode;
  loading?: "eager" | "lazy";
};

function SafeRemoteImageInner({
  src,
  alt,
  className = "",
  fallback = null,
  loading = "lazy",
}: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // Cached images may finish before onLoad is attached.
  useLayoutEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  if (failed) {
    return fallback;
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {!loaded ? (
        <Skeleton
          aria-hidden
          className="absolute inset-0 rounded-none"
        />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`${className} transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

export function SafeRemoteImage(props: Props) {
  // Remount when src changes so loading state resets without an effect.
  return <SafeRemoteImageInner key={props.src} {...props} />;
}
