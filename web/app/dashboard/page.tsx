"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { getToken } from "@/lib/auth";
import type { ApiSuccess, PublicLink, PublicProfile } from "@/lib/types";

// NEXT_PUBLIC_* is baked into the browser bundle at build time —
// that's why the client can call the API directly (different port = cross-origin).
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3000";

export default function DashboardPage() {
  const router = useRouter();

  // --- State: what React "remembers" between renders ---
  // Each useState creates a box. Calling setX re-renders this component with the new value.
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [links, setLinks] = useState<PublicLink[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  // Separate flag so Publish doesn't blank the whole page — only that button feels busy
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  // Controlled inputs: React owns the value; onChange writes back into state.
  // Why not plain HTML? So we can clear the form after success, disable while saving, etc.
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  // Which link id is mid-request — so only that row's button shows "…"
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // useEffect = "run this after paint, when deps change"
  // [] would mean once on mount; [router] means if router identity changes (rare).
  // Purpose: gate the page + fetch owner data. Public /u/[username] never does this.
  useEffect(() => {
    const token = getToken();

    // JWT lives in localStorage (set at login). No token ⇒ not logged in.
    // We redirect instead of showing a broken empty dashboard.
    if (!token) {
      router.replace("/login");
      return;
    }

    async function loadDashboard() {
      try {
        // Same headers on both requests: "I am this user" (protect middleware on API).
        const authHeaders = {
          Authorization: `Bearer ${token}`,
        };

        // Promise.all = fire both at once, wait for both.
        // Why: profile and links don't depend on each other, so sequential would be slower.
        const [profileRes, linksRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/profiles/me`, {
            headers: authHeaders,
            cache: "no-store", // always fresh — status may have just changed
          }),
          fetch(`${API_BASE}/api/v1/links/me`, {
            headers: authHeaders,
            cache: "no-store",
          }),
        ]);

        const profileData = (await profileRes.json()) as ApiSuccess<{
          profile: PublicProfile;
        }> & { message?: string };

        const linksData = (await linksRes.json()) as ApiSuccess<{
          links: PublicLink[];
        }> & { message?: string };

        // Check each response — one can fail while the other succeeds
        if (!profileRes.ok) {
          setError(profileData.message || "Could not load profile");
          return;
        }
        if (!linksRes.ok) {
          setError(linksData.message || "Could not load links");
          return;
        }

        setProfile(profileData.data.profile);
        // Owner endpoint returns ALL links (including hidden). Public page only shows visible ones.
        setLinks(linksData.data.links);
      } catch {
        // Network error (API down, CORS, etc.) — fetch throws before we get a status code
        setError("Cannot reach API. Is the backend running?");
      } finally {
        // Always leave loading, success or fail — otherwise spinner forever
        setLoading(false);
      }
    }

    void loadDashboard();
  }, [router]);

  // PATCH = partial update. We only send { status }, not the whole profile.
  // Why read token again here? useEffect's token is scoped inside that function.
  // Click handlers run later — we re-read localStorage in case it changed (logout elsewhere).
  async function togglePublish() {
    if (!profile || saving) return;

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const nextStatus =
      profile.status === "published" ? "draft" : "published";

    setSaving(true);
    setActionError("");

    try {
      const res = await fetch(`${API_BASE}/api/v1/profiles/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json", // required when sending JSON body
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = (await res.json()) as ApiSuccess<{
        profile: PublicProfile;
      }> & { message?: string };

      if (!res.ok) {
        setActionError(data.message || "Could not update status");
        return;
      }

      // Server is source of truth (validators, defaults) — don't guess locally
      setProfile(data.data.profile);
    } catch {
      setActionError("Cannot reach API. Is the backend running?");
    } finally {
      setSaving(false);
    }
  }

  // POST = create a new resource (unlike PATCH which updates an existing one).
  // FormEvent: browser would normally reload the page on submit — we stop that.
  async function onAddLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (adding) return;

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setAdding(true);
    setAddError("");

    try {
      const res = await fetch(`${API_BASE}/api/v1/links`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // API sets profile from JWT + picks order if we omit it — send only what the user typed
        body: JSON.stringify({
          title: newTitle.trim(),
          url: newUrl.trim(),
        }),
      });

      const data = (await res.json()) as ApiSuccess<{
        link: PublicLink;
      }> & { message?: string };

      if (!res.ok) {
        setAddError(data.message || "Could not create link");
        return;
      }

      // Append the created link from the server (has _id, order, isVisible defaults)
      // [...links, new] = copy old array + new item (never mutate state arrays in place)
      setLinks((prev) => [...prev, data.data.link]);
      setNewTitle("");
      setNewUrl("");
    } catch {
      setAddError("Cannot reach API. Is the backend running?");
    } finally {
      setAdding(false);
    }
  }

  // PATCH one link by Mongo _id — same verb as publish, but URL includes :id
  // Purpose: soft-hide (still in DB + dashboard) without deleting
  async function toggleVisibility(link: PublicLink) {
    if (togglingId) return; // ignore double-clicks while any toggle is in flight

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setTogglingId(link._id);
    setActionError("");

    try {
      const res = await fetch(`${API_BASE}/api/v1/links/${link._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isVisible: !link.isVisible }),
      });

      const data = (await res.json()) as ApiSuccess<{
        link: PublicLink;
      }> & { message?: string };

      if (!res.ok) {
        setActionError(data.message || "Could not update link");
        return;
      }

      // Replace only the matching row — map returns a NEW array with one item swapped
      setLinks((prev) =>
        prev.map((item) =>
          item._id === data.data.link._id ? data.data.link : item,
        ),
      );
    } catch {
      setActionError("Cannot reach API. Is the backend running?");
    } finally {
      setTogglingId(null);
    }
  }

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center px-6">
        <p className="text-text-muted">Loading your profile…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-danger">{error}</p>
        <Link href="/" className="text-sm text-brand hover:text-brand-hover">
          Back home
        </Link>
      </main>
    );
  }

  if (!profile) {
    return null;
  }

  const isPublished = profile.status === "published";

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-text-muted">Dashboard</p>
        <h1 className="font-display text-3xl font-semibold text-text">
          Your profile
        </h1>
      </header>

      <section className="rounded-md border border-border bg-surface p-5">
        <dl className="flex flex-col gap-4 text-sm">
          <div>
            <dt className="text-text-muted">Display name</dt>
            <dd className="mt-1 text-base text-text">
              {profile.displayName || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">Username</dt>
            <dd className="mt-1 text-base text-text">@{profile.username}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Bio</dt>
            <dd className="mt-1 text-base text-text">{profile.bio || "—"}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Status</dt>
            <dd className="mt-1">
              <span className={isPublished ? "text-brand" : "text-text-muted"}>
                {profile.status}
              </span>
              <p className="mt-1 text-xs text-text-muted">
                {isPublished
                  ? "Anyone can open your public page."
                  : "Public page returns 404 until you publish."}
              </p>
            </dd>
          </div>
        </dl>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-xl font-semibold text-text">
            Your links
          </h2>
          <span className="text-xs text-text-muted">
            {links.length} total
          </span>
        </div>

        {/* Create form — same idea as login: controlled inputs → POST → update UI */}
        <form
          onSubmit={onAddLink}
          className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4"
        >
          <p className="text-xs text-text-muted">
            Title + URL only for now. The API assigns order and defaults type.
          </p>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-text-muted">Title</span>
            <input
              type="text"
              required
              maxLength={100}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="My portfolio"
              className="rounded-md border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-text-muted">URL</span>
            <input
              type="url"
              required
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://example.com"
              className="rounded-md border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
            />
          </label>
          {addError ? (
            <p className="text-sm text-danger">{addError}</p>
          ) : null}
          <button
            type="submit"
            disabled={adding}
            className="rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-text-inverse hover:bg-brand-hover disabled:opacity-50"
          >
            {adding ? "Adding…" : "Add link"}
          </button>
        </form>

        {links.length === 0 ? (
          <p className="text-sm text-text-muted">
            No links yet — add your first one above.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {links.map((link) => (
              <li
                key={link._id}
                className="rounded-md border border-border bg-surface px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text">
                      {link.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-text-muted">
                      {link.url}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span
                      className={
                        link.isVisible
                          ? "text-xs text-brand"
                          : "text-xs text-text-muted"
                      }
                    >
                      {link.isVisible ? "visible" : "hidden"}
                    </span>
                    {/* type="button" so this never accidentally submits the Add form */}
                    <button
                      type="button"
                      disabled={togglingId === link._id}
                      onClick={() => void toggleVisibility(link)}
                      className="text-xs text-text-muted underline-offset-2 hover:text-brand hover:underline disabled:opacity-50"
                    >
                      {togglingId === link._id
                        ? "…"
                        : link.isVisible
                          ? "Hide"
                          : "Show"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {actionError ? (
        <p className="text-sm text-danger">{actionError}</p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void togglePublish()}
          disabled={saving}
          className="rounded-md border border-border px-4 py-2.5 text-sm font-medium text-text hover:border-brand disabled:opacity-50"
        >
          {saving
            ? "Saving…"
            : isPublished
              ? "Unpublish (draft)"
              : "Publish"}
        </button>
        <Link
          href={`/u/${profile.username}`}
          className="rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-text-inverse hover:bg-brand-hover"
        >
          View public page
        </Link>
        <Link
          href="/"
          className="rounded-md border border-border px-4 py-2.5 text-sm font-medium text-text hover:border-brand"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
