import type { PublicProfile } from "@/lib/types";

type Props = {
  profile: PublicProfile;
};

function isRemote(url: string | undefined) {
  return Boolean(url && (url.startsWith("http://") || url.startsWith("https://")));
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

// Center-column hero — cover + avatar overlapping (Gravatar/Facebook vibe)
export function ProfileHero({ profile }: Props) {
  const name = profile.displayName || profile.username;
  const cover = isRemote(profile.coverUrl) ? profile.coverUrl! : null;
  const avatar = isRemote(profile.avatarUrl) ? profile.avatarUrl : null;

  return (
    <section className="overflow-hidden rounded-md border border-border bg-surface">
      {/* Cover / background picture */}
      <div className="relative h-40 w-full bg-bg-elevated sm:h-52">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="h-full w-full bg-[radial-gradient(ellipse_at_top,var(--brand-muted),transparent_70%)]"
          />
        )}
      </div>

      <div className="relative px-5 pb-5 pt-0">
        {/* Avatar sits on the cover edge */}
        <div className="-mt-12 mb-3 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-bg text-2xl font-semibold text-brand">
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

        <h2 className="font-display text-2xl font-semibold text-text">
          {name}
        </h2>
        <p className="text-sm text-text-muted">@{profile.username}</p>

        {profile.bio ? (
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            {profile.bio}
          </p>
        ) : (
          <p className="mt-3 text-sm text-text-muted">
            Add a bio in the sidebar to introduce yourself.
          </p>
        )}

        <p className="mt-3 text-xs text-text-muted">
          Status:{" "}
          <span
            className={
              profile.status === "published" ? "text-brand" : "text-text-muted"
            }
          >
            {profile.status}
          </span>
        </p>
      </div>
    </section>
  );
}
