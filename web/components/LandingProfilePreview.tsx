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

const EDITOR_ITEMS = ["About", "Links", "Settings"] as const;

function EditorStrip() {
  return (
    <div
      className="hidden w-[9.5rem] shrink-0 flex-col rounded-xl border border-border bg-surface p-2 sm:flex"
      aria-hidden
    >
      <p className="px-2 pb-2 pt-1 text-[10px] font-medium uppercase tracking-wider text-text-muted">
        Edit
      </p>
      <div className="mb-2 px-2">
        <div className="flex items-center gap-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/linkhub-mark.png" alt="" width={14} height={14} />
          <span className="text-[11px] font-medium text-text">LinkHub</span>
        </div>
      </div>
      <ul className="flex flex-col gap-0.5">
        {EDITOR_ITEMS.map((label, i) => (
          <li
            key={label}
            className={`rounded-md px-2 py-1.5 text-[11px] ${
              i === 0
                ? "bg-bg font-medium text-text"
                : "text-text-muted"
            }`}
          >
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PhoneChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[1.75rem] border border-border bg-bg p-2.5 shadow-[0_20px_40px_-24px_rgba(18,20,26,0.35)]">
      <div className="overflow-hidden rounded-[1.35rem] border border-border bg-surface px-5 pb-8 pt-10">
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
      className="block w-full max-w-[260px] outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-text/20"
      aria-label={`See ${name}'s live profile`}
    >
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-text-muted sm:hidden">
        Preview
      </p>
      <PhoneChrome>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border bg-bg text-lg font-semibold text-text-muted">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <span>{initials(name) || "?"}</span>
          )}
        </div>

        <p className="text-center text-lg font-semibold tracking-tight text-text">
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
                className="truncate rounded-md border border-border bg-bg px-3 py-2.5 text-center text-sm font-medium text-text"
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
    <div className="w-full max-w-[260px]">
      <PhoneChrome>
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
      </PhoneChrome>
    </div>
  );
}

/**
 * Product shot: editor strip + live public preview.
 * Shows LinkHub’s real differentiator vs a links-only page.
 */
export async function LandingProfilePreview() {
  const demo = await getLandingDemo(LANDING_DEMO_USERNAME);

  return (
    <div className="flex items-center gap-3">
      <EditorStrip />
      <span
        className="hidden text-sm text-text-muted sm:inline"
        aria-hidden
      >
        →
      </span>
      <div className="flex flex-col">
        <p className="mb-2 hidden text-[10px] font-medium uppercase tracking-wider text-text-muted sm:block">
          Preview
        </p>
        {demo ? (
          <LiveProfile profile={demo.profile} links={demo.links} />
        ) : (
          <OfflineFallback />
        )}
      </div>
    </div>
  );
}
