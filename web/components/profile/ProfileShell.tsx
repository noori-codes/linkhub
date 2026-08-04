"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { FirstRunGuide } from "@/components/dashboard/FirstRunGuide";
import { PublicProfileView } from "@/components/profile/PublicProfileView";
import { useProfile } from "@/components/profile/ProfileProvider";

const MENU = [
  {
    href: "/profile/avatar",
    label: "Avatar",
    icon: "/avatar.svg",
  },
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
    href: "/profile/shop",
    label: "Shop",
    icon: "/shop.svg",
  },
  {
    href: "/profile/analytics",
    label: "Analytics",
    icon: "/analytics.svg",
  },
  {
    href: "/profile/settings",
    label: "Settings",
    icon: "/settings.svg",
  },
];

function sectionTitle(pathname: string) {
  if (
    pathname.startsWith("/profile/avatar") ||
    pathname.startsWith("/profile/photos")
  )
    return "Avatar";
  if (pathname.startsWith("/profile/links")) return "Links";
  if (pathname.startsWith("/profile/shop")) return "Shop";
  if (pathname.startsWith("/profile/analytics")) return "Analytics";
  if (pathname.startsWith("/profile/settings")) return "Settings";
  if (pathname.startsWith("/profile/about")) return "About";
  return "Profile";
}

function sectionHint(pathname: string) {
  if (pathname.startsWith("/profile/analytics")) {
    return "Public link clicks from your published page.";
  }
  if (pathname.startsWith("/profile/shop")) {
    return "Products and buy / affiliate links for your page.";
  }
  if (pathname.startsWith("/profile/settings")) {
    return "Publish, signature, and account.";
  }
  return "Edits update the live preview.";
}

function isActive(pathname: string, href: string) {
  if (href === "/profile/about") {
    return pathname === "/profile/about" || pathname === "/profile";
  }
  if (href === "/profile/avatar") {
    return (
      pathname.startsWith("/profile/avatar") ||
      pathname.startsWith("/profile/photos")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Three-column dashboard:
 * nav (left) · editor (center) · public preview (right)
 */
export function ProfileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, links, loading, error } = useProfile();
  const [previewOpen, setPreviewOpen] = useState(false);

  const title = sectionTitle(pathname);
  const hint = sectionHint(pathname);

  const hasAvatar = Boolean(
    profile?.avatarUrl && profile.avatarUrl.startsWith("http"),
  );
  const hasLinks = links.some((link) => link.isVisible);
  const isPublished = profile?.status === "published";

  const gettingStarted =
    profile != null ? (
      <FirstRunGuide
        hasAvatar={hasAvatar}
        hasLinks={hasLinks}
        isPublished={isPublished}
        username={profile.username}
      />
    ) : null;

  const preview = (
    <>
      {loading ? (
        <p className="text-sm text-text-muted">Loading preview…</p>
      ) : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {profile ? (
        <PublicProfileView
          profile={profile}
          links={links}
          variant="preview"
        />
      ) : null}
    </>
  );

  return (
    <div className="flex min-h-full flex-1 flex-col lg:flex-row">
      {/* —— Left: persistent nav —— */}
      <aside className="flex w-full shrink-0 flex-col border-b border-border bg-surface lg:w-56 lg:border-b-0 lg:border-r xl:w-60">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/linkhub-mark.png"
              alt="LinkHub"
              width={28}
              height={28}
              unoptimized
            />
            <span className="text-sm font-semibold tracking-wide text-text">
              LinkHub
            </span>
          </Link>
          <button
            type="button"
            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-brand lg:hidden"
            onClick={() => setPreviewOpen(true)}
          >
            Preview
          </button>
        </div>

        <nav
          className="flex gap-1 overflow-x-auto p-2 lg:flex-1 lg:flex-col lg:overflow-visible lg:p-3"
          aria-label="Profile"
        >
          {MENU.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "flex shrink-0 items-center gap-2.5 rounded-lg bg-brand-muted px-3 py-2.5 text-sm font-medium text-text lg:gap-3"
                    : "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-bg hover:text-text lg:gap-3"
                }
              >
                <Image
                  src={item.icon}
                  alt=""
                  width={18}
                  height={18}
                  className="opacity-80"
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden space-y-3 border-t border-border p-3 lg:block">
          {gettingStarted}
          <Link
            href="/"
            className="block px-2 py-1.5 text-xs text-text-muted hover:text-text"
          >
            ← Home
          </Link>
        </div>
      </aside>

      {/* —— Center: open editor —— */}
      <main className="flex min-w-0 flex-1 flex-col border-border bg-bg-elevated lg:border-r">
        <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-text">
              {title}
            </h1>
            <p className="mt-1 text-xs text-text-muted">{hint}</p>
          </div>
          <button
            type="button"
            className="hidden shrink-0 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text md:inline-flex lg:hidden"
            onClick={() => setPreviewOpen(true)}
          >
            Preview
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="mx-auto w-full max-w-xl">{children}</div>
          {gettingStarted ? (
            <div className="mx-auto mt-6 w-full max-w-xl lg:hidden">
              {gettingStarted}
            </div>
          ) : null}
        </div>
      </main>

      {/* —— Right: live preview (desktop) —— */}
      <aside className="hidden min-w-0 flex-col bg-bg lg:flex lg:w-[24rem] xl:w-md">
        <div className="border-b border-border px-5 py-4">
          <p className="text-sm font-medium text-text">Preview</p>
          <p className="mt-0.5 text-xs text-text-muted">
            How your public page looks
          </p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-5">
          {preview}
        </div>
      </aside>

      {/* —— Mobile preview overlay —— */}
      {previewOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-bg lg:hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-medium text-text">Preview</p>
            <button
              type="button"
              className="rounded-md px-3 py-1.5 text-sm text-text-muted hover:text-text"
              onClick={() => setPreviewOpen(false)}
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-6">{preview}</div>
        </div>
      ) : null}
    </div>
  );
}
