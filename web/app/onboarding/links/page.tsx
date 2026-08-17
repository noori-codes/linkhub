"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  OnboardingShell,
  OnboardingSkipFooter,
} from "@/components/onboarding/OnboardingShell";
import { PlatformIconBadge } from "@/components/onboarding/PlatformIconBadge";
import { ListSkeleton } from "@/components/Skeleton";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import {
  getLinkPlatform,
  readSelectedPlatforms,
  type LinkPlatform,
} from "@/lib/link-platforms";
import {
  onboardingFormClass,
  onboardingInputClass,
  onboardingPrimaryBtnClass,
  setOnboardingStep,
} from "@/lib/onboarding";

type CustomLink = { title: string; url: string };

const linkInputShellClass =
  "flex items-center gap-2.5 rounded-xl border border-border bg-bg px-3 py-1.5 transition-[border-color,box-shadow] focus-within:border-brand focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand)_10%,transparent)]";

const linkInputInnerClass =
  "min-w-0 flex-1 border-0 bg-transparent py-1.5 text-sm text-text outline-none placeholder:text-text-muted";

function PlatformLinkField({
  platform,
  value,
  onChange,
  disabled,
}: {
  platform: LinkPlatform;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-left text-sm">
      <span className="font-medium text-text">{platform.label}</span>
      <span className={linkInputShellClass}>
        <PlatformIconBadge platform={platform.id} size="xs" />
        <span className="h-4 w-px shrink-0 bg-border" aria-hidden />
        <input
          type="url"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={platform.placeholder}
          aria-label={`${platform.label} URL`}
          className={linkInputInnerClass}
        />
      </span>
    </label>
  );
}

export default function OnboardingLinksPage() {
  const router = useRouter();
  const [platformIds, setPlatformIds] = useState<string[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([
    { title: "", url: "" },
  ]);
  const [showCustomLinks, setShowCustomLinks] = useState(false);
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

        const selected = readSelectedPlatforms();
        setPlatformIds(selected);
        setUrls(Object.fromEntries(selected.map((id) => [id, ""])));
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

  async function createLinks(
    token: string,
    items: Array<{
      title: string;
      url: string;
      type: string;
      platform: string;
    }>,
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
      const socialLinks = platformIds
        .map((id) => {
          const platform = getLinkPlatform(id);
          const url = urls[id]?.trim();
          if (!platform || !url) return null;
          return {
            title: platform.title,
            url,
            type: "social",
            platform: platform.id,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      const custom = customLinks
        .map((link) => ({
          title: link.title.trim(),
          url: link.url.trim(),
          type: "custom",
          platform: "custom",
        }))
        .filter((link) => link.title && link.url);

      await createLinks(token, [...socialLinks, ...custom]);
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
      step="links"
      wide
      title="Add your links"
      description="Paste your profile URL for each platform. Leave blank any you want to skip."
      footer={
        <OnboardingSkipFooter onSkip={() => void onSkip()} disabled={loading} />
      }
    >
      {!ready ? (
        <ListSkeleton rows={5} />
      ) : platformIds.length === 0 ? (
        <form onSubmit={onSubmit} className={onboardingFormClass}>
          <EmptyPlatformsHint />

          <CustomLinksSection
            links={customLinks}
            onChange={setCustomLinks}
            disabled={loading}
          />

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
      ) : (
        <form onSubmit={onSubmit} className={onboardingFormClass}>
          <div className="flex flex-col gap-4">
            {platformIds.map((id) => {
              const platform = getLinkPlatform(id);
              if (!platform) return null;

              return (
                <PlatformLinkField
                  key={id}
                  platform={platform}
                  value={urls[id] ?? ""}
                  disabled={loading}
                  onChange={(value) =>
                    setUrls((prev) => ({ ...prev, [id]: value }))
                  }
                />
              );
            })}
          </div>

          <div className="border-t border-border pt-4">
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowCustomLinks((open) => !open)}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <div>
                <p className="text-sm font-medium text-text">Other links</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  Portfolio, shop, newsletter — optional
                </p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-brand">
                {showCustomLinks ? "Hide" : "Add"}
              </span>
            </button>

            {showCustomLinks ? (
              <div className="mt-4">
                <CustomLinksSection
                  links={customLinks}
                  onChange={setCustomLinks}
                  disabled={loading}
                />
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

function EmptyPlatformsHint() {
  return (
    <p className="rounded-xl border border-dashed border-border bg-bg px-4 py-5 text-center text-sm leading-relaxed text-text-muted">
      You didn&apos;t pick any platforms.{" "}
      <Link
        href="/onboarding/socials"
        className="font-medium text-brand hover:text-brand-hover"
      >
        Go back to choose
      </Link>{" "}
      or add a custom link below.
    </p>
  );
}

function CustomLinksSection({
  links,
  onChange,
  disabled,
}: {
  links: CustomLink[];
  onChange: (next: CustomLink[]) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      {links.map((link, index) => (
        <div
          key={index}
          className="grid gap-2 rounded-xl border border-border bg-surface p-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]"
        >
          <input
            type="text"
            value={link.title}
            disabled={disabled}
            onChange={(e) =>
              onChange(
                links.map((row, i) =>
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
            disabled={disabled}
            onChange={(e) =>
              onChange(
                links.map((row, i) =>
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
        disabled={disabled || links.length >= 3}
        onClick={() =>
          onChange(
            links.length >= 3 ? links : [...links, { title: "", url: "" }],
          )
        }
        className="text-left text-sm font-medium text-brand hover:text-brand-hover disabled:opacity-60"
      >
        + Add another custom link
      </button>
    </div>
  );
}
