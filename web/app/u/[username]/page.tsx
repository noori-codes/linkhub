import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { getPublicLinks, getPublicProfile } from "@/lib/api";

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

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function isRemoteAvatar(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;

  const [profile, links] = await Promise.all([
    getPublicProfile(username),
    getPublicLinks(username),
  ]);

  // Draft or missing profiles are not public
  if (!profile) {
    notFound();
  }

  const name = profile.displayName || profile.username;
  const showRemoteAvatar = isRemoteAvatar(profile.avatarUrl);

  return (
    <main className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      {/* Soft atmosphere — not a purple glow; warm amber wash + grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--brand-muted),transparent_55%)]"
      />
      <div
        aria-hidden
        className="page-grain pointer-events-none absolute inset-0"
      />

      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-10 pt-16 sm:pt-20">
        {/* Identity — brand-first: the person IS the hero */}
        <header className="mb-10 flex flex-col items-center text-center">
          <div className="mb-5 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-border bg-surface text-2xl font-semibold tracking-wide text-brand">
            {showRemoteAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{initials(name) || "?"}</span>
            )}
          </div>

          <h1 className="font-display text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            {name}
          </h1>
          <p className="mt-1 text-sm text-text-muted">@{profile.username}</p>

          {profile.bio ? (
            <p className="mt-4 max-w-sm text-base leading-relaxed text-text-muted">
              {profile.bio}
            </p>
          ) : null}

          {profile.tags.length > 0 ? (
            <ul className="mt-4 flex flex-wrap justify-center gap-2">
              {profile.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-sm border border-border px-2 py-0.5 text-xs uppercase tracking-wider text-text-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </header>

        {/* Links — full-width rows, not floating glass cards */}
        <section className="flex flex-col gap-3" aria-label="Links">
          {links.length === 0 ? (
            <p className="text-center text-sm text-text-muted">No links yet.</p>
          ) : (
            links.map((link) => (
              <a
                key={link._id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-md border border-border bg-surface px-4 py-3.5 text-center text-base font-medium text-text transition-colors duration-200 hover:border-brand hover:bg-bg-elevated"
              >
                <span className="transition-colors group-hover:text-brand">
                  {link.title}
                </span>
              </a>
            ))
          )}
        </section>

        <footer className="mt-auto flex flex-col items-center gap-2 pt-14">
          <Image
            src="/logo.png"
            alt="LinkHub"
            width={36}
            height={36}
            className="opacity-80"
          />
          <p className="text-xs tracking-wide text-text-muted">
            Powered by LinkHub
          </p>
        </footer>
      </div>
    </main>
  );
}
