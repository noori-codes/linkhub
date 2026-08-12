"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";

import { AuthShell } from "@/components/AuthShell";
import { FormAlert } from "@/components/FormAlert";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { normalizeEmailInput } from "@/lib/email";
import {
  onboardingFormClass,
  onboardingInputClass,
  onboardingPrimaryBtnClass,
} from "@/lib/onboarding";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetURL, setResetURL] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setResetURL("");
    setLoading(true);

    try {
      const res = await fetch(`${CLIENT_API_BASE}/api/v1/users/forgotPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizeEmailInput(email) }),
      });

      const data = (await res.json()) as {
        message?: string;
        resetURL?: string;
      };

      if (!res.ok) {
        setError(data.message || "Could not start password reset");
        return;
      }

      setMessage(data.message || "Check your email for a reset link.");
      if (data.resetURL) {
        setResetURL(data.resetURL);
      }
    } catch {
      setError("Cannot reach API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Forgot password"
      description="Enter your email and we’ll send a reset link (valid 10 minutes)."
      footer={
        <p className="text-center text-sm text-text-muted">
          <Link href="/login" className="text-brand hover:text-brand-hover">
            Back to log in
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className={onboardingFormClass}>
        {error ? (
          <FormAlert variant="error" title="Couldn’t send reset link">
            {error}
          </FormAlert>
        ) : null}

        {message ? (
          <FormAlert variant="success" title="Check your email">
            {message}
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

        {resetURL ? (
          <p className="text-sm text-text-muted">
            Dev link:{" "}
            <a
              href={resetURL}
              className="break-all text-brand hover:text-brand-hover"
            >
              {resetURL}
            </a>
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className={onboardingPrimaryBtnClass}
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </AuthShell>
  );
}
