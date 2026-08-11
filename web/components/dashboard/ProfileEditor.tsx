"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useProfile } from "@/components/profile/ProfileProvider";
import { Loader } from "@/components/Loader";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import { uiInput } from "@/lib/ui";
import type { ApiSuccess, PublicProfile } from "@/lib/types";

const inputClass = uiInput;
const SAVE_DEBOUNCE_MS = 450;
const USERNAME_CHECK_MS = 350;
const USERNAME_PATTERN = /^[a-z0-9._]+$/;

type UsernameStatus =
  | "idle"
  | "invalid"
  | "checking"
  | "available"
  | "taken"
  | "error";

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

function isValidUsername(value: string) {
  return (
    value.length >= 3 &&
    value.length <= 30 &&
    USERNAME_PATTERN.test(value)
  );
}

function UsernameTrailingStatus({ status }: { status: UsernameStatus }) {
  if (status === "checking") {
    return (
      <span
        className="mr-3 inline-block size-3.5 shrink-0 animate-spin rounded-full border-2 border-border border-t-text-muted"
        aria-hidden
      />
    );
  }

  if (status === "available") {
    return (
      <svg
        viewBox="0 0 16 16"
        className="mr-3 size-4 shrink-0 text-success"
        fill="none"
        aria-hidden
      >
        <path
          d="M3.5 8.5 6.5 11.5 12.5 4.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return <span className="w-3 shrink-0" aria-hidden />;
}

export function ProfileEditor() {
  const router = useRouter();
  const { profile, setProfile } = useProfile();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");

  const syncedKeyRef = useRef<string | null>(null);
  const displayNameRef = useRef("");
  const usernameRef = useRef("");
  const bioRef = useRef("");
  const tagsRef = useRef<string[]>([]);
  const usernameOkRef = useRef(true);
  const saveGenRef = useRef(0);
  const checkGenRef = useRef(0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileRef = useRef(profile);
  profileRef.current = profile;

  useEffect(() => {
    if (!profile) return;
    const key = profileFormKey(profile);
    if (syncedKeyRef.current === key) return;
    syncedKeyRef.current = key;
    setDisplayName(profile.displayName);
    setUsername(profile.username);
    setBio(profile.bio);
    setTags(profile.tags ?? []);
    displayNameRef.current = profile.displayName;
    usernameRef.current = profile.username;
    bioRef.current = profile.bio;
    tagsRef.current = profile.tags ?? [];
    usernameOkRef.current = true;
    setTagDraft("");
    setUsernameStatus("idle");
  }, [profile]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
    };
  }, []);

  async function checkUsername(candidate: string) {
    const current = profileRef.current;
    if (!current) return;

    if (!candidate) {
      setUsernameStatus("idle");
      usernameOkRef.current = false;
      return;
    }

    if (!isValidUsername(candidate)) {
      setUsernameStatus("invalid");
      usernameOkRef.current = false;
      return;
    }

    if (candidate === current.username) {
      setUsernameStatus("idle");
      usernameOkRef.current = true;
      return;
    }

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const gen = ++checkGenRef.current;
    setUsernameStatus("checking");
    usernameOkRef.current = false;

    try {
      const res = await fetch(
        `${CLIENT_API_BASE}/api/v1/profiles/username-available?username=${encodeURIComponent(candidate)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const data = (await res.json()) as ApiSuccess<{
        username: string;
        available: boolean;
        isCurrent: boolean;
      }> & { message?: string };

      if (gen !== checkGenRef.current || usernameRef.current !== candidate) {
        return;
      }

      if (!res.ok) {
        setUsernameStatus("error");
        usernameOkRef.current = false;
        return;
      }

      if (data.data.isCurrent) {
        setUsernameStatus("idle");
        usernameOkRef.current = true;
        schedulePersist();
      } else if (data.data.available) {
        setUsernameStatus("available");
        usernameOkRef.current = true;
        schedulePersist();
      } else {
        setUsernameStatus("taken");
        usernameOkRef.current = false;
      }
    } catch {
      if (gen !== checkGenRef.current) return;
      setUsernameStatus("error");
      usernameOkRef.current = false;
    }
  }

  function scheduleUsernameCheck(candidate: string) {
    if (checkTimerRef.current) clearTimeout(checkTimerRef.current);

    if (!candidate) {
      setUsernameStatus("idle");
      usernameOkRef.current = false;
      return;
    }

    if (!isValidUsername(candidate)) {
      setUsernameStatus("invalid");
      usernameOkRef.current = false;
      return;
    }

    const current = profileRef.current;
    if (current && candidate === current.username) {
      setUsernameStatus("idle");
      usernameOkRef.current = true;
      return;
    }

    setUsernameStatus("checking");
    usernameOkRef.current = false;
    checkTimerRef.current = setTimeout(() => {
      void checkUsername(candidate);
    }, USERNAME_CHECK_MS);
  }

  async function persistNow() {
    const current = profileRef.current;
    if (!current) return;

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const nextDisplayName = displayNameRef.current.trim();
    const nextUsername = usernameRef.current.trim().toLowerCase();
    const nextBio = bioRef.current.trim();
    const nextTags = tagsRef.current;
    const canSaveUsername =
      isValidUsername(nextUsername) && usernameOkRef.current;

    const body: Record<string, unknown> = {
      displayName: nextDisplayName,
      bio: nextBio,
      tags: nextTags,
    };

    if (canSaveUsername) {
      body.username = nextUsername;
    }

    const optimistic = {
      ...current,
      displayName: nextDisplayName,
      bio: nextBio,
      tags: nextTags,
      ...(canSaveUsername ? { username: nextUsername } : {}),
    };
    syncedKeyRef.current = profileFormKey(optimistic);
    setProfile(optimistic);

    const gen = ++saveGenRef.current;

    try {
      const res = await fetch(`${CLIENT_API_BASE}/api/v1/profiles/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = (await res.json()) as ApiSuccess<{
        profile: PublicProfile;
      }> & { message?: string };

      if (gen !== saveGenRef.current) return;

      if (!res.ok) {
        toast.error(data.message || "Could not update profile");
        if (data.message?.toLowerCase().includes("username")) {
          setUsernameStatus("taken");
          usernameOkRef.current = false;
        }
        return;
      }

      syncedKeyRef.current = profileFormKey(data.data.profile);
      setProfile(data.data.profile);
      if (canSaveUsername && data.data.profile.username === nextUsername) {
        setUsernameStatus("idle");
        usernameOkRef.current = true;
      }
    } catch {
      if (gen !== saveGenRef.current) return;
      toast.error("Cannot reach API. Is the backend running?");
    }
  }

  function schedulePersist(immediate = false) {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (immediate) {
      void persistNow();
      return;
    }
    saveTimerRef.current = setTimeout(() => {
      void persistNow();
    }, SAVE_DEBOUNCE_MS);
  }

  function onDisplayNameChange(value: string) {
    setDisplayName(value);
    displayNameRef.current = value;
    schedulePersist();
  }

  function onUsernameChange(value: string) {
    const next = value.toLowerCase();
    setUsername(next);
    usernameRef.current = next;
    scheduleUsernameCheck(next);
    schedulePersist();
  }

  function onBioChange(value: string) {
    setBio(value);
    bioRef.current = value;
    schedulePersist();
  }

  function addTag(raw: string) {
    const next = commitTag(tagsRef.current, raw);
    setTagDraft("");
    if (next === tagsRef.current) return;
    setTags(next);
    tagsRef.current = next;
    schedulePersist(true);
  }

  function removeTag(tag: string) {
    const next = tagsRef.current.filter((t) => t !== tag);
    if (next.length === tagsRef.current.length) return;
    setTags(next);
    tagsRef.current = next;
    schedulePersist(true);
  }

  if (!profile) {
    return <Loader label="Loading…" className="py-12" />;
  }

  const usernameHasError =
    usernameStatus === "taken" ||
    usernameStatus === "invalid" ||
    usernameStatus === "error";

  const usernameHint =
    usernameStatus === "checking"
      ? "Checking availability…"
      : usernameStatus === "available"
        ? "Available"
        : usernameStatus === "taken"
          ? "That username is already taken"
          : usernameStatus === "invalid"
            ? "Use 3–30 characters: a–z, 0–9, dots, underscores"
            : usernameStatus === "error"
              ? "Couldn’t verify username. Try again."
              : "Lowercase letters, numbers, dots, and underscores";

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(18,20,26,0.04)] sm:p-6">
      <div>
        <h2 className="text-sm font-semibold text-text">Public identity</h2>
        <p className="mt-1 text-xs text-text-muted">
          Updates when you stop typing.
        </p>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-text">Display name</span>
        <input
          type="text"
          maxLength={60}
          value={displayName}
          onChange={(e) => onDisplayNameChange(e.target.value)}
          className={inputClass}
        />
      </label>

      <div className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-text">Username</span>
        <div
          className={`flex items-center overflow-hidden rounded-xl border bg-bg focus-within:border-brand ${
            usernameHasError ? "border-danger" : "border-border"
          }`}
        >
          <span className="flex items-center px-3 text-sm text-text-muted">
            @
          </span>
          <input
            type="text"
            minLength={3}
            maxLength={30}
            pattern="[a-z0-9._]+"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            aria-invalid={usernameHasError}
            aria-describedby="username-status"
            aria-busy={usernameStatus === "checking"}
            className="min-w-0 flex-1 border-0 bg-transparent py-2.5 pr-2 text-sm text-text outline-none"
          />
          <UsernameTrailingStatus status={usernameStatus} />
        </div>
        <span
          id="username-status"
          className={`text-xs ${
            usernameHasError
              ? "text-danger"
              : usernameStatus === "available"
                ? "text-success"
                : "text-text-muted"
          }`}
          role="status"
          aria-live="polite"
        >
          {usernameHint}
        </span>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-text">Bio</span>
        <textarea
          maxLength={300}
          rows={4}
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
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
          Enter to add, click to remove. Up to 8.
        </span>
      </div>
    </div>
  );
}
