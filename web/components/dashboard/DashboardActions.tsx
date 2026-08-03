"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ShareQr } from "@/components/dashboard/ShareQr";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import type { ApiSuccess, PublicProfile } from "@/lib/types";

type Props = {
  profile: PublicProfile;
  onProfileChange: (profile: PublicProfile) => void;
  /** When false, Publish is blocked (API also enforces this). */
  emailVerified?: boolean;
};

function publicPageUrl(username: string) {
  return `${window.location.origin}/u/${username}`;
}

export function DashboardActions({
  profile,
  onProfileChange,
  emailVerified = true,
}: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showQr, setShowQr] = useState(false);

  const isPublished = profile.status === "published";
  const canPublish = emailVerified;
  const pathLabel = `/u/${profile.username}`;

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

  async function onCopyLink() {
    setError("");
    try {
      await navigator.clipboard.writeText(publicPageUrl(profile.username));
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  }

  return (
    <section className="rounded-md border border-border bg-surface p-4">
      <p className="mb-3 text-sm font-medium text-text">Page</p>
      {error ? (
        <p className="mb-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {!isPublished && !canPublish ? null : !isPublished ? (
        <p className="mb-3 text-xs text-text-muted">
          Draft pages return 404 for visitors until you publish.
        </p>
      ) : null}

      <p className="mb-3 font-mono text-xs text-text-muted">{pathLabel}</p>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => void onCopyLink()}
          className="rounded-md border border-border px-3 py-2 text-sm font-medium text-text hover:border-brand"
        >
          Copy link
        </button>
        <button
          type="button"
          onClick={() => setShowQr((v) => !v)}
          className="rounded-md border border-border px-3 py-2 text-sm font-medium text-text hover:border-brand"
        >
          {showQr ? "Hide QR" : "Show QR"}
        </button>
        {showQr ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <ShareQr url={publicPageUrl(profile.username)} />
            {typeof window !== "undefined" &&
            (window.location.hostname === "localhost" ||
              window.location.hostname === "127.0.0.1") ? (
              <p className="max-w-xs text-center text-xs text-text-muted">
                This QR uses localhost — it only opens on{" "}
                <span className="text-text">this computer</span>. On a phone,
                localhost means the phone itself, not your laptop. Use the same
                Wi‑Fi and your computer’s LAN address (e.g.{" "}
                <span className="font-mono text-text">192.168.x.x:3001</span>)
                when you want to test from a phone.
              </p>
            ) : null}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => void togglePublish()}
          disabled={saving}
          className="rounded-md border border-border px-3 py-2 text-sm font-medium text-text hover:border-brand disabled:opacity-50"
        >
          {saving
            ? "Saving…"
            : isPublished
              ? "Unpublish (draft)"
              : "Publish page"}
        </button>
        <Link
          href={`/u/${profile.username}`}
          className="rounded-md bg-brand px-3 py-2 text-center text-sm font-medium text-text-inverse hover:bg-brand-hover"
        >
          View public page
        </Link>
      </div>
    </section>
  );
}
