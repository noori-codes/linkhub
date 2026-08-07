import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicProfileView } from "@/components/profile/PublicProfileView";
import { TrackProfileView } from "@/components/profile/TrackProfileView";
import {
  getPublicCollections,
  getPublicLinks,
  getPublicProducts,
  getPublicProfile,
} from "@/lib/api";

type PageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);

  if (!profile) {
    return { title: "Profile not found · LinkHub" };
  }

  const title = profile.displayName || profile.username;

  return {
    title: `${title} · LinkHub`,
    description: profile.bio || `${title} on LinkHub`,
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;

  const [profile, links, products, collections] = await Promise.all([
    getPublicProfile(username),
    getPublicLinks(username),
    getPublicProducts(username),
    getPublicCollections(username),
  ]);

  if (!profile) {
    notFound();
  }

  return (
    <main className="flex min-h-full flex-1 flex-col">
      <TrackProfileView username={profile.username} />
      <PublicProfileView
        profile={profile}
        links={links}
        products={products}
        collections={collections}
        variant="page"
      />
    </main>
  );
}
