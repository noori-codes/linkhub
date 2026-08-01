"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import type { ApiSuccess, PublicProfile } from "@/lib/types";

type Props = {
  profile: PublicProfile;
  onProfileChange: (profile: PublicProfile) => void;
  onError: (message: string) => void;
};

// Publish toggle + navigation — separate from editing bio/name
export function DashboardActions({
  profile,
  onProfileChange,
  onError,
}: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const isPublished = profile.status === "published";

  async function togglePublish() {
    if (saving) return;

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const nextStatus = isPublished ? "draft" : "published";

    setSaving(true);
    onError("");

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
        onError(data.message || "Could not update status");
        return;
      }

      onProfileChange(data.data.profile);
    } catch {
      onError("Cannot reach API. Is the backend running?");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => void togglePublish()}
        disabled={saving}
        className="rounded-md border border-border px-4 py-2.5 text-sm font-medium text-text hover:border-brand disabled:opacity-50"
      >
        {saving ? "Saving…" : isPublished ? "Unpublish (draft)" : "Publish"}
      </button>
      <Link
        href={`/u/${profile.username}`}
        className="rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-text-inverse hover:bg-brand-hover"
      >
        View public page
      </Link>
      <Link
        href="/"
        className="rounded-md border border-border px-4 py-2.5 text-sm font-medium text-text hover:border-brand"
      >
        Home
      </Link>
    </div>
  );
}
