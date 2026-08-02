"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ChangePasswordForm } from "@/components/dashboard/ChangePasswordForm";
import { DashboardActions } from "@/components/dashboard/DashboardActions";
import { FirstRunGuide } from "@/components/dashboard/FirstRunGuide";
import { LinksPanel } from "@/components/dashboard/LinksPanel";
import { PhotosStrip } from "@/components/dashboard/PhotosStrip";
import { ProfileEditor } from "@/components/dashboard/ProfileEditor";
import { ProfileHero } from "@/components/dashboard/ProfileHero";
import { VerifyEmailBanner } from "@/components/dashboard/VerifyEmailBanner";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { clearToken, getToken } from "@/lib/auth";
import type {
  ApiSuccess,
  MeUser,
  PublicLink,
  PublicProfile,
} from "@/lib/types";

// Step 1: same UI as old /dashboard — Gravatar shell comes in later steps
export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [links, setLinks] = useState<PublicLink[]>([]);
  const [linkCount, setLinkCount] = useState(0);
  const [me, setMe] = useState<MeUser | null>(null);
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
        const authHeaders = { Authorization: `Bearer ${token}` };

        const [profileRes, linksRes, meRes] = await Promise.all([
          fetch(`${CLIENT_API_BASE}/api/v1/profiles/me`, {
            headers: authHeaders,
            cache: "no-store",
          }),
          fetch(`${CLIENT_API_BASE}/api/v1/links/me`, {
            headers: authHeaders,
            cache: "no-store",
          }),
          fetch(`${CLIENT_API_BASE}/api/v1/users/me`, {
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

        const meData = (await meRes.json()) as ApiSuccess<{
          user: MeUser;
        }> & { message?: string };

        if (!profileRes.ok) {
          // Stale JWT (e.g. switched localhost ↔ 127.0.0.1) — clear and re-login
          if (profileRes.status === 401) {
            clearToken();
            router.replace("/login");
            return;
          }
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
        setLinkCount(linksData.data.links.length);

        // Soft: if /me fails, still show page — just no banner
        if (meRes.ok) {
          setMe(meData.data.user);
        }
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
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-1">
        <p className="text-sm text-text-muted">Profile</p>
        <h1 className="font-display text-2xl font-semibold text-text sm:text-3xl">
          Your page
        </h1>
      </header>

      {me && !me.emailVerified ? (
        <VerifyEmailBanner email={me.email} />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <ProfileHero profile={profile} />
          <LinksPanel
            key={profile._id}
            initialLinks={links}
            onLinkCountChange={setLinkCount}
          />
          <PhotosStrip profile={profile} />
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          <FirstRunGuide
            hasAvatar={
              Boolean(profile.avatarUrl) &&
              (profile.avatarUrl.startsWith("http://") ||
                profile.avatarUrl.startsWith("https://"))
            }
            hasLinks={linkCount > 0}
            isPublished={profile.status === "published"}
            username={profile.username}
          />
          <ProfileEditor
            profile={profile}
            onProfileChange={setProfile}
          />
          <DashboardActions
            profile={profile}
            onProfileChange={setProfile}
          />
          <ChangePasswordForm />
        </aside>
      </div>
    </main>
  );
}
