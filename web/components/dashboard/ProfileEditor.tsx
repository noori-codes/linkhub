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

const inputClass =
  "rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand";

// Full About form — lives under the hero on /profile
export function ProfileEditor({ profile, onProfileChange }: Props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [avatarUrl, setAvatarUrl] = useState(
    profile.avatarUrl?.startsWith("http") ? profile.avatarUrl : "",
  );
  const [coverUrl, setCoverUrl] = useState(profile.coverUrl ?? "");
  const [saving, setSaving] = useState(false);
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
          avatarUrl: avatarUrl.trim(),
          coverUrl: coverUrl.trim(),
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
      setDisplayName(saved.displayName);
      setUsername(saved.username);
      setBio(saved.bio);
      setAvatarUrl(saved.avatarUrl?.startsWith("http") ? saved.avatarUrl : "");
      setCoverUrl(saved.coverUrl ?? "");
    } catch {
      setError("Cannot reach API. Is the backend running?");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-md border border-border bg-surface p-5 sm:p-6">
      <h2 className="font-display text-xl font-semibold text-text">About</h2>
      <p className="mt-1 text-sm text-text-muted">
        Update how you appear on your public page.
      </p>

      <form onSubmit={onSave} className="mt-5 flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-text-muted">Display name</span>
            <input
              type="text"
              maxLength={60}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={inputClass}
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
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className={inputClass}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-text-muted">Bio</span>
          <textarea
            maxLength={300}
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell the world who you are…"
            className={`${inputClass} resize-y`}
          />
        </label>

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
            placeholder="https://… (background banner)"
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
          className="self-start rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-text-inverse hover:bg-brand-hover disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </section>
  );
}
