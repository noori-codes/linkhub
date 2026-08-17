"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useProfile } from "@/components/profile/ProfileProvider";
import { Skeleton } from "@/components/Skeleton";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import { BUTTON_SHAPES, resolveButtonShape } from "@/lib/theme";
import type { ApiSuccess, ButtonShape, PublicProfile } from "@/lib/types";

export function ButtonShapePicker() {
  const router = useRouter();
  const { profile, setProfile } = useProfile();
  const [saving, setSaving] = useState<ButtonShape | null>(null);

  if (!profile) {
    return (
      <section className="rounded-2xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(18,20,26,0.04)] sm:p-5">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-text">Button shape</h2>
          <p className="mt-1 text-xs text-text-muted">
            Corners for link buttons on your public page
          </p>
        </div>
        <div
          className="grid grid-cols-3 gap-2.5"
          role="status"
          aria-label="Loading button shapes"
        >
          <Skeleton className="h-[4.75rem] w-full rounded-xl" />
          <Skeleton className="h-[4.75rem] w-full rounded-xl" />
          <Skeleton className="h-[4.75rem] w-full rounded-xl" />
        </div>
      </section>
    );
  }

  const selected = resolveButtonShape(profile);

  async function selectShape(shape: ButtonShape) {
    if (saving || selected === shape) return;

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setSaving(shape);

    try {
      const res = await fetch(`${CLIENT_API_BASE}/api/v1/profiles/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ buttonShape: shape }),
      });

      const data = (await res.json()) as ApiSuccess<{
        profile: PublicProfile;
      }> & { message?: string };

      if (!res.ok) {
        toast.error(data.message || "Could not update button shape");
        return;
      }

      setProfile(data.data.profile);
      toast.success(`${BUTTON_SHAPES.find((s) => s.id === shape)?.label} buttons`);
    } catch {
      toast.error("Cannot reach API. Is the backend running?");
    } finally {
      setSaving(null);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(18,20,26,0.04)] sm:p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-text">Button shape</h2>
        <p className="mt-1 text-xs text-text-muted">
          Corners for link buttons on your public page
        </p>
      </div>

      <ul className="grid grid-cols-3 gap-2.5">
        {BUTTON_SHAPES.map((shape) => {
          const active = selected === shape.id;
          const busy = saving === shape.id;

          return (
            <li key={shape.id}>
              <button
                type="button"
                disabled={Boolean(saving)}
                onClick={() => void selectShape(shape.id)}
                aria-pressed={active}
                className={`flex w-full flex-col items-center gap-2.5 rounded-xl border px-2 py-3 transition-[border-color,box-shadow] disabled:opacity-60 ${
                  active
                    ? "border-brand shadow-[0_0_0_1px_var(--brand)]"
                    : "border-border hover:border-brand/35"
                }`}
              >
                <span
                  className="block h-8 w-full max-w-[4.5rem] bg-text"
                  style={{ borderRadius: shape.radius }}
                  aria-hidden
                />
                <span className="text-xs font-semibold text-text">
                  {busy ? "…" : shape.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
