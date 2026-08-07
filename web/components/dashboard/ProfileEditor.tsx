"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useProfile } from "@/components/profile/ProfileProvider";
import { Loader } from "@/components/Loader";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import { uiBtnPrimary, uiInput } from "@/lib/ui";
import type { ApiSuccess, PublicProfile } from "@/lib/types";

const inputClass = uiInput;

export function ProfileEditor() {
  const router = useRouter();
  const { profile, setProfile } = useProfile();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName);
    setUsername(profile.username);
    setBio(profile.bio);
    setTagsText((profile.tags ?? []).join(", "));
  }, [profile]);

  if (!profile) {
    return <Loader label="Loading…" className="py-12" />;
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
    <form
      onSubmit={onSave}
      className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(18,20,26,0.04)] sm:p-6"
    >
      <div>
        <h2 className="text-sm font-semibold text-text">Public identity</h2>
        <p className="mt-1 text-xs text-text-muted">
          Shown on your page and in the phone preview.
        </p>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-text">Display name</span>
        <input
          type="text"
          maxLength={60}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-text">Username</span>
        <div className="flex overflow-hidden rounded-xl border border-border focus-within:border-brand">
          <span className="flex items-center bg-bg px-3 text-sm text-text-muted">
            @
          </span>
          <input
            type="text"
            required
            minLength={3}
            maxLength={30}
            pattern="[a-z0-9._]+"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            className="min-w-0 flex-1 border-0 bg-bg px-2 py-2.5 text-sm text-text outline-none"
          />
        </div>
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-text">Bio</span>
        <textarea
          maxLength={300}
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell visitors who you are…"
          className={`${inputClass} resize-y`}
        />
        <span className="text-xs text-text-muted">{bio.length}/300</span>
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-text">Tags</span>
        <input
          type="text"
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="Developer, Designer, Creator"
          className={inputClass}
        />
        <span className="text-xs text-text-muted">
          Comma-separated, up to 8. Visible in the editor preview.
        </span>
      </label>

      <button
        type="submit"
        disabled={saving}
        className={uiBtnPrimary}
      >
        {saving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
