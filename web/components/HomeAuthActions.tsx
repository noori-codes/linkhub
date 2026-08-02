"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { clearToken, getToken } from "@/lib/auth";

// Hero CTA island — localStorage only exists in the browser
export default function HomeAuthActions() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(Boolean(getToken()));
  }, []);

  function logout() {
    clearToken();
    setLoggedIn(false);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {loggedIn ? (
          <>
            <Link
              href="/profile"
              className="rounded-lg bg-brand px-7 py-3.5 text-sm font-semibold tracking-wide text-text-inverse shadow-[0_8px_24px_-8px_var(--brand)] transition-colors hover:bg-brand-hover"
            >
              Open profile
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-border px-7 py-3.5 text-sm font-medium text-text transition-colors hover:border-brand"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/signup"
              className="rounded-lg bg-brand px-7 py-3.5 text-sm font-semibold tracking-wide text-text-inverse shadow-[0_8px_24px_-8px_var(--brand)] transition-colors hover:bg-brand-hover"
            >
              Get your page
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-border px-7 py-3.5 text-sm font-medium text-text transition-colors hover:border-brand"
            >
              Log in
            </Link>
          </>
        )}
      </div>

      <Link
        href="/u/noori"
        className="text-sm text-text-muted underline-offset-4 transition-colors hover:text-brand hover:underline"
      >
        See a live profile
      </Link>
    </div>
  );
}
