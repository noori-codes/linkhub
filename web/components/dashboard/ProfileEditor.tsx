"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import type { ApiSuccess, PublicProfile } from "@/lib/types";

type Props = {
  profile: PublicProfile;
  onProfileChange: (profile: PublicProfile) => void;
};

// Owns displayName/username/bio drafts so the dashboard page stays thin
export function ProfileEditor({ profile, onProfileChange }: Props) {
  const router = useRouter();
  // Initial values come from props once on mount.
  // After a successful save we update drafts from the API response (below) —
  // no useEffect needed (and ESLint flags setState-inside-effect as a smell).
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [saving, setSaving] = useState(false);
  // Local error — shown under this form, not at the bottom of the page
  const [error, setError] = useState("");

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
          displayName: displayName.trim(),
          username: username.trim().toLowerCase(),
          bio: bio.trim(),
          // Empty string clears the avatar; paste any https image URL for now (S3 later)
          avatarUrl: avatarUrl.trim(),
        }),
      });

      const data = (await res.json()) as ApiSuccess<{
        profile: PublicProfile;
      }> & { message?: string };

      if (!res.ok) {
        setError(data.message || "Could not update profile");
        return;
      }

      const saved = data.data.profile;
      onProfileChange(saved);
      // Keep drafts in sync with what Mongo stored (trim/normalize, etc.)
      setDisplayName(saved.displayName);
      setUsername(saved.username);
      setBio(saved.bio);
      setAvatarUrl(saved.avatarUrl ?? "");
    } catch {
      setError("Cannot reach API. Is the backend running?");
    } finally {
      setSaving(false);
    }
  }

  const isPublished = profile.status === "published";
  const previewRemote =
    avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://");

  return (
    <section className="rounded-md border border-border bg-surface p-5">
      <form onSubmit={onSave} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-text-muted">Display name</span>
          <input
            type="text"
            maxLength={60}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="rounded-md border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-text-muted">Username</span>
          <input
            type="text"
            required
            minLength={3}
            maxLength={30}
            pattern="[a-z0-9._]+"
            title="Lowercase letters, numbers, dots, and underscores only"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            className="rounded-md border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
          />
          <span className="text-xs text-text-muted">
            Public URL: /u/{username || "…"}
            {username !== profile.username
              ? " — old URL stops working after save"
              : ""}
          </span>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-text-muted">Avatar URL</span>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://…"
            className="rounded-md border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
          />
          <span className="text-xs text-text-muted">
            Paste an image link for now. File upload (S3) comes later.
          </span>
          {previewRemote ? (
            <span className="mt-1 flex h-16 w-16 overflow-hidden rounded-full border border-border bg-bg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </span>
          ) : null}
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-text-muted">Bio</span>
          <textarea
            maxLength={300}
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="resize-y rounded-md border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
          />
        </label>

        <div className="text-sm">
          <p className="text-text-muted">Status</p>
          <p className="mt-1">
            <span className={isPublished ? "text-brand" : "text-text-muted"}>
              {profile.status}
            </span>
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {isPublished
              ? "Anyone can open your public page."
              : "Public page returns 404 until you publish."}
          </p>
        </div>

        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="self-start rounded-md border border-border px-4 py-2.5 text-sm font-medium text-text hover:border-brand disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </section>
  );
}
