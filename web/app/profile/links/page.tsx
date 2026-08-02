"use client";

import { LinksPanel } from "@/components/dashboard/LinksPanel";
import { useProfile } from "@/components/profile/ProfileProvider";

// Sidebar form for Links — opened from the main menu
export default function ProfileLinksPage() {
  const { links, setLinks, loading } = useProfile();

  if (loading) {
    return <p className="text-sm text-text-muted">Loading links…</p>;
  }

  return <LinksPanel initialLinks={links} onLinksChange={setLinks} />;
}
