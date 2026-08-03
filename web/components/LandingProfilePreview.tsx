import Link from "next/link";

import { getLandingDemo } from "@/lib/api";
import { LANDING_DEMO_USERNAME } from "@/lib/demo";
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

function PhoneChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[280px] rounded-[1.75rem] border border-border bg-bg p-2.5 shadow-[0_20px_40px_-24px_rgba(18,20,26,0.35)]">
      <div className="overflow-hidden rounded-[1.35rem] border border-border bg-surface">
        {children}
      </div>
    </div>
  );
}

function LiveProfile({
  profile,
  links,
}: {
  profile: PublicProfile;
  links: PublicLink[];
}) {
  const name = profile.displayName || profile.username;
  const avatar = isRemote(profile.avatarUrl) ? profile.avatarUrl : null;
  const cover = isRemote(profile.coverUrl) ? profile.coverUrl : null;
  const visible = links.slice(0, 3);

  return (
    <Link
      href={`/u/${profile.username}`}
      className="block outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-text/20"
      aria-label={`See ${name}'s live profile`}
    >
      <PhoneChrome>
        <div className="relative h-24 w-full bg-bg">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="h-full w-full object-cover" />
          ) : (
            <div
              aria-hidden
              className="h-full w-full bg-[linear-gradient(180deg,#e8ebf0_0%,#f3f4f6_100%)]"
            />
          )}
        </div>

        <div className="px-5 pb-7">
          <div className="relative z-10 -mt-8 mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-[3px] border-surface bg-bg text-lg font-semibold text-text-muted">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span>{initials(name) || "?"}</span>
            )}
          </div>

          <p className="text-lg font-semibold tracking-tight text-text">
            {name}
          </p>
          <p className="mt-0.5 text-xs text-text-muted">@{profile.username}</p>

          {profile.bio ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-muted">
              {profile.bio}
            </p>
          ) : null}

          <ul className="mt-5 flex flex-col gap-2">
            {visible.length === 0 ? (
              <li className="text-center text-xs text-text-muted">No links yet</li>
            ) : (
              visible.map((link) => (
                <li
                  key={link._id}
                  className="truncate rounded-md border border-border px-3 py-2.5 text-center text-sm font-medium text-text"
                >
                  {link.title}
                </li>
              ))
            )}
          </ul>
        </div>
      </PhoneChrome>
    </Link>
  );
}

function OfflineFallback() {
  return (
    <PhoneChrome>
      <div className="px-5 py-10">
        <p className="text-center text-sm text-text-muted">
          Live demo needs the API and a published profile at{" "}
          <span className="text-text">/u/{LANDING_DEMO_USERNAME}</span>.
        </p>
        <Link
          href={`/u/${LANDING_DEMO_USERNAME}`}
          className="mt-6 block text-center text-sm font-medium text-brand hover:underline"
        >
          Open /u/{LANDING_DEMO_USERNAME} →
        </Link>
      </div>
    </PhoneChrome>
  );
}

/** Product shot: phone preview of a live public page. */
export async function LandingProfilePreview() {
  const demo = await getLandingDemo(LANDING_DEMO_USERNAME);

  return demo ? (
    <LiveProfile profile={demo.profile} links={demo.links} />
  ) : (
    <OfflineFallback />
  );
}
