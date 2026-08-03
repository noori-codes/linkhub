import Image from "next/image";

import { PreviewShareActions } from "@/components/profile/PreviewShareActions";
import type { PublicLink, PublicProfile } from "@/lib/types";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function isRemote(url: string | undefined) {
  return Boolean(
    url && (url.startsWith("http://") || url.startsWith("https://")),
  );
}

type Props = {
  profile: PublicProfile;
  links: PublicLink[];
  /** page = visitor /u/... · preview = owner dashboard card */
  variant: "page" | "preview";
};

/**
 * One public profile UI — used by /u/[username] and the owner preview.
 * Change spacing/styles here so both stay in sync.
 */
export function PublicProfileView({ profile, links, variant }: Props) {
  const name = profile.displayName || profile.username;
  const avatar = isRemote(profile.avatarUrl) ? profile.avatarUrl : null;
  const cover = isRemote(profile.coverUrl) ? profile.coverUrl : null;
  const visible =
    variant === "preview"
      ? links.filter((link) => link.isVisible)
      : links;

  const avatarBorder =
    variant === "page" ? "border-bg" : "border-surface";

  const coverBlock = (
    <div className="relative z-0 h-52 w-full sm:h-64">
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt="" className="h-full w-full object-cover" />
      ) : (
        /* Neutral atmosphere — not an empty gray “broken” slot */
        <div
          aria-hidden
          className="h-full w-full bg-[linear-gradient(180deg,#e8ebf0_0%,#f3f4f6_100%)]"
        />
      )}
    </div>
  );

  const identity = (
    <header
      className={
        variant === "page"
          ? "mb-14 flex flex-col items-center text-center"
          : "mb-10 flex flex-col px-5 sm:px-8"
      }
    >
      <div
        className={`relative z-10 -mt-16 mb-7 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-[5px] ${avatarBorder} bg-surface text-4xl font-semibold tracking-wide text-text-muted sm:-mt-[4.5rem]`}
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span>{initials(name) || "?"}</span>
        )}
      </div>

      <h1 className="font-display text-3xl font-semibold tracking-tight text-text sm:text-4xl">
        {name}
      </h1>
      <p className="mt-2 text-sm tracking-wide text-text-muted">
        @{profile.username}
      </p>

      {profile.bio ? (
        <p
          className={`mt-5 text-sm leading-relaxed text-text-muted sm:text-[15px] ${
            variant === "page" ? "max-w-sm" : "max-w-xl"
          }`}
        >
          {profile.bio}
        </p>
      ) : variant === "preview" ? (
        <p className="mt-5 max-w-xl text-sm text-text-muted">
          Add a short bio. Tell the world who you are and what you do.
        </p>
      ) : null}

      {/* Tags: owner-only cue in preview; skip on public to keep identity clean */}
      {variant === "preview" && profile.tags.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {profile.tags.map((tag) => (
            <li
              key={tag}
              className="text-[10px] uppercase tracking-wider text-text-muted"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}

      {variant === "preview" ? (
        <PreviewShareActions
          username={profile.username}
          status={profile.status}
        />
      ) : null}
    </header>
  );

  const linkList = (
    <section
      className={`flex flex-col gap-2 ${
        variant === "preview" ? "px-5 pb-7 sm:px-8" : ""
      }`}
      aria-label="Links"
    >
      {visible.length === 0 ? (
        <p
          className={`text-sm text-text-muted ${
            variant === "page" ? "text-center" : ""
          }`}
        >
          {variant === "preview"
            ? "No visible links yet. Add some in the Links sidebar."
            : "No links yet."}
        </p>
      ) : (
        visible.map((link) => (
          <a
            key={link._id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-md border border-border bg-transparent px-4 py-3.5 text-center text-[15px] font-medium text-text transition-colors hover:bg-black/[0.03] hover:text-brand"
          >
            {link.title}
          </a>
        ))
      )}
    </section>
  );

  if (variant === "preview") {
    return (
      <div className="lh-panel overflow-hidden rounded-xl">
        {coverBlock}
        {identity}
        {linkList}
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-bg">
      {coverBlock}
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-12">
        {identity}
        {linkList}
        <footer className="mt-auto flex flex-col items-center gap-1.5 pt-20">
          <Image
            src="/linkhub-mark.png"
            alt="LinkHub"
            width={20}
            height={20}
            unoptimized
            className="opacity-60"
          />
          <p className="text-[11px] tracking-wide text-text-muted">
            Powered by LinkHub
          </p>
        </footer>
      </div>
    </div>
  );
}
