"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { AuthShell } from "@/components/AuthShell";
import { PasswordInput } from "@/components/PasswordInput";
import { saveToken } from "@/lib/auth";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { normalizeEmailInput } from "@/lib/email";
import {
  onboardingCardClass,
  onboardingInputClass,
  onboardingPrimaryBtnClass,
  resumeOnboardingHref,
} from "@/lib/onboarding";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${CLIENT_API_BASE}/api/v1/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizeEmailInput(email), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      saveToken(data.token);
      try {
        const meRes = await fetch(`${CLIENT_API_BASE}/api/v1/users/me`, {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        if (meRes.ok) {
          const meJson = await meRes.json();
          const user = meJson.data?.user as
            | {
                onboardingCompleted?: boolean;
                onboardingStep?: string;
              }
            | undefined;

          if (user && !user.onboardingCompleted) {
            const profileRes = await fetch(
              `${CLIENT_API_BASE}/api/v1/profiles/me`,
              { headers: { Authorization: `Bearer ${data.token}` } },
            );
            router.push(
              resumeOnboardingHref(
                user.onboardingStep,
                profileRes.status !== 404,
              ),
            );
            return;
          }
        }
      } catch {
        /* fall through to dashboard */
      }

      router.push("/profile");
    } catch {
      setError("Cannot reach API. Is `cd api && yarn dev` running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Log in"
      description="Welcome back — use the email and password you signed up with."
      footer={
        <p className="text-center text-sm text-text-muted">
          No account?{" "}
          <Link href="/signup" className="text-brand hover:text-brand-hover">
            Sign up
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className={onboardingCardClass}>
        <label className="flex flex-col gap-1.5 text-left text-sm">
          <span className="font-medium text-text">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(normalizeEmailInput(e.target.value))}
            className={onboardingInputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-left text-sm">
          <span className="font-medium text-text">Password</span>
          <PasswordInput
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        <p className="-mt-1 text-right text-sm">
          <Link
            href="/forgot-password"
            className="text-text-muted hover:text-brand"
          >
            Forgot password?
          </Link>
        </p>

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
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthShell>
  );
}
