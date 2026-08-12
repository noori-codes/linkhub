"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  OnboardingShell,
  OnboardingSkipFooter,
} from "@/components/onboarding/OnboardingShell";
import { PlatformPicker } from "@/components/onboarding/PlatformPicker";
import { Loader } from "@/components/Loader";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import {
  readSelectedPlatforms,
  writeSelectedPlatforms,
} from "@/lib/link-platforms";
import {
  onboardingFormClass,
  onboardingPrimaryBtnClass,
  setOnboardingStep,
} from "@/lib/onboarding";

export default function OnboardingSocialsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    async function ensureProfile() {
      try {
        const res = await fetch(`${CLIENT_API_BASE}/api/v1/profiles/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (res.status === 404) {
          router.replace("/onboarding");
          return;
        }
        setSelected(readSelectedPlatforms());
        setReady(true);
      } catch {
        setError("Cannot reach API. Is the backend running?");
        setReady(true);
      }
    }

    void ensureProfile();
  }, [router]);

  async function goNext(token: string, platforms: string[]) {
    writeSelectedPlatforms(platforms);
    await setOnboardingStep(token, "links");
    router.push("/onboarding/links");
  }

  async function onContinue() {
    if (loading) return;

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    if (selected.length === 0) {
      setError("Pick at least one platform, or skip for now.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await goNext(token, selected);
    } catch {
      setError("Cannot reach API. Is the backend running?");
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
      await goNext(token, []);
    } catch {
      router.push("/onboarding/links");
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingShell
      step="socials"
      wide
      title="Choose your platforms"
      description="Tap the apps you use. On the next step you'll paste your profile links."
      footer={
        <OnboardingSkipFooter
          onSkip={() => void onSkip()}
          disabled={loading}
        />
      }
    >
      {!ready ? (
        <Loader label="Loading…" className="py-12" />
      ) : (
        <div className={onboardingFormClass}>
          <PlatformPicker
            selected={selected}
            onChange={setSelected}
            disabled={loading}
          />

          {selected.length > 0 ? (
            <p className="text-center text-xs text-text-muted">
              {selected.length} selected
            </p>
          ) : null}

          {error ? (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            disabled={loading}
            onClick={() => void onContinue()}
            className={onboardingPrimaryBtnClass}
          >
            {loading ? "Saving…" : "Continue"}
          </button>
        </div>
      )}
    </OnboardingShell>
  );
}
