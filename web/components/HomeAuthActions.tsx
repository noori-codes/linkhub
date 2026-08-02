"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getToken } from "@/lib/auth";
import { LANDING_DEMO_USERNAME } from "@/lib/demo";

/** Primary hero action — respects login state (header has the rest). */
export default function HomeAuthActions() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(Boolean(getToken()));
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {loggedIn ? (
        <Link
          href="/profile"
          className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-brand-hover"
        >
          Open profile
        </Link>
      ) : (
        <Link
          href="/signup"
          className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-brand-hover"
        >
          Get your page
        </Link>
      )}
      <Link
        href={`/u/${LANDING_DEMO_USERNAME}`}
        className="rounded-md px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:text-brand"
      >
        See a live example →
      </Link>
    </div>
  );
}
