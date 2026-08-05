"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { FirstRunGuide } from "@/components/dashboard/FirstRunGuide";
import { PreviewShareActions } from "@/components/profile/PreviewShareActions";
import { PublicProfileView } from "@/components/profile/PublicProfileView";
import { useProfile } from "@/components/profile/ProfileProvider";

const MENU = [
  {
    href: "/profile/avatar",
    label: "Design",
    hint: "Photos",
    icon: "/avatar.svg",
  },
  {
    href: "/profile/about",
    label: "Profile",
    hint: "Name & bio",
    icon: "/about.svg",
  },
  {
    href: "/profile/links",
    label: "Links",
    hint: "Your list",
    icon: "/link.svg",
  },
  {
    href: "/profile/shop",
    label: "Shop",
    hint: "Products",
    icon: "/shop.svg",
  },
  {
    href: "/profile/analytics",
    label: "Analytics",
    hint: "Views & clicks",
    icon: "/analytics.svg",
  },
  {
    href: "/profile/settings",
    label: "Settings",
    hint: "Account",
    icon: "/settings.svg",
  },
];

function sectionTitle(pathname: string) {
  if (
    pathname.startsWith("/profile/avatar") ||
    pathname.startsWith("/profile/photos")
  )
    return "Design";
  if (pathname.startsWith("/profile/links")) return "Links";
  if (pathname.startsWith("/profile/shop")) return "Shop";
  if (pathname.startsWith("/profile/analytics")) return "Analytics";
  if (pathname.startsWith("/profile/settings")) return "Settings";
  if (pathname.startsWith("/profile/about")) return "Profile";
  return "Profile";
}

function sectionHint(pathname: string) {
  if (
    pathname.startsWith("/profile/avatar") ||
    pathname.startsWith("/profile/photos")
  ) {
    return "Avatar and cover — updates show instantly in the phone preview.";
  }
  if (pathname.startsWith("/profile/about")) {
    return "Name, username, and bio visitors see on your page.";
  }
  if (pathname.startsWith("/profile/analytics")) {
    return "Views and clicks from your published page.";
  }
  if (pathname.startsWith("/profile/shop")) {
    return "Products and affiliate buy links.";
  }
  if (pathname.startsWith("/profile/settings")) {
    return "Publish status, signature, and account.";
  }
  if (pathname.startsWith("/profile/links")) {
    return "Add, reorder, and show or hide your links.";
  }
  return "Edits update the live preview.";
}

function isActive(pathname: string, href: string) {
  if (href === "/profile/links") {
    return (
      pathname === "/profile/links" ||
      pathname === "/profile" ||
      pathname.startsWith("/profile/links/")
    );
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
 * Three-column dashboard (Linktree-style):
 * nav · editor · phone preview
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
    <div className="flex min-h-full flex-1 flex-col bg-bg lg:flex-row">
      {/* —— Left nav —— */}
      <aside className="flex w-full shrink-0 flex-col border-b border-border bg-surface lg:w-[13.5rem] lg:border-b-0 lg:border-r xl:w-60">
        <div className="flex items-center justify-between gap-2 px-4 py-4 lg:px-3">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/linkhub-mark.png"
              alt="LinkHub"
              width={28}
              height={28}
              unoptimized
            />
            <span className="font-display text-sm font-semibold tracking-tight text-text">
              LinkHub
            </span>
          </Link>
          <button
            type="button"
            className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-text-inverse lg:hidden"
            onClick={() => setPreviewOpen(true)}
          >
            Preview
          </button>
        </div>

        <nav
          className="flex gap-1 overflow-x-auto px-2 pb-2 lg:flex-1 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-3 lg:pb-3"
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
                    ? "flex shrink-0 items-center gap-3 rounded-xl bg-brand-muted px-3 py-2.5 text-text lg:py-2.5"
                    : "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-text-muted transition-colors hover:bg-bg hover:text-text lg:py-2.5"
                }
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    active ? "bg-surface shadow-sm" : "bg-bg"
                  }`}
                >
                  <Image
                    src={item.icon}
                    alt=""
                    width={16}
                    height={16}
                    className="opacity-80"
                  />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium leading-tight">
                    {item.label}
                  </span>
                  <span className="mt-0.5 hidden text-[11px] text-text-muted xl:block">
                    {item.hint}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden space-y-3 border-t border-border p-3 lg:block">
          {gettingStarted}
          <Link
            href="/"
            className="block rounded-lg px-3 py-2 text-xs font-medium text-text-muted transition-colors hover:bg-bg hover:text-text"
          >
            ← Home
          </Link>
        </div>
      </aside>

      {/* —— Center editor —— */}
      <main className="flex min-w-0 flex-1 flex-col bg-bg-elevated lg:border-r lg:border-border">
        <header className="border-b border-border px-5 py-5 sm:px-8">
          <div className="mx-auto flex w-full max-w-xl items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-text">
                {title}
              </h1>
              <p className="mt-1.5 text-sm text-text-muted">{hint}</p>
            </div>
            <button
              type="button"
              className="hidden shrink-0 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-text md:inline-flex lg:hidden"
              onClick={() => setPreviewOpen(true)}
            >
              Preview
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8">
          <div className="mx-auto w-full max-w-xl">{children}</div>
          {gettingStarted ? (
            <div className="mx-auto mt-8 w-full max-w-xl lg:hidden">
              {gettingStarted}
            </div>
          ) : null}
        </div>
      </main>

      {/* —— Right: phone preview —— */}
      <aside className="hidden min-w-0 flex-col bg-[linear-gradient(180deg,#e8eaef_0%,#f3f4f6_40%,#f3f4f6_100%)] lg:flex lg:w-[26rem] xl:w-[28rem]">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-text">Live preview</p>
            <p className="mt-0.5 text-xs text-text-muted">
              Updates as you edit
            </p>
          </div>
          {profile?.status === "published" ? (
            <span className="rounded-full bg-[#e8f6ee] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-success">
              Live
            </span>
          ) : (
            <span className="rounded-full bg-surface px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
              Draft
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col items-center overflow-y-auto px-6 pb-6 pt-2">
          <div className="w-full max-w-[20rem]">
            <div className="overflow-hidden rounded-[1.75rem] border-[6px] border-[#1c1f26] bg-surface shadow-[0_20px_50px_rgba(18,20,26,0.18)]">
              <div className="flex justify-center bg-[#1c1f26] pb-2 pt-2.5">
                <div className="h-1.5 w-16 rounded-full bg-[#3a3f4a]" />
              </div>
              <div className="max-h-[min(68vh,36rem)] overflow-y-auto bg-bg">
                {preview}
              </div>
            </div>
            {profile ? (
              <div className="mt-4">
                <PreviewShareActions
                  username={profile.username}
                  status={profile.status}
                />
              </div>
            ) : null}
          </div>
        </div>
      </aside>

      {previewOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-bg lg:hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-text">Preview</p>
            <button
              type="button"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-text-muted hover:text-text"
              onClick={() => setPreviewOpen(false)}
            >
              Close
            </button>
          </div>
          <div className="flex flex-1 justify-center overflow-y-auto px-4 py-6">
            <div className="w-full max-w-sm overflow-hidden rounded-[1.5rem] border-[5px] border-[#1c1f26] bg-surface shadow-lg">
              {preview}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
