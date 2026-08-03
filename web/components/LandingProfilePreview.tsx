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
    <div className="w-[min(100%,22rem)] rounded-[2rem] border border-border bg-bg p-3 shadow-[0_28px_56px_-28px_rgba(18,20,26,0.45)] transition-transform duration-300 ease-out hover:-translate-y-1 sm:w-[24rem]">
      <div className="overflow-hidden rounded-[1.55rem] border border-border bg-surface">
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
      className="block outline-none focus-visible:ring-2 focus-visible:ring-text/20"
      aria-label={`See ${name}'s live profile`}
    >
      <PhoneChrome>
        <div className="relative h-32 w-full bg-bg sm:h-36">
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

        <div className="px-6 pb-8">
          <div className="relative z-10 -mt-10 mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-[3px] border-surface bg-bg text-xl font-semibold text-text-muted">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span>{initials(name) || "?"}</span>
            )}
          </div>

          <p className="text-xl font-semibold tracking-tight text-text">
            {name}
          </p>
          <p className="mt-0.5 text-sm text-text-muted">@{profile.username}</p>

          {profile.bio ? (
            <p className="mt-2.5 line-clamp-2 text-[0.95rem] leading-relaxed text-text-muted">
              {profile.bio}
            </p>
          ) : null}

          <ul className="mt-6 flex flex-col gap-2.5">
            {visible.length === 0 ? (
              <li className="text-center text-sm text-text-muted">No links yet</li>
            ) : (
              visible.map((link) => (
                <li
                  key={link._id}
                  className="truncate rounded-lg border border-border px-3.5 py-3 text-center text-[0.95rem] font-medium text-text"
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
      <div className="px-6 py-12">
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
