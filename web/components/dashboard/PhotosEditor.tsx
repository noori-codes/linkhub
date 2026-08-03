"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
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

/** Avatar + cover uploads to MinIO/S3, with URL paste as a fallback. */
export function PhotosEditor() {
  const router = useRouter();
  const { profile, setProfile } = useProfile();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

  async function uploadImage(
    kind: "avatar" | "cover",
    file: File,
  ) {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const setUploading =
      kind === "avatar" ? setUploadingAvatar : setUploadingCover;
    const fieldName = kind;
    const path = kind === "avatar" ? "avatar" : "cover";

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const body = new FormData();
      body.append(fieldName, file);

      const res = await fetch(
        `${CLIENT_API_BASE}/api/v1/profiles/me/${path}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body,
        },
      );

      const data = (await res.json()) as ApiSuccess<{
        profile: PublicProfile;
        avatarUrl?: string;
        coverUrl?: string;
      }> & { message?: string };

      if (!res.ok) {
        setError(data.message || `Could not upload ${kind}`);
        return;
      }

      setProfile(data.data.profile);
      if (kind === "avatar" && data.data.avatarUrl) {
        setAvatarUrl(data.data.avatarUrl);
        setMessage("Avatar uploaded.");
      }
      if (kind === "cover" && data.data.coverUrl) {
        setCoverUrl(data.data.coverUrl);
        setMessage("Cover uploaded.");
      }
    } catch {
      setError("Cannot reach API. Is the backend running?");
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
    setMessage("");

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
      setMessage("Photos saved.");
    } catch {
      setError("Cannot reach API. Is the backend running?");
    } finally {
      setSaving(false);
    }
  }

  const avatarPreview = isRemote(avatarUrl) ? avatarUrl : null;
  const coverPreview = isRemote(coverUrl) ? coverUrl : null;
  const busy = uploadingAvatar || uploadingCover || saving;

  return (
    <form onSubmit={onSave} className="flex flex-col gap-5">
      <div className="overflow-hidden rounded-lg border border-border bg-bg">
        <div className="relative z-0 h-24 w-full bg-bg-elevated">
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
          <div className="relative z-10 -mt-8 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-surface bg-surface text-sm font-semibold text-text-muted">
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

      <div className="flex flex-col gap-2">
        <span className="text-sm text-text-muted">Avatar</span>
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
          className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text hover:bg-bg disabled:opacity-50"
        >
          {uploadingAvatar ? "Uploading…" : "Upload avatar"}
        </button>
        <p className="text-xs text-text-muted">Max 2 MB</p>
        <input
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="Or paste avatar URL…"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-text-muted">Header / cover</span>
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
          className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text hover:bg-bg disabled:opacity-50"
        >
          {uploadingCover ? "Uploading…" : "Upload cover"}
        </button>
        <p className="text-xs text-text-muted">Max 5 MB · wide banner works best</p>
        <input
          type="url"
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
          placeholder="Or paste cover URL…"
          className={inputClass}
        />
      </div>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-success" role="status">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-text-inverse hover:bg-brand-hover disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save pasted URLs"}
      </button>
    </form>
  );
}
