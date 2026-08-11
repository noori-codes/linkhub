"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import type { ApiSuccess, PublicProfile } from "@/lib/types";

type Props = {
  profile: PublicProfile;
  onProfileChange: (profile: PublicProfile) => void;
};

type MeUser = {
  emailVerified: boolean;
};

export function PreviewPublishControl({ profile, onProfileChange }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);

  const isPublished = profile.status === "published";

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    async function loadMe() {
      try {
        const res = await fetch(`${CLIENT_API_BASE}/api/v1/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as ApiSuccess<{ user: MeUser }>;
        setEmailVerified(data.data.user.emailVerified);
      } catch {
        /* keep optimistic default */
      }
    }

    void loadMe();
  }, []);

  async function togglePublish() {
    if (saving) return;

    if (!isPublished && !emailVerified) {
      toast.error("First confirm your email before you can publish.");
      return;
    }

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const nextStatus = isPublished ? "draft" : "published";
    setSaving(true);

    try {
      const res = await fetch(`${CLIENT_API_BASE}/api/v1/profiles/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = (await res.json()) as ApiSuccess<{
        profile: PublicProfile;
      }> & { message?: string };

      if (!res.ok) {
        toast.error(data.message || "Could not update status");
        return;
      }

      onProfileChange(data.data.profile);
      toast.success(
        nextStatus === "published" ? "Page published" : "Page unpublished",
      );
    } catch {
      toast.error("Cannot reach API. Is the backend running?");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <span
        className={
          isPublished
            ? "rounded-full bg-[#e8f6ee] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-success"
            : "rounded-full bg-surface px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted"
        }
      >
        {isPublished ? "Live" : "Draft"}
      </span>
      <button
        type="button"
        onClick={() => void togglePublish()}
        disabled={saving}
        className={
          isPublished
            ? "rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text hover:border-brand/40 disabled:opacity-50"
            : "rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-text-inverse hover:bg-brand-hover disabled:opacity-50"
        }
      >
        {saving ? "Saving…" : isPublished ? "Unpublish" : "Publish"}
      </button>
    </div>
  );
}
