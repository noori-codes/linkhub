"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { clearToken, getToken } from "@/lib/auth";

/**
 * Top bar like a real product site — brand left, account actions right.
 * Avoids the “empty centered poster” feel of a logo-only first screen.
 */
export function SiteHeader() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(Boolean(getToken()));
  }, []);

  function logout() {
    clearToken();
    setLoggedIn(false);
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-5 sm:px-8">
      <Link href="/" className="flex items-center gap-2.5">
        <Image src="/logo.png" alt="" width={22} height={22} />
        <span className="font-display text-sm font-semibold tracking-wide text-text">
          LinkHub
        </span>
      </Link>

      <nav className="flex items-center gap-1 sm:gap-2" aria-label="Account">
        {loggedIn ? (
          <>
            <Link
              href="/profile"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-text transition-colors hover:text-brand"
            >
              Profile
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-md px-3 py-1.5 text-sm text-text-muted transition-colors hover:text-text"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-md px-3 py-1.5 text-sm text-text-muted transition-colors hover:text-text"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-brand px-3.5 py-1.5 text-sm font-medium text-text-inverse transition-colors hover:bg-brand-hover"
            >
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
