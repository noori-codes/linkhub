import Link from "next/link";

import type { PublicProfile } from "@/lib/types";

type Props = {
  profile: PublicProfile;
};

function isRemote(url: string | undefined) {
  return Boolean(
    url && (url.startsWith("http://") || url.startsWith("https://")),
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

// Gravatar-like About header — cover, avatar, identity, primary actions
export function ProfileHero({ profile }: Props) {
  const name = profile.displayName || profile.username;
  const cover = isRemote(profile.coverUrl) ? profile.coverUrl! : null;
  const avatar = isRemote(profile.avatarUrl) ? profile.avatarUrl : null;

  return (
    <section className="lh-panel overflow-hidden rounded-xl">
      <div className="relative h-40 w-full bg-bg sm:h-48">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <div
            aria-hidden
            className="h-full w-full bg-[radial-gradient(ellipse_at_top,var(--brand-muted),transparent_70%)]"
          />
        )}
      </div>

      <div className="relative px-5 pb-7 pt-0 sm:px-8">
        <div className="-mt-14 mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-bg text-3xl font-semibold text-brand ring-1 ring-brand/20">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar}
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
        <p className="mt-1 text-sm tracking-wide text-text-muted">
          @{profile.username}
        </p>

        {profile.bio ? (
          <p className="mt-4 max-w-xl text-base leading-relaxed text-text-muted">
            {profile.bio}
          </p>
        ) : (
          <p className="mt-4 max-w-xl text-base text-text-muted">
            Add a short bio. Tell the world who you are and what you do.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={`/u/${profile.username}`}
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-text-inverse transition-colors hover:bg-brand-hover"
          >
            View public page
          </Link>
          <span className="rounded-md border border-border px-4 py-2 text-sm text-text-muted">
            {profile.status === "published" ? "Published" : "Draft"}
          </span>
        </div>
      </div>
    </section>
  );
}
