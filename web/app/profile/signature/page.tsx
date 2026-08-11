"use client";

import { EmailSignaturePanel } from "@/components/dashboard/EmailSignaturePanel";
import { Loader } from "@/components/Loader";
import { useProfile } from "@/components/profile/ProfileProvider";

export default function ProfileSignaturePage() {
  const { profile } = useProfile();

  if (!profile) {
    return <Loader label="Loading…" className="py-12" />;
  }

  return <EmailSignaturePanel profile={profile} />;
}
