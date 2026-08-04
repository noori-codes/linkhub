"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useProfile } from "@/components/profile/ProfileProvider";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import type { ApiSuccess, PublicProfile } from "@/lib/types";

const inputClass =
  "w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand";

/** Avatar + cover uploads. Live preview lives in the right column. */
export function PhotosEditor() {
  const router = useRouter();
  const { profile, setProfile } = useProfile();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [showUrlFields, setShowUrlFields] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setAvatarUrl(profile.avatarUrl?.startsWith("http") ? profile.avatarUrl : "");
    setCoverUrl(
      profile.coverUrl?.startsWith("http") ? profile.coverUrl : "",
    );
  }, [profile]);

  if (!profile) {
    return <p className="text-sm text-text-muted">Loading…</p>;
  }

  async function uploadImage(kind: "avatar" | "cover", file: File) {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const setUploading =
      kind === "avatar" ? setUploadingAvatar : setUploadingCover;
    const path = kind === "avatar" ? "avatar" : "cover";

    setUploading(true);

    try {
      const body = new FormData();
      body.append(kind, file);

      const res = await fetch(`${CLIENT_API_BASE}/api/v1/profiles/me/${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });

      const data = (await res.json()) as ApiSuccess<{
        profile: PublicProfile;
        avatarUrl?: string;
        coverUrl?: string;
      }> & { message?: string };

      if (!res.ok) {
        toast.error(data.message || `Could not upload ${kind}`);
        return;
      }

      setProfile(data.data.profile);
      if (kind === "avatar" && data.data.avatarUrl) {
        setAvatarUrl(data.data.avatarUrl);
        toast.success("Avatar uploaded");
      }
      if (kind === "cover" && data.data.coverUrl) {
        setCoverUrl(data.data.coverUrl);
        toast.success("Cover uploaded");
      }
    } catch {
      toast.error("Cannot reach API. Is the backend running?");
    } finally {
      setUploading(false);
      if (kind === "avatar" && avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
      if (kind === "cover" && coverInputRef.current) {
        coverInputRef.current.value = "";
      }
    }
  }

  async function onSaveUrls(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setSaving(true);

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
        toast.error(data.message || "Could not update photos");
        return;
      }

      setProfile(data.data.profile);
      toast.success("Photo URLs saved");
    } catch {
      toast.error("Cannot reach API. Is the backend running?");
    } finally {
      setSaving(false);
    }
  }

  const busy = uploadingAvatar || uploadingCover || saving;
  const hasAvatar = Boolean(avatarUrl.startsWith("http"));
  const hasCover = Boolean(coverUrl.startsWith("http"));

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-text">Profile photo</h2>
            <p className="mt-1 text-xs text-text-muted">
              Square crop works best · max 2 MB
            </p>
          </div>
          <span
            className={
              hasAvatar
                ? "text-[10px] uppercase tracking-wide text-brand"
                : "text-[10px] uppercase tracking-wide text-text-muted"
            }
          >
            {hasAvatar ? "set" : "missing"}
          </span>
        </div>

        <input
          ref={avatarInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadImage("avatar", file);
          }}
        />

        <button
          type="button"
          disabled={busy}
          onClick={() => avatarInputRef.current?.click()}
          className="mt-4 w-full rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-text-inverse hover:bg-brand-hover disabled:opacity-50"
        >
          {uploadingAvatar
            ? "Uploading…"
            : hasAvatar
              ? "Replace avatar"
              : "Upload avatar"}
        </button>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-text">Cover image</h2>
            <p className="mt-1 text-xs text-text-muted">
              Wide banner · max 5 MB
            </p>
          </div>
          <span
            className={
              hasCover
                ? "text-[10px] uppercase tracking-wide text-brand"
                : "text-[10px] uppercase tracking-wide text-text-muted"
            }
          >
            {hasCover ? "set" : "missing"}
          </span>
        </div>

        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadImage("cover", file);
          }}
        />

        <button
          type="button"
          disabled={busy}
          onClick={() => coverInputRef.current?.click()}
          className="mt-4 w-full rounded-md border border-border bg-bg px-4 py-2.5 text-sm font-medium text-text hover:border-brand disabled:opacity-50"
        >
          {uploadingCover
            ? "Uploading…"
            : hasCover
              ? "Replace cover"
              : "Upload cover"}
        </button>
      </section>

      <div>
        <button
          type="button"
          onClick={() => setShowUrlFields((open) => !open)}
          className="text-xs font-medium text-text-muted hover:text-text"
        >
          {showUrlFields ? "Hide URL paste" : "Or paste image URLs…"}
        </button>

        {showUrlFields ? (
          <form
            onSubmit={onSaveUrls}
            className="mt-3 flex flex-col gap-3 rounded-xl border border-border bg-surface p-4"
          >
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-text-muted">Avatar URL</span>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://…"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-text-muted">Cover URL</span>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://…"
                className={inputClass}
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-text-inverse hover:bg-brand-hover disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save URLs"}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
