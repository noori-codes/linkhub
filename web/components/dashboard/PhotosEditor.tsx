"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useProfile } from "@/components/profile/ProfileProvider";
import { Loader } from "@/components/Loader";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import { uiBtnPrimary, uiInput } from "@/lib/ui";
import type { ApiSuccess, PublicProfile } from "@/lib/types";

const inputClass = uiInput;

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
    setAvatarUrl(
      profile.avatarUrl?.startsWith("http") ? profile.avatarUrl : "",
    );
    setCoverUrl(profile.coverUrl?.startsWith("http") ? profile.coverUrl : "");
  }, [profile]);

  if (!profile) {
    return <Loader label="Loading…" className="py-12" />;
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
  const initials = (profile.displayName || profile.username || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="flex flex-col gap-5">
      {/* Cover + avatar */}
      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(18,20,26,0.04)]">
        <button
          type="button"
          disabled={busy}
          onClick={() => coverInputRef.current?.click()}
          className="group relative block w-full text-left disabled:opacity-60"
        >
          <div className="relative h-36 w-full bg-[linear-gradient(135deg,#dfe4ec,#eef0f4)] sm:h-44">
            {hasCover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : null}
            {/* Label stays top-right so the overlapping avatar never covers it */}
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-black/25 transition-[background] group-hover:from-black/50" />
            <div className="absolute top-3 right-3 max-w-[11rem] rounded-lg bg-black/50 px-3 py-2 text-right backdrop-blur-sm sm:max-w-none">
              <p className="text-sm font-semibold text-white">Cover image</p>
              <p className="mt-0.5 text-xs text-white/80">
                {uploadingCover
                  ? "Uploading…"
                  : hasCover
                    ? "Click to replace · max 5 MB"
                    : "Click to upload · max 5 MB"}
              </p>
            </div>
          </div>
        </button>

        <div className="flex items-end gap-4 px-5 pb-5 pt-0">
          <button
            type="button"
            disabled={busy}
            onClick={() => avatarInputRef.current?.click()}
            className="group relative -mt-10 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-bg shadow-md transition-transform hover:scale-[1.02] disabled:opacity-60 sm:-mt-12 sm:h-24 sm:w-24"
            aria-label={hasAvatar ? "Replace avatar" : "Upload avatar"}
          >
            {hasAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl font-semibold text-text-muted">
                {initials || "?"}
              </span>
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-[11px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
              {uploadingAvatar ? "…" : "Edit"}
            </span>
          </button>

          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3 pb-1 pt-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-text">Profile photo</h2>
              <p className="mt-0.5 text-xs text-text-muted">
                Square crop works best · max 2 MB
              </p>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => avatarInputRef.current?.click()}
              className={uiBtnPrimary}
            >
              {uploadingAvatar
                ? "Uploading…"
                : hasAvatar
                  ? "Replace"
                  : "Upload"}
            </button>
          </div>
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
      </section>

      {/* URL fallback — clearer affordance */}
      <section className="rounded-2xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(18,20,26,0.04)] sm:p-5">
        <button
          type="button"
          onClick={() => setShowUrlFields((open) => !open)}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <div>
            <p className="text-sm font-semibold text-text">
              Paste image URLs instead
            </p>
            <p className="mt-0.5 text-xs text-text-muted">
              Use a direct https link if you already host the files
            </p>
          </div>
          <span className="text-xs font-semibold text-brand">
            {showUrlFields ? "Hide" : "Show"}
          </span>
        </button>

        {showUrlFields ? (
          <form
            onSubmit={onSaveUrls}
            className="mt-4 flex flex-col gap-3 border-t border-border pt-4"
          >
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-text">Avatar URL</span>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://…"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-text">Cover URL</span>
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
              className={uiBtnPrimary}
            >
              {saving ? "Saving…" : "Save URLs"}
            </button>
          </form>
        ) : null}
      </section>
    </div>
  );
}
