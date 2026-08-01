"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DashboardActions } from "@/components/dashboard/DashboardActions";
import { LinksPanel } from "@/components/dashboard/LinksPanel";
import { ProfileEditor } from "@/components/dashboard/ProfileEditor";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import type { ApiSuccess, PublicLink, PublicProfile } from "@/lib/types";

// Page job: auth gate + load data + compose sections.
// Feature logic lives in components/dashboard/* so this file stays readable.
export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [links, setLinks] = useState<PublicLink[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    async function loadDashboard() {
      try {
        const authHeaders = { Authorization: `Bearer ${token}` };

        const [profileRes, linksRes] = await Promise.all([
          fetch(`${CLIENT_API_BASE}/api/v1/profiles/me`, {
            headers: authHeaders,
            cache: "no-store",
          }),
          fetch(`${CLIENT_API_BASE}/api/v1/links/me`, {
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

        if (!profileRes.ok) {
          setError(profileData.message || "Could not load profile");
          if (profileRes.status === 404) {
            router.replace("/onboarding");
          }
          return;
        }
        if (!linksRes.ok) {
          setError(linksData.message || "Could not load links");
          return;
        }

        setProfile(profileData.data.profile);
        setLinks(linksData.data.links);
      } catch {
        setError("Cannot reach API. Is the backend running?");
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
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
        <p className="text-sm text-text-muted">Dashboard</p>
        <h1 className="font-display text-3xl font-semibold text-text">
          Your profile
        </h1>
      </header>

      <ProfileEditor
        profile={profile}
        onProfileChange={setProfile}
      />

      <LinksPanel key={profile._id} initialLinks={links} />

      <DashboardActions
        profile={profile}
        onProfileChange={setProfile}
      />
    </main>
  );
}
