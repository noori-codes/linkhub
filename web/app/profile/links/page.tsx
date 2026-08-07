"use client";

import { LinksPanel } from "@/components/dashboard/LinksPanel";
import { Loader } from "@/components/Loader";
import { useProfile } from "@/components/profile/ProfileProvider";

// Sidebar form for Links — opened from the main menu
export default function ProfileLinksPage() {
  const { links, setLinks, loading } = useProfile();

  if (loading) {
    return <Loader label="Loading links…" className="py-12" />;
  }

  return <LinksPanel initialLinks={links} onLinksChange={setLinks} />;
}
