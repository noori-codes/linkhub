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
import { getToken } from "@/lib/auth";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { normalizeEmailInput } from "@/lib/email";
import {
  onboardingFormClass,
  onboardingInputClass,
  onboardingPrimaryBtnClass,
  setOnboardingStep,
} from "@/lib/onboarding";

export default function SignupPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  async function createProfile(token: string) {
    const profileRes = await fetch(`${CLIENT_API_BASE}/api/v1/profiles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: username.trim().toLowerCase(),
        displayName: `${firstName.trim()} ${lastName.trim()}`.trim(),
      }),
    });

    const profileData = await profileRes.json();

    if (!profileRes.ok) {
      setError(profileData.message || "Could not claim that username");
      return false;
    }

    return true;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      let token = getToken();

      if (!accountCreated) {
        const signupRes = await fetch(`${CLIENT_API_BASE}/api/v1/users/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: normalizeEmailInput(email),
            password,
            passwordConfirm,
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

        beginAuthSession(queryClient, signupData.token);
        token = signupData.token;
        setAccountCreated(true);
      }

      const ok = await createProfile(token!);
      if (!ok) return;

      await setOnboardingStep(token!, "profile");
      router.push("/onboarding/about");
    } catch {
      setError("Cannot reach API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Sign up"
      description="Create an account and claim your public username — then finish a short setup wizard."
      footer={
        <p className="text-center text-sm text-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-brand hover:text-brand-hover">
            Log in
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className={onboardingFormClass}>
        {error ? (
          <FormAlert variant="error" title="Something went wrong">
            {error}
          </FormAlert>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-left text-sm">
            <span className="font-medium text-text">First name</span>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={accountCreated}
              className={`${onboardingInputClass} disabled:opacity-60`}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-left text-sm">
            <span className="font-medium text-text">Last name</span>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={accountCreated}
              className={`${onboardingInputClass} disabled:opacity-60`}
            />
          </label>
        </div>

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
            disabled={accountCreated}
            className={`${onboardingInputClass} disabled:opacity-60`}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-left text-sm">
          <span className="font-medium text-text">Username</span>
          <div className="flex overflow-hidden rounded-xl border border-border focus-within:border-brand">
            <span className="flex items-center bg-bg px-3 text-sm text-text-muted">
              /u/
            </span>
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
              className="min-w-0 flex-1 border-0 bg-bg px-2 py-2.5 text-sm text-text outline-none"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5 text-left text-sm">
          <span className="font-medium text-text">Password</span>
          <PasswordInput
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={accountCreated}
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
            disabled={accountCreated}
            autoComplete="new-password"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className={onboardingPrimaryBtnClass}
        >
          {loading
            ? "Creating account…"
            : accountCreated
              ? "Try username again"
              : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
