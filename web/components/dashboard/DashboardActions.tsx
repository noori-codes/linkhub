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
};

export function DashboardActions({ profile, onProfileChange }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    setError("");

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
        setError(data.message || "Could not update status");
        return;
      }

      onProfileChange(data.data.profile);
    } catch {
      setError("Cannot reach API. Is the backend running?");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
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
    </div>
  );
}
