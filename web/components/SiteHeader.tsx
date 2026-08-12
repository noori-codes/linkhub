"use client";

import Image from "next/image";
import Link from "next/link";

import { useClientAuth } from "@/lib/useClientAuth";
import { uiBtnGhost, uiBtnPrimary } from "@/lib/ui";

export function SiteHeader() {
  const { ready, loggedIn, logout } = useClientAuth();

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
        {!ready ? (
          <>
            <div
              className="h-8 w-14 animate-pulse rounded-lg bg-border/70"
              aria-hidden
            />
            <div
              className="h-8 w-[4.5rem] animate-pulse rounded-lg bg-border/70"
              aria-hidden
            />
          </>
        ) : loggedIn ? (
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
