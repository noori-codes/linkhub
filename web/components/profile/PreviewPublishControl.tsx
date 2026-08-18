"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CLIENT_API_BASE, NETWORK_ERROR } from "@/lib/client-api";
import { subscribeEmailVerified } from "@/lib/auth-session";
import { getToken } from "@/lib/auth";
import { fetchMyUser, queryKeys } from "@/lib/dashboard-queries";
import type { ApiSuccess, PublicProfile } from "@/lib/types";

type Props = {
  profile: PublicProfile;
  onProfileChange: (profile: PublicProfile) => void;
};

export function PreviewPublishControl({ profile, onProfileChange }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const meQuery = useQuery({
    queryKey: queryKeys.userMe,
    queryFn: fetchMyUser,
  });

  const isPublished = profile.status === "published";

  useEffect(() => {
    return subscribeEmailVerified(() => {
      void meQuery.refetch();
    });
  }, [meQuery]);

  // Browser back/forward cache can restore a stale dashboard after verify-email.
  useEffect(() => {
    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        void meQuery.refetch();
      }
    }

    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [meQuery]);

  async function togglePublish() {
    if (saving) return;

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    if (!isPublished) {
      const { data: me } = await meQuery.refetch();
      if (!me?.emailVerified) {
        toast.error("First confirm your email before you can publish.");
        return;
      }
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
      toast.error(NETWORK_ERROR);
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
        disabled={saving || meQuery.isLoading}
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
