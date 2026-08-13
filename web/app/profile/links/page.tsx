"use client";

import { LinksPanel } from "@/components/dashboard/LinksPanel";
import { Loader } from "@/components/Loader";
import { useProfile } from "@/components/profile/ProfileProvider";
export default function ProfileLinksPage() {
  const { links, setLinks, loading, profile } = useProfile();

  if (loading) {
    return <Loader label="Loading links…" className="py-12" />;
  }

  return (
    <LinksPanel
      key={profile?._id ?? "profile"}
      initialLinks={links}
      onLinksChange={setLinks}
    />
  );
}
