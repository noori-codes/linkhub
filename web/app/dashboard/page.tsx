"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getToken } from "@/lib/auth";
import type { ApiSuccess, PublicProfile } from "@/lib/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3000";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();

    // No token → must log in first
    if (!token) {
      router.replace("/login");
      return;
    }

    async function loadProfile() {
      try {
        // Protected route: send JWT in Authorization header
        const res = await fetch(`${API_BASE}/api/v1/profiles/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const data = (await res.json()) as ApiSuccess<{
          profile: PublicProfile;
        }> & { message?: string };

        if (!res.ok) {
          setError(data.message || "Could not load profile");
          return;
        }

        setProfile(data.data.profile);
      } catch {
        setError("Cannot reach API. Is the backend running?");
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, [router]);

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

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-text-muted">Dashboard · read only for now</p>
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
              <span
                className={
                  profile.status === "published"
                    ? "text-brand"
                    : "text-text-muted"
                }
              >
                {profile.status}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      <div className="flex flex-wrap gap-3">
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
