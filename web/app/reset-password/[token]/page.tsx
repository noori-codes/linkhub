"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { AuthShell } from "@/components/AuthShell";
import { FormAlert } from "@/components/FormAlert";
import { PasswordInput } from "@/components/PasswordInput";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { saveToken } from "@/lib/auth";
import {
  onboardingFormClass,
  onboardingPrimaryBtnClass,
} from "@/lib/onboarding";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError("Missing reset token. Request a new link.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${CLIENT_API_BASE}/api/v1/users/resetPassword/${encodeURIComponent(token)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, passwordConfirm }),
        },
      );

      const data = (await res.json()) as {
        token?: string;
        message?: string;
      };

      if (!res.ok) {
        setError(data.message || "Could not reset password");
        return;
      }

      if (data.token) {
        saveToken(data.token);
      }

      router.push("/profile");
    } catch {
      setError("Cannot reach API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="New password"
      description="Choose a new password for your LinkHub account."
      footer={
        <p className="text-center text-sm text-text-muted">
          <Link
            href="/forgot-password"
            className="text-brand hover:text-brand-hover"
          >
            Request a new link
          </Link>
          {" · "}
          <Link href="/login" className="text-brand hover:text-brand-hover">
            Log in
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className={onboardingFormClass}>
        {error ? (
          <FormAlert variant="error" title="Couldn’t update password">
            {error}
          </FormAlert>
        ) : null}

        <label className="flex flex-col gap-1.5 text-left text-sm">
          <span className="font-medium text-text">New password</span>
          <PasswordInput
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-left text-sm">
          <span className="font-medium text-text">Confirm password</span>
          <PasswordInput
            required
            minLength={8}
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className={onboardingPrimaryBtnClass}
        >
          {loading ? "Saving…" : "Update password"}
        </button>
      </form>
    </AuthShell>
  );
}
