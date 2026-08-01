"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { CLIENT_API_BASE } from "@/lib/client-api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  // Dev helper: API may return a clickable resetURL when email isn't set up
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
        body: JSON.stringify({ email: email.trim() }),
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
    <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--brand-muted),transparent_55%)]"
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src="/logo.png" alt="LinkHub" width={48} height={48} />
          <h1 className="mt-4 font-display text-3xl font-semibold text-text">
            Forgot password
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Enter your email and we&apos;ll send a reset link (valid 10 minutes).
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4 rounded-md border border-border bg-surface p-5"
        >
          <label className="flex flex-col gap-1.5 text-left text-sm">
            <span className="text-text-muted">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
            />
          </label>

          {error ? (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}

          {message ? (
            <p className="text-sm text-[var(--success)]" role="status">
              {message}
            </p>
          ) : null}

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
            className="mt-1 rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-text-inverse hover:bg-brand-hover disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          <Link href="/login" className="text-brand hover:text-brand-hover">
            Back to log in
          </Link>
        </p>
      </div>
    </main>
  );
}
