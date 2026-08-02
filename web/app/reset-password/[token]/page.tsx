"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { AuthShell } from "@/components/AuthShell";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { saveToken } from "@/lib/auth";

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
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5"
      >
        <label className="flex flex-col gap-1.5 text-left text-sm">
          <span className="text-text-muted">New password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-left text-sm">
          <span className="text-text-muted">Confirm password</span>
          <input
            type="password"
            required
            minLength={8}
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="rounded-md border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
          />
        </label>

        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-text-inverse hover:bg-brand-hover disabled:opacity-60"
        >
          {loading ? "Saving…" : "Update password"}
        </button>
      </form>
    </AuthShell>
  );
}
