"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { CLIENT_API_BASE } from "@/lib/client-api";
import { saveToken } from "@/lib/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  // Token comes from the URL: /reset-password/<token from email or forgot-password>
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

      // API logs you in after reset — same JWT flow as login/signup
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
    <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--brand-muted),transparent_55%)]"
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src="/logo.png" alt="LinkHub" width={48} height={48} />
          <h1 className="mt-4 font-display text-3xl font-semibold text-text">
            New password
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Choose a new password for your LinkHub account.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4 rounded-xl lh-panel p-5"
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

        <p className="mt-6 text-center text-sm text-text-muted">
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
      </div>
    </main>
  );
}
