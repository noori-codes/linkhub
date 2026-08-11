"use client";

import { useEffect, useState } from "react";

import { ChangePasswordForm } from "@/components/dashboard/ChangePasswordForm";
import { EmailSignaturePanel } from "@/components/dashboard/EmailSignaturePanel";
import { VerifyEmailBanner } from "@/components/dashboard/VerifyEmailBanner";
import { Loader } from "@/components/Loader";
import { useProfile } from "@/components/profile/ProfileProvider";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import type { ApiSuccess } from "@/lib/types";

type MeUser = {
  email: string;
  emailVerified: boolean;
};

export function SettingsPanel() {
  const { profile } = useProfile();
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
    return <Loader label="Loading…" className="py-12" />;
  }

  return (
    <div className="flex flex-col gap-4">
      {me && !me.emailVerified ? (
        <VerifyEmailBanner email={me.email} />
      ) : null}

      <EmailSignaturePanel profile={profile} />

      <ChangePasswordForm />
    </div>
  );
}
