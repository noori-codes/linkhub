"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { useProfile } from "@/components/profile/ProfileProvider";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import type { ApiSuccess, PublicProfile } from "@/lib/types";

const inputClass =
  "w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand";

function isRemote(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

/** Avatar + cover image URLs — sidebar form under Photos. */
export function PhotosEditor() {
  const router = useRouter();
  const { profile, setProfile } = useProfile();

  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile) return;
    setAvatarUrl(profile.avatarUrl?.startsWith("http") ? profile.avatarUrl : "");
    setCoverUrl(profile.coverUrl ?? "");
  }, [profile]);

  if (!profile) {
    return <p className="text-sm text-text-muted">Loading…</p>;
  }

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${CLIENT_API_BASE}/api/v1/profiles/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          avatarUrl: avatarUrl.trim(),
          coverUrl: coverUrl.trim(),
        }),
      });

      const data = (await res.json()) as ApiSuccess<{
        profile: PublicProfile;
      }> & { message?: string };

      if (!res.ok) {
        setError(data.message || "Could not update photos");
        return;
      }

      setProfile(data.data.profile);
    } catch {
      setError("Cannot reach API. Is the backend running?");
    } finally {
      setSaving(false);
    }
  }

  const avatarPreview = isRemote(avatarUrl) ? avatarUrl : null;
  const coverPreview = isRemote(coverUrl) ? coverUrl : null;

  return (
    <form onSubmit={onSave} className="flex flex-col gap-5">
      <div className="overflow-hidden rounded-lg border border-border bg-bg">
        <div className="relative h-24 w-full bg-bg-elevated">
          {coverPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverPreview}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <p className="flex h-full items-center justify-center text-xs text-text-muted">
              Cover preview
            </p>
          )}
        </div>
        <div className="relative px-4 pb-4">
          <div className="-mt-8 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-surface bg-surface text-sm font-semibold text-text-muted">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span>?</span>
            )}
          </div>
        </div>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-text-muted">Avatar URL</span>
        <input
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://…"
          className={inputClass}
        />
        <span className="text-xs text-text-muted">
          Paste an image link for now. File uploads come later.
        </span>
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-text-muted">Header / cover URL</span>
        <input
          type="url"
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
          placeholder="https://…"
          className={inputClass}
        />
      </label>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-text-inverse hover:bg-brand-hover disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save photos"}
      </button>
    </form>
  );
}
