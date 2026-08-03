"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useProfile } from "@/components/profile/ProfileProvider";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import type { ApiSuccess, PublicProfile } from "@/lib/types";

const inputClass =
  "w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand";

// About fields — rendered inside the left sidebar
export function ProfileEditor() {
  const router = useRouter();
  const { profile, setProfile } = useProfile();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [saving, setSaving] = useState(false);

  // Sync local form when profile loads / updates from elsewhere
  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName);
    setUsername(profile.username);
    setBio(profile.bio);
    setTagsText((profile.tags ?? []).join(", "));
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
          tags: tagsText
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
            .slice(0, 8),
        }),
      });

      const data = (await res.json()) as ApiSuccess<{
        profile: PublicProfile;
      }> & { message?: string };

      if (!res.ok) {
        toast.error(data.message || "Could not update profile");
        return;
      }

      setProfile(data.data.profile);
      toast.success("Profile saved");
    } catch {
      toast.error("Cannot reach API. Is the backend running?");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSave} className="flex flex-col gap-4">
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

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-text-muted">About me</span>
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
        <span className="text-text-muted">Tags</span>
        <input
          type="text"
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="Developer, Designer, Creator"
          className={inputClass}
        />
        <span className="text-xs text-text-muted">
          Comma-separated, up to 8. Shown in your editor preview.
        </span>
      </label>

      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-text-inverse hover:bg-brand-hover disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
