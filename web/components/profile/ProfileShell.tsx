"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import type { ApiSuccess, PublicProfile } from "@/lib/types";

const NAV = [
  { href: "/profile", label: "About", match: "exact" as const },
  { href: "/profile/links", label: "Links", match: "prefix" as const },
  { href: "/profile/settings", label: "Settings", match: "prefix" as const },
];

function isActive(pathname: string, href: string, match: "exact" | "prefix") {
  if (match === "exact") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Gravatar-style left nav — shared by all /profile/* pages
export function ProfileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    async function loadUsername() {
      try {
        const res = await fetch(`${CLIENT_API_BASE}/api/v1/profiles/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as ApiSuccess<{ profile: PublicProfile }>;
        setUsername(data.data.profile.username);
      } catch {
        /* shell still works without the public URL chip */
      }
    }

    void loadUsername();
  }, []);

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="flex items-center gap-2 border-b border-border px-4 py-4">
          <Image src="/logo.png" alt="LinkHub" width={28} height={28} />
          <span className="font-display text-sm font-semibold text-text">
            LinkHub
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="Profile">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href, item.match);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "rounded-md bg-brand-muted px-3 py-2 text-sm font-medium text-text"
                    : "rounded-md px-3 py-2 text-sm text-text-muted transition-colors hover:bg-bg-elevated hover:text-text"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {username ? (
          <div className="border-t border-border p-3">
            <p className="mb-1 text-[10px] uppercase tracking-wider text-text-muted">
              Public page
            </p>
            <Link
              href={`/u/${username}`}
              className="flex items-center justify-between gap-2 rounded-md border border-border bg-bg px-2.5 py-2 text-xs text-text-muted transition-colors hover:border-brand hover:text-brand"
            >
              <span className="truncate">/u/{username}</span>
              <span aria-hidden>↗</span>
            </Link>
          </div>
        ) : null}

        <div className="border-t border-border p-3">
          <Link
            href="/"
            className="block px-3 py-1.5 text-xs text-text-muted hover:text-brand"
          >
            ← Home
          </Link>
        </div>
      </aside>

      {/* Mobile top tabs */}
      <div className="border-b border-border bg-surface md:hidden">
        <div className="flex items-center gap-2 px-4 py-3">
          <Image src="/logo.png" alt="LinkHub" width={24} height={24} />
          <span className="font-display text-sm font-semibold text-text">
            LinkHub
          </span>
        </div>
        <nav
          className="flex gap-1 overflow-x-auto px-3 pb-3"
          aria-label="Profile"
        >
          {NAV.map((item) => {
            const active = isActive(pathname, item.href, item.match);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "shrink-0 rounded-md bg-brand-muted px-3 py-1.5 text-sm font-medium text-text"
                    : "shrink-0 rounded-md px-3 py-1.5 text-sm text-text-muted"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main canvas — soft elevated surface like Gravatar’s content area */}
      <div className="flex min-w-0 flex-1 flex-col bg-bg-elevated">
        {children}
      </div>
    </div>
  );
}
