"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { getToken } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3000";

// Fallback if signup created a User but Profile creation failed
export default function OnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
    }
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
      const res = await fetch(`${API_BASE}/api/v1/profiles`, {
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
            Claim your username
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            One more step — this becomes your public page URL.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4 rounded-md border border-border bg-surface p-5"
        >
          <label className="flex flex-col gap-1.5 text-left text-sm">
            <span className="text-text-muted">Username</span>
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
              className="rounded-md border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
            />
            <span className="text-xs text-text-muted">
              /u/{username || "…"}
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
            className="mt-1 rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-text-inverse hover:bg-brand-hover disabled:opacity-60"
          >
            {loading ? "Saving…" : "Continue"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          <Link href="/profile" className="text-brand hover:text-brand-hover">
            Skip to dashboard
          </Link>
        </p>
      </div>
    </main>
  );
}
