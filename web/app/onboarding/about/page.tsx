"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { AuthShell } from "@/components/AuthShell";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import type { ApiSuccess, PublicProfile } from "@/lib/types";

const SUGGESTED_TAGS = [
  "Developer",
  "Designer",
  "Creator",
  "Writer",
  "Founder",
  "Photographer",
];

const inputClass =
  "w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand";

/**
 * Onboarding step 1 after username: who you are (name, bio, tags).
 * Next step will be socials → then /profile.
 */
export default function OnboardingAboutPage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
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

        if (!res.ok) {
          setError("Could not load your profile.");
          setReady(true);
          return;
        }

        const data = (await res.json()) as ApiSuccess<{
          profile: PublicProfile;
        }>;
        const profile = data.data.profile;

        setDisplayName(profile.displayName || "");
        setBio(profile.bio || "");
        setTags(profile.tags ?? []);
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

  async function advanceOnboarding(token: string) {
    await fetch(`${CLIENT_API_BASE}/api/v1/users/updateMe`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ onboardingStep: "socials" }),
    });
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
          tags,
        }),
      });

      const data = (await res.json()) as { message?: string };

      if (!res.ok) {
        setError(data.message || "Could not save profile");
        return;
      }

      await advanceOnboarding(token);
      // Socials screen comes next (step 2 of richer onboarding)
      router.push("/onboarding/socials");
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
      await advanceOnboarding(token);
      router.push("/onboarding/socials");
    } catch {
      router.push("/onboarding/socials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Tell people who you are"
      description="A short bio and a few tags. You can change these anytime in About."
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
          <label className="flex flex-col gap-1.5 text-left text-sm">
            <span className="text-text-muted">Display name</span>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={60}
              placeholder="How you want to be known"
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-left text-sm">
            <span className="text-text-muted">Bio</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={280}
              placeholder="One short paragraph about you"
              className={`${inputClass} resize-y`}
            />
          </label>

          <div className="flex flex-col gap-2 text-left text-sm">
            <span className="text-text-muted">Tags</span>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_TAGS.map((tag) => {
                const selected = tags.some(
                  (t) => t.toLowerCase() === tag.toLowerCase(),
                );
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      selected ? removeTag(tag) : addTag(tag)
                    }
                    className={
                      selected
                        ? "rounded-md bg-brand px-2.5 py-1 text-xs font-medium text-text-inverse"
                        : "rounded-md border border-border px-2.5 py-1 text-xs text-text-muted hover:border-brand hover:text-text"
                    }
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {tags.length > 0 ? (
              <ul className="mt-1 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <li key={tag}>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="rounded-md bg-bg px-2 py-0.5 text-xs text-text-muted hover:text-danger"
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
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => addTag(tagDraft)}
                className="shrink-0 rounded-md border border-border px-3 text-xs font-medium text-text hover:border-brand"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-text-muted">Up to 8 tags. Optional.</p>
          </div>

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
      )}
    </AuthShell>
  );
}
