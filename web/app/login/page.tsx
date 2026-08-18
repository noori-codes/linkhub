"use client";

import type { FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { AuthShell } from "@/components/AuthShell";
import { FormAlert } from "@/components/FormAlert";
import { PasswordInput } from "@/components/PasswordInput";
import { beginAuthSession } from "@/lib/auth-session";
import { CLIENT_API_BASE, NETWORK_ERROR } from "@/lib/client-api";
import { normalizeEmailInput } from "@/lib/email";
import {
  onboardingFormClass,
  onboardingInputClass,
  onboardingPrimaryBtnClass,
  resumeOnboardingHref,
} from "@/lib/onboarding";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
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

      beginAuthSession(queryClient, data.token);
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
      setError(NETWORK_ERROR);
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
      <form onSubmit={onSubmit} className={onboardingFormClass}>
        {error ? (
          <FormAlert variant="error" title="Couldn’t log in">
            {error}
          </FormAlert>
        ) : null}

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

        <div className="flex flex-col gap-1.5 text-left text-sm">
          <label htmlFor="login-password" className="font-medium text-text">
            Password
          </label>
          <PasswordInput
            id="login-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <p className="text-right">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-text-muted hover:text-brand"
            >
              Forgot password?
            </Link>
          </p>
        </div>

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
