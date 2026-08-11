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

function profileFormKey(profile: PublicProfile) {
  return [
    profile._id,
    profile.displayName,
    profile.username,
    profile.bio,
    (profile.tags ?? []).join("\u0001"),
  ].join("|");
}

function normalizeTag(raw: string) {
  const tag = raw.trim().replace(/^#/, "");
  if (!tag) return null;
  return tag.slice(0, 24);
}

function commitTag(list: string[], raw: string) {
  const normalized = normalizeTag(raw);
  if (!normalized) return list;
  if (list.some((t) => t.toLowerCase() === normalized.toLowerCase())) {
    return list;
  }
  return [...list, normalized].slice(0, 8);
}

export function ProfileEditor() {
  const router = useRouter();
  const { profile, setProfile } = useProfile();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const syncedKeyRef = useRef<string | null>(null);
  const tagsRef = useRef<string[]>([]);
  const tagsSaveGenRef = useRef(0);
  const profileRef = useRef(profile);
  profileRef.current = profile;

  useEffect(() => {
    if (!profile) return;
    // Ignore refetch-only changes (e.g. new signed avatar URLs) so local
    // edits aren't wiped before Save.
    const key = profileFormKey(profile);
    if (syncedKeyRef.current === key) return;
    syncedKeyRef.current = key;
    setDisplayName(profile.displayName);
    setUsername(profile.username);
    setBio(profile.bio);
    setTags(profile.tags ?? []);
    tagsRef.current = profile.tags ?? [];
    setTagDraft("");
  }, [profile]);

  async function persistTags(nextTags: string[]) {
    const current = profileRef.current;
    if (!current) return;

    setTags(nextTags);
    tagsRef.current = nextTags;

    const optimistic = { ...current, tags: nextTags };
    syncedKeyRef.current = profileFormKey(optimistic);
    setProfile(optimistic);

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const gen = ++tagsSaveGenRef.current;

    try {
      const res = await fetch(`${CLIENT_API_BASE}/api/v1/profiles/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tags: nextTags }),
      });

      const data = (await res.json()) as ApiSuccess<{
        profile: PublicProfile;
      }> & { message?: string };

      if (gen !== tagsSaveGenRef.current) return;

      if (!res.ok) {
        toast.error(data.message || "Could not update tags");
        const latest = profileRef.current;
        if (latest) {
          setTags(latest.tags ?? []);
          tagsRef.current = latest.tags ?? [];
        }
        return;
      }

      syncedKeyRef.current = profileFormKey(data.data.profile);
      setProfile(data.data.profile);
      setTags(data.data.profile.tags ?? []);
      tagsRef.current = data.data.profile.tags ?? [];
    } catch {
      if (gen !== tagsSaveGenRef.current) return;
      toast.error("Cannot reach API. Is the backend running?");
    }
  }

  function addTag(raw: string) {
    const next = commitTag(tagsRef.current, raw);
    setTagDraft("");
    if (next === tagsRef.current) return;
    void persistTags(next);
  }

  function removeTag(tag: string) {
    const next = tagsRef.current.filter((t) => t !== tag);
    if (next.length === tagsRef.current.length) return;
    void persistTags(next);
  }

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

    const tagsToSave = commitTag(tagsRef.current, tagDraft);
    if (tagsToSave !== tagsRef.current) {
      setTagDraft("");
      void persistTags(tagsToSave);
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
          tags: tagsToSave,
        }),
      });

      const data = (await res.json()) as ApiSuccess<{
        profile: PublicProfile;
      }> & { message?: string };

      if (!res.ok) {
        toast.error(data.message || "Could not update profile");
        return;
      }

      syncedKeyRef.current = profileFormKey(data.data.profile);
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

      <div className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-text">Tags</span>
        {tags.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag}>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-2 text-sm font-medium text-text shadow-[0_1px_2px_rgba(18,20,26,0.04)] hover:border-danger hover:text-danger"
                  title="Remove tag"
                >
                  {tag}
                  <span
                    aria-hidden
                    className="text-base leading-none text-text-muted"
                  >
                    ×
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <input
          type="text"
          value={tagDraft}
          onChange={(e) => setTagDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag(tagDraft);
            }
            if (e.key === "Backspace" && !tagDraft && tags.length > 0) {
              removeTag(tags[tags.length - 1]!);
            }
          }}
          maxLength={24}
          placeholder={
            tags.length >= 8 ? "Maximum 8 tags" : "Type a tag and press Enter"
          }
          disabled={tags.length >= 8}
          className={inputClass}
        />
        <span className="text-xs text-text-muted">
          Enter to add — updates the preview and saves right away. Up to 8.
        </span>
      </div>

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
