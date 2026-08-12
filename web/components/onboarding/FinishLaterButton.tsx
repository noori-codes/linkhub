"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { getToken } from "@/lib/auth";
import { skipToDashboard } from "@/lib/onboarding";

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
    <p className="mt-5 text-center text-sm text-text-muted">
      <button
        type="button"
        disabled={busy}
        onClick={() => void onClick()}
        className="font-medium text-brand hover:text-brand-hover disabled:opacity-60"
      >
        {busy ? "Opening dashboard…" : "Finish setup later"}
      </button>
    </p>
  );
}
