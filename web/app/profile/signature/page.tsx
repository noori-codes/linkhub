"use client";

import { EmailSignaturePanel } from "@/components/dashboard/EmailSignaturePanel";
import { useProfile } from "@/components/profile/ProfileProvider";
import { FormSkeleton } from "@/components/Skeleton";

export default function ProfileSignaturePage() {
  const { profile } = useProfile();

  if (!profile) {
    return <FormSkeleton fields={4} />;
  }

  return <EmailSignaturePanel profile={profile} />;
}
