"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getToken } from "@/lib/auth";

/** Primary hero CTA — header already has Log in / Sign up. */
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
