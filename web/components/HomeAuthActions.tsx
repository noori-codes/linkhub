"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { clearToken, getToken } from "@/lib/auth";

// Small client island: localStorage only exists in the browser
export default function HomeAuthActions() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // Runs after mount — safe to read localStorage
    setLoggedIn(Boolean(getToken()));
  }, []);

  function logout() {
    clearToken();
    setLoggedIn(false);
  }

  return (
    <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
      {loggedIn ? (
        <>
          <p className="text-sm text-brand">You’re logged in</p>
          <button
            type="button"
            onClick={logout}
            className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-text transition-colors hover:border-brand"
          >
            Log out
          </button>
        </>
      ) : (
        <Link
          href="/login"
          className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-text-inverse transition-colors hover:bg-brand-hover"
        >
          Log in
        </Link>
      )}

      <Link
        href="/u/noori"
        className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-text transition-colors hover:border-brand"
      >
        View demo profile
      </Link>
    </div>
  );
}
