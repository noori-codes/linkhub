"use client";

import { useEffect, useState } from "react";

import { ChangePasswordForm } from "@/components/dashboard/ChangePasswordForm";
import { DashboardActions } from "@/components/dashboard/DashboardActions";
import { FirstRunGuide } from "@/components/dashboard/FirstRunGuide";
import { VerifyEmailBanner } from "@/components/dashboard/VerifyEmailBanner";
import { useProfile } from "@/components/profile/ProfileProvider";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import type { ApiSuccess } from "@/lib/types";

type MeUser = {
  email: string;
  emailVerified: boolean;
};

/** Sidebar settings: checklist, verify, publish, password. */
export function SettingsPanel() {
  const { profile, links, setProfile } = useProfile();
  const [me, setMe] = useState<MeUser | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    async function loadMe() {
      try {
        const res = await fetch(`${CLIENT_API_BASE}/api/v1/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as ApiSuccess<{ user: MeUser }>;
        setMe(data.data.user);
      } catch {
        /* settings still usable without me */
      }
    }

    void loadMe();
  }, []);

  if (!profile) {
    return <p className="text-sm text-text-muted">Loading…</p>;
  }

  const hasAvatar = Boolean(
    profile.avatarUrl && profile.avatarUrl.startsWith("http"),
  );
  const hasLinks = links.some((link) => link.isVisible);
  const isPublished = profile.status === "published";

  return (
    <div className="flex flex-col gap-4">
      <FirstRunGuide
        hasAvatar={hasAvatar}
        hasLinks={hasLinks}
        isPublished={isPublished}
        username={profile.username}
      />

      {me && !me.emailVerified ? (
        <VerifyEmailBanner email={me.email} />
      ) : null}

      <DashboardActions profile={profile} onProfileChange={setProfile} />

      <ChangePasswordForm />
    </div>
  );
}
