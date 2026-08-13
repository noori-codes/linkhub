"use client";

import { useState } from "react";
import { toast } from "sonner";

import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";

type Props = {
  email: string;
};

export function VerifyEmailBanner({ email }: Props) {
  const [sending, setSending] = useState(false);

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

      const data = (await res.json()) as { message?: string };

      if (!res.ok) {
        toast.error(data.message || "Could not resend verification email");
        return;
      }

      toast.success(data.message || "Verification email sent");
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

      <div className="mt-3">
        <button
          type="button"
          onClick={() => void onResend()}
          disabled={sending}
          className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text transition-colors hover:border-brand disabled:opacity-50"
        >
          {sending ? "Sending…" : "Resend verify email"}
        </button>
      </div>
    </div>
  );
}
