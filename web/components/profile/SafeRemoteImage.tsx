"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { Skeleton } from "@/components/Skeleton";
import { imageObjectKey } from "@/lib/image-url";

type Props = {
  src: string;
  alt: string;
  className?: string;
  fallback?: ReactNode;
  loading?: "eager" | "lazy";
};

export function SafeRemoteImage({
  src,
  alt,
  className = "",
  fallback = null,
  loading = "lazy",
}: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const objectKeyRef = useRef("");
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const objectKey = imageObjectKey(src);

  useLayoutEffect(() => {
    if (objectKeyRef.current !== objectKey) {
      objectKeyRef.current = objectKey;
      setLoaded(false);
      setFailed(false);
    }

    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src, objectKey]);

  if (failed) {
    return fallback;
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {!loaded ? (
        <Skeleton aria-hidden className="absolute inset-0 rounded-none" />
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
