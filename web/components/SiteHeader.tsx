"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { clearToken, getToken } from "@/lib/auth";
import { uiBtnGhost, uiBtnPrimary } from "@/lib/ui";

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
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface/80 px-5 backdrop-blur-sm sm:px-8">
      <Link href="/" className="flex items-center gap-2.5">
        <Image
          src="/linkhub-mark.png"
          alt=""
          width={22}
          height={22}
          unoptimized
        />
        <span className="font-display text-sm font-semibold tracking-tight text-text">
          LinkHub
        </span>
      </Link>

      <nav className="flex items-center gap-1 sm:gap-1.5" aria-label="Account">
        {loggedIn ? (
          <>
            <Link
              href="/profile"
              className={`${uiBtnGhost} text-text hover:bg-bg`}
            >
              Profile
            </Link>
            <button type="button" onClick={logout} className={uiBtnGhost}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className={uiBtnGhost}>
              Log in
            </Link>
            <Link
              href="/signup"
              className={`${uiBtnPrimary} px-3.5 py-1.5 text-sm font-medium`}
            >
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
