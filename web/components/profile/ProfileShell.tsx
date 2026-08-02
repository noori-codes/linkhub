"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ProfileHero } from "@/components/dashboard/ProfileHero";
import { ProfileLinksPreview } from "@/components/profile/ProfileLinksPreview";
import { useProfile } from "@/components/profile/ProfileProvider";

const MENU = [
  {
    href: "/profile/about",
    label: "About",
    icon: "/about.svg",
  },
  {
    href: "/profile/links",
    label: "Links",
    icon: "/link.svg",
  },
  {
    href: "/profile/settings",
    label: "Settings",
    icon: "/settings.svg",
  },
];

function sectionTitle(pathname: string) {
  if (pathname.startsWith("/profile/links")) return "Links";
  if (pathname.startsWith("/profile/settings")) return "Settings";
  if (pathname.startsWith("/profile/about")) return "About";
  return "Profile";
}

/**
 * Two sidebar modes (Gravatar-style):
 * 1) /profile        → main menu (About / Links / Settings)
 * 2) /profile/about… → section form + back to menu
 */
export function ProfileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, links, loading, error } = useProfile();
  const isMenu = pathname === "/profile";
  const title = sectionTitle(pathname);

  return (
    <div className="flex min-h-full flex-1 flex-col lg:flex-row">
      <aside className="relative z-10 flex w-full shrink-0 flex-col border-b border-border bg-surface lg:min-h-full lg:w-[22rem] lg:border-b-0 lg:border-r xl:w-[24rem]">
        <div className="flex items-center gap-2 border-b border-border px-4 py-4">
          <Image src="/logo.png" alt="LinkHub" width={28} height={28} />
          <span className="text-sm font-semibold tracking-wide text-text">
            LinkHub
          </span>
        </div>

        {!isMenu ? (
          <div className="border-b border-border px-4 py-3">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text"
            >
              <Image src="/back.svg" alt="" width={18} height={18} />
              Back
            </Link>
          </div>
        ) : null}

        {isMenu ? (
          <>
            <nav
              className="flex flex-1 flex-col gap-1 p-3"
              aria-label="Profile"
            >
              {MENU.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-bg"
                >
                  <Image
                    src={item.icon}
                    alt=""
                    width={18}
                    height={18}
                    className="opacity-80"
                  />
                  <span className="text-sm font-medium text-text">
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>

            <div className="mt-auto space-y-2 border-t border-border p-3">
              {profile ? (
                <Link
                  href={`/u/${profile.username}`}
                  className="flex items-center justify-between gap-2 rounded-md border border-border bg-bg px-2.5 py-2 text-xs text-text-muted transition-colors hover:text-text"
                >
                  <span className="truncate">/u/{profile.username}</span>
                  <span aria-hidden>↗</span>
                </Link>
              ) : null}
              <Link
                href="/"
                className="block px-2 py-1.5 text-xs text-text-muted hover:text-text"
              >
                ← Home
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="border-b border-border px-4 py-4">
              <h1 className="text-xl font-semibold text-text">{title}</h1>
              <p className="mt-1 text-xs text-text-muted">
                Changes update the preview on the right.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
          </>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-bg">
        <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
          {loading ? (
            <p className="text-sm text-text-muted">Loading preview…</p>
          ) : null}
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {profile ? (
            <>
              <ProfileHero profile={profile} />
              <ProfileLinksPreview links={links} />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
