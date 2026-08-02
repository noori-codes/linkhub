"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Props = {
  email: string;
};

function toSameOriginVerifyPath(verifyURL: string): string | null {
  try {
    // API returns http://127.0.0.1:3001/verify-email/<token>
    // Stay on THIS origin (localhost vs 127.0.0.1 are different localStorage!)
    const path = new URL(verifyURL).pathname;
    if (path.startsWith("/verify-email/")) return path;
  } catch {
    /* ignore bad URLs */
  }
  return null;
}

// Soft nudge — account still works; just reminds them to confirm email
export function VerifyEmailBanner({ email }: Props) {
  const [devPath, setDevPath] = useState("");

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("linkhub_verifyURL");
      if (!stored) return;
      const path = toSameOriginVerifyPath(stored);
      if (path) setDevPath(path);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div
      className="rounded-md border border-brand/40 bg-brand-muted px-4 py-3"
      role="status"
    >
      <p className="text-sm text-text">
        Confirm <span className="font-medium">{email}</span> when you can — check
        your inbox for the LinkHub verify link.
      </p>
      <p className="mt-1 text-xs text-text-muted">
        You can keep editing your page. Verification is soft, not a lockout.
      </p>
      {devPath ? (
        <p className="mt-2 text-xs">
          <Link href={devPath} className="text-brand hover:text-brand-hover">
            Dev: open verify link
          </Link>
        </p>
      ) : null}
    </div>
  );
}
