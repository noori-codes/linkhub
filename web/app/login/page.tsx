"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { AuthShell } from "@/components/AuthShell";
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

      saveToken(data.token);
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
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5"
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
    </AuthShell>
  );
}
