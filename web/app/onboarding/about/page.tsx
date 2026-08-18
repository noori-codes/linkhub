"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  OnboardingShell,
  OnboardingSkipFooter,
} from "@/components/onboarding/OnboardingShell";
import { FormSkeleton } from "@/components/Skeleton";
import { CLIENT_API_BASE, NETWORK_ERROR } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import {
  onboardingFormClass,
  onboardingInputClass,
  onboardingPrimaryBtnClass,
  setOnboardingStep,
} from "@/lib/onboarding";
import type { ApiSuccess, PublicProfile } from "@/lib/types";

export default function OnboardingAboutPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    async function load() {
      try {
        const res = await fetch(`${CLIENT_API_BASE}/api/v1/profiles/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (res.status === 404) {
          router.replace("/onboarding");
          return;
        }

        if (!res.ok) {
          setError("Could not load your profile.");
          setReady(true);
          return;
        }

        const data = (await res.json()) as ApiSuccess<{
          profile: PublicProfile;
        }>;
        setDisplayName(data.data.profile.displayName || "");
        setBio(data.data.profile.bio || "");
        setReady(true);
      } catch {
        setError(NETWORK_ERROR);
        setReady(true);
      }
    }

    void load();
  }, [router]);

  async function goNext(token: string) {
    await setOnboardingStep(token, "socials");
    router.push("/onboarding/socials");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${CLIENT_API_BASE}/api/v1/profiles/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName: displayName.trim(),
          bio: bio.trim(),
        }),
      });

      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        setError(data.message || "Could not save profile");
        return;
      }

      await goNext(token);
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  }

  async function onSkip() {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    try {
      await goNext(token);
    } catch {
      router.push("/onboarding/socials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingShell
      step="about"
      title="Tell people who you are"
      description="A name and short bio visitors see at the top of your page."
      footer={
        <OnboardingSkipFooter
          onSkip={() => void onSkip()}
          disabled={loading}
        />
      }
    >
      {!ready ? (
        <FormSkeleton fields={2} bordered={false} />
      ) : (
        <form onSubmit={onSubmit} className={onboardingFormClass}>
          <label className="flex flex-col gap-1.5 text-left text-sm">
            <span className="font-medium text-text">Display name</span>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={60}
              placeholder="How you want to be known"
              className={onboardingInputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-left text-sm">
            <span className="font-medium text-text">Bio</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={280}
              placeholder="One short paragraph about you"
              className={`${onboardingInputClass} resize-y`}
            />
            <span className="text-xs text-text-muted">
              {bio.length}/280
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
            className={onboardingPrimaryBtnClass}
          >
            {loading ? "Saving…" : "Continue"}
          </button>
        </form>
      )}
    </OnboardingShell>
  );
}
