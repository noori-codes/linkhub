"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { ProfileHero } from "@/components/dashboard/ProfileHero";
import { useProfile } from "@/components/profile/ProfileProvider";

const MENU = [
  {
    href: "/profile/about",
    label: "About",
    icon: IconUser,
  },
  {
    href: "/profile/links",
    label: "Links",
    icon: IconLink,
  },
  {
    href: "/profile/settings",
    label: "Settings",
    icon: IconGear,
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
 * Logo header stays fixed; back sits under it on edit screens.
 */
export function ProfileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, loading, error } = useProfile();
  const isMenu = pathname === "/profile";
  const title = sectionTitle(pathname);

  return (
    <div className="flex min-h-full flex-1 flex-col lg:flex-row">
      <aside className="flex w-full shrink-0 flex-col border-b border-border bg-surface lg:min-h-full lg:w-[22rem] lg:border-b-0 lg:border-r xl:w-[24rem]">
        {/* Fixed brand header — same on menu and edit screens */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-4">
          <Image src="/logo.png" alt="LinkHub" width={28} height={28} />
          <span className="font-display text-sm font-semibold text-text">
            LinkHub
          </span>
        </div>

        {/* Back only when editing a section — below the logo */}
        {!isMenu ? (
          <div className="border-b border-border px-4 py-3">
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-brand"
            >
              <span aria-hidden className="text-base leading-none">
                ‹
              </span>
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
              {MENU.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-start gap-3 rounded-md px-3 py-3 transition-colors hover:bg-bg-elevated"
                  >
                    <span className="mt-0.5 text-text-muted">
                      <Icon />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-text">
                        {item.label}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto space-y-2 border-t border-border p-3">
              {profile ? (
                <Link
                  href={`/u/${profile.username}`}
                  className="flex items-center justify-between gap-2 rounded-md border border-border bg-bg px-2.5 py-2 text-xs text-text-muted transition-colors hover:border-brand hover:text-brand"
                >
                  <span className="truncate">/u/{profile.username}</span>
                  <span aria-hidden>↗</span>
                </Link>
              ) : null}
              <Link
                href="/"
                className="block px-2 py-1.5 text-xs text-text-muted hover:text-brand"
              >
                ← Home
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="border-b border-border px-4 py-4">
              <h1 className="font-display text-2xl font-semibold text-text">
                {title}
              </h1>
              <p className="mt-1 text-xs text-text-muted">
                Changes update the preview on the right.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
          </>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-bg-elevated">
        <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
          {loading ? (
            <p className="text-sm text-text-muted">Loading preview…</p>
          ) : null}
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {profile ? <ProfileHero profile={profile} /> : null}
        </div>
      </div>
    </div>
  );
}

function IconUser() {
  return (
    <Svg>
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </Svg>
  );
}

function IconLink() {
  return (
    <Svg>
      <path d="M9 12a4 4 0 0 1 0-5.7l1.4-1.4a4 4 0 0 1 5.7 5.7L15 12" />
      <path d="M15 12a4 4 0 0 1 0 5.7l-1.4 1.4a4 4 0 0 1-5.7-5.7L9 12" />
    </Svg>
  );
}

function IconGear() {
  return (
    <Svg>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.1M12 18.9V21M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M3 12h2.1M18.9 12H21M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5" />
    </Svg>
  );
}

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}
