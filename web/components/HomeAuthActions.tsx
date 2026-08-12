"use client";

import Link from "next/link";

import { useClientAuth } from "@/lib/useClientAuth";

export default function HomeAuthActions() {
  const { ready, loggedIn } = useClientAuth();

  if (!ready) {
    return (
      <div
        className="h-11 w-32 animate-pulse rounded-md bg-border/70"
        aria-hidden
      />
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {loggedIn ? (
        <Link
          href="/profile"
          className="rounded-md bg-brand px-6 py-3 text-sm font-semibold text-text-inverse transition-colors hover:bg-brand-hover"
        >
          Open profile
        </Link>
      ) : (
        <Link
          href="/signup"
          className="rounded-md bg-brand px-6 py-3 text-sm font-semibold text-text-inverse transition-colors hover:bg-brand-hover"
        >
          Get your page
        </Link>
      )}
    </div>
  );
}
