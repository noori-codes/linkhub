"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  OnboardingShell,
  OnboardingSkipFooter,
} from "@/components/onboarding/OnboardingShell";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import {
  onboardingCardClass,
  onboardingInputClass,
  onboardingPrimaryBtnClass,
  setOnboardingStep,
} from "@/lib/onboarding";

type CustomLink = { title: string; url: string };
type AltProfile = { title: string; url: string };

/** Step 5: custom links + optional alt profiles. */
export default function OnboardingLinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<CustomLink[]>([
    { title: "", url: "" },
    { title: "", url: "" },
  ]);
  const [showAlt, setShowAlt] = useState(false);
  const [alts, setAlts] = useState<AltProfile[]>([
    { title: "", url: "" },
  ]);
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
    await setOnboardingStep(token, "wallets");
    router.push("/onboarding/wallets");
  }

  async function createLinks(
    token: string,
    items: Array<{ title: string; url: string; type: string; platform: string }>,
  ) {
    for (const item of items) {
      const res = await fetch(`${CLIENT_API_BASE}/api/v1/links`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      });
      if (!res.ok) {
        const data = (await res.json()) as { message?: string };
        throw new Error(data.message || `Could not add “${item.title}”`);
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
      const custom = links
        .map((l) => ({
          title: l.title.trim(),
          url: l.url.trim(),
          type: "custom",
          platform: "custom",
        }))
        .filter((l) => l.title && l.url);

      const altProfiles = showAlt
        ? alts
            .map((l) => ({
              title: l.title.trim(),
              url: l.url.trim(),
              type: "alt_profile",
              platform: "alt",
            }))
            .filter((l) => l.title && l.url)
        : [];

      await createLinks(token, [...custom, ...altProfiles]);
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
      router.push("/onboarding/wallets");
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingShell
      step="links"
      title="Add a few links"
      description="Portfolio, newsletter, shop — whatever you want people to open first."
      footer={
        <OnboardingSkipFooter
          onSkip={() => void onSkip()}
          disabled={loading}
        />
      }
    >
      {!ready ? (
        <p className="text-sm text-text-muted">Loading…</p>
      ) : (
        <form onSubmit={onSubmit} className={onboardingCardClass}>
          {links.map((link, index) => (
            <div key={index} className="flex flex-col gap-2">
              <p className="text-xs font-medium tracking-wide text-text-muted uppercase">
                Link {index + 1}
              </p>
              <input
                type="text"
                value={link.title}
                onChange={(e) =>
                  setLinks((prev) =>
                    prev.map((row, i) =>
                      i === index ? { ...row, title: e.target.value } : row,
                    ),
                  )
                }
                placeholder="Title"
                maxLength={100}
                className={onboardingInputClass}
              />
              <input
                type="url"
                value={link.url}
                onChange={(e) =>
                  setLinks((prev) =>
                    prev.map((row, i) =>
                      i === index ? { ...row, url: e.target.value } : row,
                    ),
                  )
                }
                placeholder="https://"
                className={onboardingInputClass}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setLinks((prev) =>
                prev.length >= 5
                  ? prev
                  : [...prev, { title: "", url: "" }],
              )
            }
            className="text-left text-sm font-medium text-brand hover:text-brand-hover"
          >
            + Add another link
          </button>

          <div className="border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setShowAlt((v) => !v)}
              className="flex w-full items-center justify-between text-left"
            >
              <div>
                <p className="text-sm font-semibold text-text">
                  Other profiles
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  Optional — Behance, YouTube channel, etc.
                </p>
              </div>
              <span className="text-xs font-semibold text-brand">
                {showAlt ? "Hide" : "Show"}
              </span>
            </button>

            {showAlt ? (
              <div className="mt-3 flex flex-col gap-3">
                {alts.map((alt, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={alt.title}
                      onChange={(e) =>
                        setAlts((prev) =>
                          prev.map((row, i) =>
                            i === index
                              ? { ...row, title: e.target.value }
                              : row,
                          ),
                        )
                      }
                      placeholder="Label"
                      className={onboardingInputClass}
                    />
                    <input
                      type="url"
                      value={alt.url}
                      onChange={(e) =>
                        setAlts((prev) =>
                          prev.map((row, i) =>
                            i === index
                              ? { ...row, url: e.target.value }
                              : row,
                          ),
                        )
                      }
                      placeholder="https://"
                      className={onboardingInputClass}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

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
