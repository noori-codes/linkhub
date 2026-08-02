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
    <div className="rounded-[1.75rem] border border-border bg-bg p-2.5 shadow-[0_24px_48px_-28px_rgba(0,0,0,0.65)]">
      <div className="overflow-hidden rounded-[1.35rem] border border-border bg-bg-elevated px-5 pb-8 pt-10">
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
  const visible = links.slice(0, 4);

  return (
    <Link
      href={`/u/${profile.username}`}
      className="block w-full max-w-[280px] outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-brand"
      aria-label={`See ${name}'s live profile`}
    >
      <PhoneChrome>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border bg-surface text-lg font-semibold text-brand">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <span>{initials(name) || "?"}</span>
          )}
        </div>

        <p className="text-center font-display text-xl font-semibold tracking-tight text-text">
          {name}
        </p>
        <p className="mt-0.5 text-center text-xs text-text-muted">
          @{profile.username}
        </p>

        {profile.bio ? (
          <p className="mt-3 line-clamp-3 text-center text-sm leading-relaxed text-text-muted">
            {profile.bio}
          </p>
        ) : null}

        <ul className="mt-6 flex flex-col gap-2">
          {visible.length === 0 ? (
            <li className="text-center text-xs text-text-muted">No links yet</li>
          ) : (
            visible.map((link) => (
              <li
                key={link._id}
                className="truncate rounded-md border border-border bg-surface px-3 py-2.5 text-center text-sm font-medium text-text"
              >
                {link.title}
              </li>
            ))
          )}
        </ul>

        <p className="mt-8 text-center text-[10px] tracking-wide text-text-muted">
          Live · /u/{profile.username}
        </p>
      </PhoneChrome>
    </Link>
  );
}

function OfflineFallback() {
  return (
    <div className="w-full max-w-[280px]">
      <PhoneChrome>
        <p className="text-center text-sm text-text-muted">
          Live demo needs the API running and a published profile at{" "}
          <span className="text-text">/u/{LANDING_DEMO_USERNAME}</span>.
        </p>
        <Link
          href={`/u/${LANDING_DEMO_USERNAME}`}
          className="mt-6 block text-center text-sm font-medium text-brand hover:underline"
        >
          Open /u/{LANDING_DEMO_USERNAME} →
        </Link>
      </PhoneChrome>
    </div>
  );
}

/**
 * Landing hero product shot — real published profile from the API.
 * Falls back quietly if the backend is down or the demo user is unpublished.
 */
export async function LandingProfilePreview() {
  const demo = await getLandingDemo(LANDING_DEMO_USERNAME);

  if (!demo) {
    return <OfflineFallback />;
  }

  return <LiveProfile profile={demo.profile} links={demo.links} />;
}
