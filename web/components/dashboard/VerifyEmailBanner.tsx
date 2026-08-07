"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";

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
export function VerifyEmailBanner({ email }: Props) {
  const [devPath, setDevPath] = useState("");
  const [sending, setSending] = useState(false);

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

  async function onResend() {
    if (sending) return;

    const token = getToken();
    if (!token) {
      toast.error("Please log in again.");
      return;
    }

    setSending(true);

    try {
      const res = await fetch(
        `${CLIENT_API_BASE}/api/v1/users/resendVerifyEmail`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = (await res.json()) as {
        message?: string;
        verifyURL?: string;
      };

      if (!res.ok) {
        toast.error(data.message || "Could not resend verification email");
        return;
      }

      toast.success(data.message || "Verification email sent");

      if (data.verifyURL) {
        try {
          sessionStorage.setItem("linkhub_verifyURL", data.verifyURL);
          const path = toSameOriginVerifyPath(data.verifyURL);
          if (path) setDevPath(path);
        } catch {
          /* ignore */
        }
      }
    } catch {
      toast.error("Cannot reach API. Is the backend running?");
    } finally {
      setSending(false);
    }
  }

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
        You can keep editing in draft. Publishing requires a confirmed email.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void onResend()}
          disabled={sending}
          className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text transition-colors hover:border-brand disabled:opacity-50"
        >
          {sending ? "Sending…" : "Resend verify email"}
        </button>
        {devPath ? (
          <Link
            href={devPath}
            className="text-xs text-brand hover:text-brand-hover"
          >
            Dev: open verify link
          </Link>
        ) : null}
      </div>
    </div>
  );
}
