"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useProfile } from "@/components/profile/ProfileProvider";
import { Loader } from "@/components/Loader";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import { queryKeys } from "@/lib/dashboard-queries";
import { themeIdOf } from "@/lib/theme";
import type { ApiSuccess, ProfileTheme, PublicProfile } from "@/lib/types";

async function fetchThemes(): Promise<ProfileTheme[]> {
  const res = await fetch(`${CLIENT_API_BASE}/api/v1/themes`);
  const json = (await res.json()) as ApiSuccess<{ themes: ProfileTheme[] }> & {
    message?: string;
  };

  if (!res.ok) {
    throw new Error(json.message || "Could not load themes");
  }

  return json.data.themes;
}

/** Pick a built-in appearance — updates profile.theme and live preview. */
export function ThemePicker() {
  const router = useRouter();
  const { profile, setProfile } = useProfile();
  const [savingId, setSavingId] = useState<string | null>(null);

  const themesQuery = useQuery({
    queryKey: queryKeys.themes,
    queryFn: fetchThemes,
  });

  if (!profile) {
    return null;
  }

  const selectedId = themeIdOf(profile);

  async function selectTheme(theme: ProfileTheme) {
    if (savingId || selectedId === theme._id) return;

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setSavingId(theme._id);

    try {
      const res = await fetch(`${CLIENT_API_BASE}/api/v1/profiles/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ theme: theme._id }),
      });

      const data = (await res.json()) as ApiSuccess<{
        profile: PublicProfile;
      }> & { message?: string };

      if (!res.ok) {
        toast.error(data.message || "Could not apply theme");
        return;
      }

      setProfile(data.data.profile);
      toast.success(`${theme.name} theme applied`);
    } catch {
      toast.error("Cannot reach API. Is the backend running?");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(18,20,26,0.04)] sm:p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-text">Theme</h2>
        <p className="mt-1 text-xs text-text-muted">
          Colors and type for your public page — preview updates live
        </p>
      </div>

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
            const busy = savingId === theme._id;
            const { tokens } = theme;

            return (
              <li key={theme._id}>
                <button
                  type="button"
                  disabled={Boolean(savingId)}
                  onClick={() => void selectTheme(theme)}
                  aria-pressed={active}
                  className={`group flex w-full flex-col overflow-hidden rounded-xl border text-left transition-[box-shadow,border-color,transform] disabled:opacity-60 ${
                    active
                      ? "border-brand shadow-[0_0_0_1px_var(--brand)]"
                      : "border-border hover:border-brand/35"
                  }`}
                >
                  <div
                    className="relative flex h-16 flex-col justify-end gap-1.5 p-2.5"
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
                    {busy ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-[10px] font-semibold text-white">
                        …
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t border-border bg-bg-elevated px-2.5 py-2">
                    <span className="truncate text-xs font-semibold text-text">
                      {theme.name}
                    </span>
                    {active ? (
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-brand">
                        On
                      </span>
                    ) : theme.isDefault ? (
                      <span className="shrink-0 text-[10px] text-text-muted">
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
    </section>
  );
}
