"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { getToken, saveToken } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3000";

export default function SignupPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  // Username is for the Profile (public /u/...), not the User account
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // After User is created, retries only create the Profile (skip signup again)
  const [accountCreated, setAccountCreated] = useState(false);

  async function createProfile(token: string) {
    const profileRes = await fetch(`${API_BASE}/api/v1/profiles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: username.trim().toLowerCase(),
      }),
    });

    const profileData = (await profileRes.json()) as { message?: string };

    if (!profileRes.ok) {
      // Stay here and show a clear message (e.g. username taken)
      setError(profileData.message || "Could not create profile");
      return false;
    }

    return true;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      let token = getToken();

      // Step 1: create User only if we haven't already this session
      if (!accountCreated || !token) {
        const signupRes = await fetch(`${API_BASE}/api/v1/users/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            password,
          }),
        });

        const signupData = (await signupRes.json()) as {
          token?: string;
          message?: string;
        };

        if (!signupRes.ok) {
          setError(signupData.message || "Signup failed");
          return;
        }

        if (!signupData.token) {
          setError("Signup succeeded but no token was returned.");
          return;
        }

        saveToken(signupData.token);
        token = signupData.token;
        setAccountCreated(true);
      }

      // Step 2: create Profile — may fail if username is taken
      const ok = await createProfile(token!);
      if (!ok) return;

      router.push("/dashboard");
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
            Sign up
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Create an account and claim your public username.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4 rounded-md border border-border bg-surface p-5"
        >
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-left text-sm">
              <span className="text-text-muted">First name</span>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={accountCreated}
                className="rounded-md border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand disabled:opacity-60"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-left text-sm">
              <span className="text-text-muted">Last name</span>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={accountCreated}
                className="rounded-md border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand disabled:opacity-60"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-left text-sm">
            <span className="text-text-muted">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={accountCreated}
              className="rounded-md border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand disabled:opacity-60"
            />
          </label>

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
              Your page will be /u/{username || "…"}
            </span>
          </label>

          <label className="flex flex-col gap-1.5 text-left text-sm">
            <span className="text-text-muted">Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={accountCreated}
              className="rounded-md border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand disabled:opacity-60"
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
              disabled={accountCreated}
              className="rounded-md border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand disabled:opacity-60"
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
            {loading
              ? "Creating account…"
              : accountCreated
                ? "Try username again"
                : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-brand hover:text-brand-hover">
            Log in
          </Link>
          {" · "}
          <Link href="/" className="text-brand hover:text-brand-hover">
            Home
          </Link>
        </p>
      </div>
    </main>
  );
}
