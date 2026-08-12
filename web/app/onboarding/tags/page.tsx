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
  completeOnboarding,
  onboardingFormClass,
  onboardingInputClass,
  onboardingPrimaryBtnClass,
} from "@/lib/onboarding";
import type { ApiSuccess, PublicProfile } from "@/lib/types";

const SUGGESTED_TAGS = [
  "Developer",
  "Designer",
  "Creator",
  "Writer",
  "Founder",
  "Photographer",
  "Musician",
  "Marketer",
];

export default function OnboardingTagsPage() {
  const router = useRouter();
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
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
        if (res.ok) {
          const data = (await res.json()) as ApiSuccess<{
            profile: PublicProfile;
          }>;
          setTags(data.data.profile.tags ?? []);
        }
        setReady(true);
      } catch {
        setError("Cannot reach API. Is the backend running?");
        setReady(true);
      }
    }

    void load();
  }, [router]);

  function addTag(raw: string) {
    const tag = raw.trim().replace(/^#/, "");
    if (!tag) return;
    const normalized = tag.slice(0, 24);
    setTags((prev) =>
      prev.some((t) => t.toLowerCase() === normalized.toLowerCase())
        ? prev
        : [...prev, normalized].slice(0, 8),
    );
    setTagDraft("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  async function finish(token: string) {
    await completeOnboarding(token);
    router.push("/profile");
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
        body: JSON.stringify({ tags }),
      });

      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        setError(data.message || "Could not save tags");
        return;
      }

      await finish(token);
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
      await finish(token);
    } catch {
      router.push("/profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingShell
      step="tags"
      title="Pick a few tags"
      description="Help people understand what you do. Up to 8 — all optional."
      footer={
        <OnboardingSkipFooter
          label="Skip and finish"
          onSkip={() => void onSkip()}
          disabled={loading}
        />
      }
    >
      {!ready ? (
        <Loader label="Loading…" className="py-12" />
      ) : (
        <form onSubmit={onSubmit} className={onboardingFormClass}>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_TAGS.map((tag) => {
              const selected = tags.some(
                (t) => t.toLowerCase() === tag.toLowerCase(),
              );
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => (selected ? removeTag(tag) : addTag(tag))}
                  className={
                    selected
                      ? "rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-text-inverse"
                      : "rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text-muted hover:border-brand hover:text-text"
                  }
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {tags.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <li key={tag}>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="rounded-full bg-bg px-2.5 py-1 text-xs text-text-muted ring-1 ring-border hover:text-danger"
                    title="Remove"
                  >
                    {tag} ×
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex gap-2">
            <input
              type="text"
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTag(tagDraft);
                }
              }}
              maxLength={24}
              placeholder="Custom tag"
              className={onboardingInputClass}
            />
            <button
              type="button"
              onClick={() => addTag(tagDraft)}
              className="shrink-0 rounded-xl border border-border px-3.5 text-sm font-medium text-text hover:border-brand"
            >
              Add
            </button>
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
            {loading ? "Finishing…" : "Finish setup"}
          </button>
        </form>
      )}
    </OnboardingShell>
  );
}
