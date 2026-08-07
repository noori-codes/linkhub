"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  OnboardingShell,
  OnboardingSkipFooter,
} from "@/components/onboarding/OnboardingShell";
import { Loader } from "@/components/Loader";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import {
  onboardingCardClass,
  onboardingInputClass,
  onboardingPrimaryBtnClass,
  setOnboardingStep,
} from "@/lib/onboarding";

type SocialField = {
  platform: string;
  label: string;
  placeholder: string;
  title: string;
};

const SOCIALS: SocialField[] = [
  {
    platform: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/you",
    title: "Instagram",
  },
  {
    platform: "x",
    label: "X / Twitter",
    placeholder: "https://x.com/you",
    title: "X",
  },
  {
    platform: "github",
    label: "GitHub",
    placeholder: "https://github.com/you",
    title: "GitHub",
  },
  {
    platform: "linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/you",
    title: "LinkedIn",
  },
  {
    platform: "website",
    label: "Website",
    placeholder: "https://yoursite.com",
    title: "Website",
  },
];

export default function OnboardingSocialsPage() {
  const router = useRouter();
  const [urls, setUrls] = useState<Record<string, string>>(() =>
    Object.fromEntries(SOCIALS.map((s) => [s.platform, ""])),
  );
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
        setReady(true);
      } catch {
        setError("Cannot reach API. Is the backend running?");
        setReady(true);
      }
    }

    void ensureProfile();
  }, [router]);

  async function goNext(token: string) {
    await setOnboardingStep(token, "theme");
    router.push("/onboarding/theme");
  }

  async function createSocialLinks(token: string) {
    for (const social of SOCIALS) {
      const url = urls[social.platform]?.trim();
      if (!url) continue;

      const res = await fetch(`${CLIENT_API_BASE}/api/v1/links`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: social.title,
          url,
          type: "social",
          platform: social.platform,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { message?: string };
        throw new Error(data.message || `Could not add ${social.label}`);
      }
    }
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
      await createSocialLinks(token);
      await goNext(token);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Cannot reach API. Is the backend running?",
      );
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
      router.push("/onboarding/theme");
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingShell
      step="socials"
      title="Add your socials"
      description="Paste profiles you want on your page. You can add more later in Links."
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
        <form onSubmit={onSubmit} className={onboardingCardClass}>
          {SOCIALS.map((social) => (
            <label
              key={social.platform}
              className="flex flex-col gap-1.5 text-left text-sm"
            >
              <span className="font-medium text-text">{social.label}</span>
              <input
                type="url"
                value={urls[social.platform] ?? ""}
                onChange={(e) =>
                  setUrls((prev) => ({
                    ...prev,
                    [social.platform]: e.target.value,
                  }))
                }
                placeholder={social.placeholder}
                className={onboardingInputClass}
              />
            </label>
          ))}

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
