"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  OnboardingShell,
  OnboardingSkipFooter,
} from "@/components/onboarding/OnboardingShell";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import {
  onboardingCardClass,
  onboardingPrimaryBtnClass,
  setOnboardingStep,
} from "@/lib/onboarding";

export default function OnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    async function check() {
      const token = getToken();
      if (!token) return;
      try {
        const res = await fetch(`${CLIENT_API_BASE}/api/v1/profiles/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (res.ok) {
          router.replace("/onboarding/about");
        }
      } catch {
        /* stay on claim username */
      }
    }
    void check();
  }, [router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const res = await fetch(`${CLIENT_API_BASE}/api/v1/profiles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not create profile");
        return;
      }

      await setOnboardingStep(token, "profile");
      router.push("/onboarding/about");
    } catch {
      setError("Cannot reach API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingShell
      step="profile"
      title="Claim your username"
      description="This becomes your public URL. You can change display name and bio next."
      footer={
        <OnboardingSkipFooter
          label="I already have a username"
          onSkip={() => router.push("/onboarding/about")}
        />
      }
    >
      <form onSubmit={onSubmit} className={onboardingCardClass}>
        <label className="flex flex-col gap-1.5 text-left text-sm">
          <span className="font-medium text-text">Username</span>
          <div className="flex overflow-hidden rounded-xl border border-border focus-within:border-brand">
            <span className="flex items-center bg-bg px-3 text-sm text-text-muted">
              /u/
            </span>
            <input
              type="text"
              required
              minLength={3}
              maxLength={30}
              pattern="[a-z0-9._]+"
              title="Lowercase letters, numbers, dots, and underscores only"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="yourname"
              className="min-w-0 flex-1 border-0 bg-bg px-2 py-2.5 text-sm text-text outline-none"
            />
          </div>
          <span className="text-xs text-text-muted">
            Lowercase letters, numbers, dots, underscores
          </span>
        </label>

        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className={onboardingPrimaryBtnClass}
        >
          {loading ? "Saving…" : "Continue"}
        </button>
      </form>
    </OnboardingShell>
  );
}
