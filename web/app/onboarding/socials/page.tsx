"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { AuthShell } from "@/components/AuthShell";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";

const inputClass =
  "w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand";

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
    platform: "website",
    label: "Website",
    placeholder: "https://yoursite.com",
    title: "Website",
  },
];

/**
 * Onboarding step 2: optional social links (stored as Link type=social).
 * Then mark onboarding complete → /profile.
 */
export default function OnboardingSocialsPage() {
  const router = useRouter();
  const [urls, setUrls] = useState<Record<string, string>>({
    instagram: "",
    x: "",
    github: "",
    website: "",
  });
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

  async function finishOnboarding(token: string) {
    await fetch(`${CLIENT_API_BASE}/api/v1/users/updateMe`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ onboardingCompleted: true }),
    });
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
      await finishOnboarding(token);
      router.push("/profile");
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
      await finishOnboarding(token);
      router.push("/profile");
    } catch {
      router.push("/profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Add your socials"
      description="Optional — paste any you want on your page. Skip if you’re not ready."
      footer={
        <p className="text-center text-sm text-text-muted">
          <button
            type="button"
            onClick={() => void onSkip()}
            disabled={loading}
            className="text-brand hover:text-brand-hover disabled:opacity-60"
          >
            Skip for now
          </button>
          {" · "}
          <Link href="/profile" className="hover:text-brand">
            Go to profile
          </Link>
        </p>
      }
    >
      {!ready ? (
        <p className="text-sm text-text-muted">Loading…</p>
      ) : (
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5"
        >
          {SOCIALS.map((social) => (
            <label
              key={social.platform}
              className="flex flex-col gap-1.5 text-left text-sm"
            >
              <span className="text-text-muted">{social.label}</span>
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
                className={inputClass}
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
            className="mt-1 rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-text-inverse hover:bg-brand-hover disabled:opacity-60"
          >
            {loading ? "Saving…" : "Finish"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
