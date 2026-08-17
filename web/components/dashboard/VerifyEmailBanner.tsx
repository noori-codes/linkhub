"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";

type Props = {
  email: string;
  variant?: "top" | "card";
};

const VERIFY_URL_KEY = "linkhub_verifyURL";
const isDev = process.env.NODE_ENV === "development";

function MailIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="size-4"
      aria-hidden
    >
      <rect
        x="2.5"
        y="4.5"
        width="15"
        height="11"
        rx="1.75"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M3.5 6.5 10 11l6.5-4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function toSameOriginVerifyPath(verifyURL: string): string | null {
  try {
    const path = new URL(verifyURL).pathname;
    if (path.startsWith("/verify-email/")) return path;
  } catch {
    /* ignore bad URLs */
  }
  return null;
}

function storeDevVerifyURL(verifyURL: string) {
  if (!isDev) return;
  try {
    sessionStorage.setItem(VERIFY_URL_KEY, verifyURL);
  } catch {
    /* ignore */
  }
}

export function VerifyEmailBanner({ email, variant = "card" }: Props) {
  const [sending, setSending] = useState(false);
  const [devPath, setDevPath] = useState("");

  useEffect(() => {
    if (!isDev) return;
    try {
      const stored = sessionStorage.getItem(VERIFY_URL_KEY);
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
        storeDevVerifyURL(data.verifyURL);
        const path = toSameOriginVerifyPath(data.verifyURL);
        if (path) setDevPath(path);
      }
    } catch {
      toast.error("Cannot reach API. Is the backend running?");
    } finally {
      setSending(false);
    }
  }

  const devLink =
    isDev && devPath ? (
      <Link
        href={devPath}
        className="shrink-0 text-xs font-medium text-text-muted transition-colors hover:text-text"
      >
        Dev verify
      </Link>
    ) : null;

  if (variant === "top") {
    return (
      <div
        className="shrink-0 border-b border-border bg-surface px-4 py-2.5 sm:px-5"
        role="alert"
      >
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-muted text-text">
            <MailIcon />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold leading-tight text-text">
              Verify your email
            </p>
            <p className="mt-0.5 truncate text-xs leading-tight text-text-muted">
              Required to publish ·{" "}
              <span className="font-medium text-text">{email}</span>
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            {devLink}
            <button
              type="button"
              onClick={() => void onResend()}
              disabled={sending}
              className="rounded-lg border border-border bg-bg px-3 py-1.5 text-xs font-semibold text-text transition-colors hover:border-brand/35 hover:bg-bg-elevated disabled:opacity-50"
            >
              {sending ? "Sending…" : "Resend"}
            </button>
          </div>
        </div>
      </div>
    );
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
        {devLink}
      </div>
    </div>
  );
}
