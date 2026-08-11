"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { FirstRunGuide } from "@/components/dashboard/FirstRunGuide";
import { PhoneFrame } from "@/components/profile/PhoneFrame";
import { PreviewPublishControl } from "@/components/profile/PreviewPublishControl";
import { PreviewShareActions } from "@/components/profile/PreviewShareActions";
import { PublicProfileView } from "@/components/profile/PublicProfileView";
import { useProfile } from "@/components/profile/ProfileProvider";
import { PreviewSkeleton } from "@/components/Skeleton";

const MENU = [
  {
    href: "/profile/links",
    label: "Links",
    icon: "/link.svg",
  },
  {
    href: "/profile/about",
    label: "Profile",
    icon: "/about.svg",
  },
  {
    href: "/profile/avatar",
    label: "Design",
    icon: "/avatar.svg",
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
    href: "/profile/signature",
    label: "Signature",
    icon: "/signature.svg",
  },
  {
    href: "/profile/settings",
    label: "Settings",
    icon: "/settings.svg",
  },
];

function sectionTitle(pathname: string) {
  if (
    pathname === "/profile" ||
    pathname.startsWith("/profile/links")
  )
    return "Links";
  if (pathname.startsWith("/profile/about")) return "Profile";
  if (
    pathname.startsWith("/profile/avatar") ||
    pathname.startsWith("/profile/photos")
  )
    return "Design";
  if (pathname.startsWith("/profile/shop")) return "Shop";
  if (pathname.startsWith("/profile/analytics")) return "Analytics";
  if (pathname.startsWith("/profile/signature")) return "Signature";
  if (pathname.startsWith("/profile/settings")) return "Settings";
  return "Links";
}

function sectionHint(pathname: string) {
  if (
    pathname === "/profile" ||
    pathname.startsWith("/profile/links")
  ) {
    return "Add, reorder, and show or hide your links.";
  }
  if (pathname.startsWith("/profile/about")) {
    return "Photos, name, username, and bio visitors see on your page.";
  }
  if (
    pathname.startsWith("/profile/avatar") ||
    pathname.startsWith("/profile/photos")
  ) {
    return "Pick a theme and button shape — preview updates live.";
  }
  if (pathname.startsWith("/profile/shop")) {
    return "Products and affiliate buy links.";
  }
  if (pathname.startsWith("/profile/analytics")) {
    return "Views and clicks from your published page.";
  }
  if (pathname.startsWith("/profile/signature")) {
    return "Copy an HTML signature for your email client.";
  }
  if (pathname.startsWith("/profile/settings")) {
    return "Password and account.";
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

export function ProfileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, links, loading, error, setProfile } = useProfile();
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
      />
    ) : null;

  const preview = (
    <>
      {loading ? <PreviewSkeleton /> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {!loading && profile ? (
        <PublicProfileView
          profile={profile}
          links={links}
          variant="preview"
        />
      ) : null}
    </>
  );

  return (
    <div className="flex h-full flex-col bg-bg lg:flex-row">
      {/* Left — fixed column */}
      <aside className="flex w-full shrink-0 flex-col border-b border-border bg-surface lg:h-full lg:w-[13.5rem] lg:overflow-hidden lg:border-b-0 lg:border-r xl:w-60">
        <div className="flex shrink-0 items-center justify-between gap-2 px-4 py-4 lg:px-3">
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
          className="flex shrink-0 gap-1 overflow-x-auto px-2 pb-2 lg:flex-col lg:gap-0.5 lg:overflow-y-auto lg:px-2.5 lg:pb-3"
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
                    ? "flex shrink-0 items-center gap-2.5 rounded-lg bg-brand-muted px-3 py-2 text-text lg:py-2"
                    : "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-text-muted transition-colors hover:bg-bg hover:text-text lg:py-2"
                }
              >
                <Image
                  src={item.icon}
                  alt=""
                  width={16}
                  height={16}
                  className={active ? "opacity-100" : "opacity-70"}
                />
                <span
                  className={
                    active
                      ? "text-[13px] font-semibold tracking-tight"
                      : "text-[13px] font-medium tracking-tight"
                  }
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden shrink-0 border-t border-border p-3 lg:block">
          {gettingStarted}
        </div>
      </aside>

      {/* Center — only this column scrolls */}
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-bg-elevated lg:border-r lg:border-border">
        <header className="shrink-0 border-b border-border px-5 py-5 sm:px-8">
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

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
          <div className="mx-auto w-full max-w-xl">{children}</div>
          {gettingStarted ? (
            <div className="mx-auto mt-8 w-full max-w-xl lg:hidden">
              {gettingStarted}
            </div>
          ) : null}
        </div>
      </main>

      {/* Right — fixed column */}
      <aside className="hidden h-full min-w-0 shrink-0 flex-col overflow-hidden bg-[linear-gradient(165deg,#e6e9ef_0%,#f0f2f5_45%,#f3f4f6_100%)] lg:flex lg:w-[24rem] xl:w-[26rem]">
        <div className="flex shrink-0 items-center justify-between gap-3 px-5 py-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text">Live preview</p>
            <p className="mt-0.5 text-xs text-text-muted">
              Updates as you edit
            </p>
          </div>
          {profile ? (
            <PreviewPublishControl
              profile={profile}
              onProfileChange={setProfile}
            />
          ) : null}
        </div>
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 overflow-y-auto px-5 pb-6 pt-1">
          <PhoneFrame>{preview}</PhoneFrame>
          {profile ? (
            <PreviewShareActions
              username={profile.username}
              status={profile.status}
            />
          ) : null}
        </div>
      </aside>

      {previewOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-bg lg:hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <p className="shrink-0 text-sm font-semibold text-text">Preview</p>
            <div className="flex min-w-0 items-center gap-2">
              {profile ? (
                <PreviewPublishControl
                  profile={profile}
                  onProfileChange={setProfile}
                />
              ) : null}
              <button
                type="button"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-text-muted hover:text-text"
                onClick={() => setPreviewOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
          <div className="flex flex-1 flex-col items-center gap-5 overflow-y-auto px-4 py-6">
            <PhoneFrame>{preview}</PhoneFrame>
            {profile ? (
              <PreviewShareActions
                username={profile.username}
                status={profile.status}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
