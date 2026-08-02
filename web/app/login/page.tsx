"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { saveToken } from "@/lib/auth";
import { CLIENT_API_BASE } from "@/lib/client-api";

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
      // Call Express login — same endpoint Bruno uses
      const res = await fetch(`${CLIENT_API_BASE}/api/v1/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Store JWT so later pages can send Authorization: Bearer ...
      saveToken(data.token);

      // After login, go to the read-only dashboard
      router.push("/profile");
    } catch {
      setError("Cannot reach API. Is `cd api && yarn dev` running?");
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
            Log in
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Welcome back — use the email and password you signed up with.
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

          <label className="flex flex-col gap-1.5 text-left text-sm">
            <span className="text-text-muted">Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
            />
          </label>

          <p className="-mt-2 text-right text-sm">
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
            className="mt-1 rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-text-inverse hover:bg-brand-hover disabled:opacity-60"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          No account?{" "}
          <Link href="/signup" className="text-brand hover:text-brand-hover">
            Sign up
          </Link>
          {" · "}
          <Link href="/" className="text-brand hover:text-brand-hover">
            Back home
          </Link>
        </p>
      </div>
    </main>
  );
}
