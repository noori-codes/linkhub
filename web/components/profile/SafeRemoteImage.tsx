"use client";

import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
};

/** Hides broken remote URLs instead of showing a torn image icon. */
export function SafeRemoteImage({ src, alt, className, fallback = null }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return fallback;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
