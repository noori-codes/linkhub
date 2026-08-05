"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { getToken } from "@/lib/auth";
import { skipToDashboard } from "@/lib/onboarding";

/** Completes onboarding with defaults and opens the Links dashboard. */
export function FinishLaterButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setBusy(true);
    try {
      await skipToDashboard(token);
      router.push("/profile/links");
    } catch {
      router.push("/profile/links");
    } finally {
      setBusy(false);
    }
  }

  return (
    <p className="mt-8 text-center text-xs text-text-muted">
      Want to finish later?{" "}
      <button
        type="button"
        disabled={busy}
        onClick={() => void onClick()}
        className="font-medium text-brand hover:text-brand-hover disabled:opacity-60"
      >
        {busy ? "Opening…" : "Skip to dashboard"}
      </button>
    </p>
  );
}
