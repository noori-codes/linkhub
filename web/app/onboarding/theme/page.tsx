"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import {
  OnboardingShell,
  OnboardingSkipFooter,
} from "@/components/onboarding/OnboardingShell";
import { Loader } from "@/components/Loader";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import { queryKeys } from "@/lib/dashboard-queries";
import {
  onboardingFormClass,
  onboardingPrimaryBtnClass,
  setOnboardingStep,
} from "@/lib/onboarding";
import { themeIdOf } from "@/lib/theme";
import type { ApiSuccess, ProfileTheme, PublicProfile } from "@/lib/types";

async function fetchThemes(): Promise<ProfileTheme[]> {
  const res = await fetch(`${CLIENT_API_BASE}/api/v1/themes`);
  const json = (await res.json()) as ApiSuccess<{ themes: ProfileTheme[] }> & {
    message?: string;
  };
  if (!res.ok) throw new Error(json.message || "Could not load themes");
  return json.data.themes;
}

export default function OnboardingThemePage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const themesQuery = useQuery({
    queryKey: queryKeys.themes,
    queryFn: fetchThemes,
  });

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
          setSelectedId(themeIdOf(data.data.profile));
        }
        setReady(true);
      } catch {
        setError("Cannot reach API. Is the backend running?");
        setReady(true);
      }
    }

    void load();
  }, [router]);
  useEffect(() => {
    if (selectedId || !themesQuery.data?.length) return;
    const fallback =
      themesQuery.data.find((t) => t.slug === "classic") ??
      themesQuery.data.find((t) => t.isDefault) ??
      themesQuery.data[0];
    if (fallback) setSelectedId(fallback._id);
  }, [themesQuery.data, selectedId]);

  async function goNext(token: string) {
    await setOnboardingStep(token, "links");
    router.push("/onboarding/links");
  }

  async function applyAndContinue(themeId: string | null) {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (themeId) {
        const res = await fetch(`${CLIENT_API_BASE}/api/v1/profiles/me`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ theme: themeId }),
        });
        const data = (await res.json()) as { message?: string };
        if (!res.ok) {
          setError(data.message || "Could not apply theme");
          return;
        }
      }
      await goNext(token);
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
      const defaultTheme =
        themesQuery.data?.find((t) => t.slug === "classic") ??
        themesQuery.data?.find((t) => t.isDefault) ??
        themesQuery.data?.[0];
      if (defaultTheme) {
        await fetch(`${CLIENT_API_BASE}/api/v1/profiles/me`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ theme: defaultTheme._id }),
        });
      }
      await goNext(token);
    } catch {
      router.push("/onboarding/links");
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingShell
      step="theme"
      title="Pick a look"
      description="Colors and type for your public page. Change anytime in Design."
      wide
      footer={
        <OnboardingSkipFooter
          label="Use default theme"
          onSkip={() => void onSkip()}
          disabled={loading}
        />
      }
    >
      {!ready ? (
        <Loader label="Loading…" className="py-12" />
      ) : (
        <div className={onboardingFormClass}>
          {themesQuery.isLoading ? (
            <Loader label="Loading themes…" className="py-8" />
          ) : themesQuery.isError ? (
            <p className="text-sm text-danger">
              {themesQuery.error instanceof Error
                ? themesQuery.error.message
                : "Could not load themes"}
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {(themesQuery.data ?? []).map((theme) => {
                const active = selectedId === theme._id;
                const { tokens } = theme;
                return (
                  <li key={theme._id}>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setSelectedId(theme._id)}
                      aria-pressed={active}
                      className={`group flex w-full flex-col overflow-hidden rounded-xl border text-left transition-[box-shadow,border-color] disabled:opacity-60 ${
                        active
                          ? "border-brand shadow-[0_0_0_1px_var(--brand)]"
                          : "border-border hover:border-brand/35"
                      }`}
                    >
                      <div
                        className="flex h-16 flex-col justify-end gap-1.5 p-2.5"
                        style={{
                          backgroundColor: tokens.backgroundColor,
                          color: tokens.textColor,
                          fontFamily: tokens.fontFamily,
                        }}
                      >
                        <span
                          className="block h-2.5 w-[70%] rounded-full"
                          style={{ backgroundColor: tokens.buttonColor }}
                        />
                        <span
                          className="block h-2 w-[45%] rounded-full opacity-50"
                          style={{ backgroundColor: tokens.textColor }}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2 border-t border-border bg-bg-elevated px-2.5 py-2">
                        <span className="truncate text-xs font-semibold text-text">
                          {theme.name}
                        </span>
                        {active ? (
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-brand">
                            On
                          </span>
                        ) : theme.isDefault ? (
                          <span className="text-[10px] text-text-muted">
                            Default
                          </span>
                        ) : null}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {error ? (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            disabled={loading || !selectedId}
            onClick={() => void applyAndContinue(selectedId)}
            className={onboardingPrimaryBtnClass}
          >
            {loading ? "Saving…" : "Continue"}
          </button>
        </div>
      )}
    </OnboardingShell>
  );
}
