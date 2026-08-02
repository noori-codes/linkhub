"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ProfileEditor } from "@/components/dashboard/ProfileEditor";
import { ProfileHero } from "@/components/dashboard/ProfileHero";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { clearToken, getToken } from "@/lib/auth";
import type { ApiSuccess, PublicProfile } from "@/lib/types";

// About only — Links / Settings move in Steps 4–5
export default function ProfileAboutPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    async function loadProfile() {
      try {
        const res = await fetch(`${CLIENT_API_BASE}/api/v1/profiles/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        const data = (await res.json()) as ApiSuccess<{
          profile: PublicProfile;
        }> & { message?: string };

        if (!res.ok) {
          if (res.status === 401) {
            clearToken();
            router.replace("/login");
            return;
          }
          setError(data.message || "Could not load profile");
          if (res.status === 404) {
            router.replace("/onboarding");
          }
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
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <p className="text-text-muted">Loading your profile…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
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
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <ProfileHero profile={profile} />
      <ProfileEditor profile={profile} onProfileChange={setProfile} />
      <p className="text-sm text-text-muted">
        Next: manage{" "}
        <Link href="/profile/links" className="text-brand hover:text-brand-hover">
          links
        </Link>{" "}
        and{" "}
        <Link
          href="/profile/settings"
          className="text-brand hover:text-brand-hover"
        >
          settings
        </Link>{" "}
        from the sidebar.
      </p>
    </main>
  );
}
