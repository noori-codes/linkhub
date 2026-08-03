"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { SettingsCard } from "@/components/dashboard/SettingsCard";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import type { ApiSuccess, PublicProfile } from "@/lib/types";

type Props = {
  profile: PublicProfile;
  onProfileChange: (profile: PublicProfile) => void;
  emailVerified?: boolean;
};

/** Settings: publish controls only (Share is on the preview card). */
export function DashboardActions({
  profile,
  onProfileChange,
  emailVerified = true,
}: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isPublished = profile.status === "published";
  const canPublish = emailVerified;

  async function togglePublish() {
    if (saving) return;

    if (!isPublished && !canPublish) {
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
        const msg = data.message || "Could not update status";
        setError(msg);
        toast.error(msg);
        return;
      }

      onProfileChange(data.data.profile);
      toast.success(
        nextStatus === "published" ? "Page published" : "Page unpublished",
      );
    } catch {
      const msg = "Cannot reach API. Is the backend running?";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsCard
      title="Publish"
      description={
        isPublished
          ? "Your page is live for visitors."
          : "Draft pages return 404 until you publish."
      }
      badge={
        <span
          className={
            isPublished
              ? "rounded-md bg-success/10 px-2 py-0.5 text-xs font-medium text-success"
              : "rounded-md bg-bg px-2 py-0.5 text-xs font-medium text-text-muted"
          }
        >
          {isPublished ? "Live" : "Draft"}
        </span>
      }
    >
      {error ? (
        <p className="mb-3 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => void togglePublish()}
          disabled={saving}
          className={
            isPublished
              ? "rounded-md border border-border px-4 py-2.5 text-sm font-medium text-text hover:border-brand disabled:opacity-50 sm:flex-1"
              : "rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-text-inverse hover:bg-brand-hover disabled:opacity-50 sm:flex-1"
          }
        >
          {saving
            ? "Saving…"
            : isPublished
              ? "Unpublish"
              : "Publish page"}
        </button>
        <Link
          href={`/u/${profile.username}`}
          className="rounded-md border border-border px-4 py-2.5 text-center text-sm font-medium text-text hover:border-brand sm:flex-1"
        >
          View page
        </Link>
      </div>
    </SettingsCard>
  );
}
