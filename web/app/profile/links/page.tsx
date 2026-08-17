"use client";

import { LinksPanel } from "@/components/dashboard/LinksPanel";
import { useProfile } from "@/components/profile/ProfileProvider";
import { LinksSkeleton } from "@/components/Skeleton";

export default function ProfileLinksPage() {
  const { links, setLinks, loading, profile } = useProfile();

  if (loading) {
    return <LinksSkeleton />;
  }

  return (
    <LinksPanel
      key={profile?._id ?? "profile"}
      initialLinks={links}
      onLinksChange={setLinks}
    />
  );
}
