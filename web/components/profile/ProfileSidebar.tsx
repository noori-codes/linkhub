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
export function ProfileSidebar() {
  const pathname = usePathname();
  const [username, setUsername] = useState("");

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
        /* shell still works without the chip */
      }
    }

    void loadUsername();
  }, []);

  const navList = (
    <ul className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:gap-0.5">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href, item.match);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={
                active
                  ? "block whitespace-nowrap rounded-md bg-brand-muted px-3 py-2 text-sm font-medium text-text"
                  : "block whitespace-nowrap rounded-md px-3 py-2 text-sm text-text-muted hover:bg-bg-elevated hover:text-text"
              }
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-border bg-surface lg:w-56 lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-2.5 px-4 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/linkhub-mark.png"
            alt="LinkHub"
            width={28}
            height={28}
            unoptimized
          />
          <span className="font-display text-sm font-semibold text-text">
            LinkHub
          </span>
        </Link>
      </div>

      <nav className="px-2 pb-3 lg:flex-1 lg:pb-4" aria-label="Profile">
        {navList}
      </nav>

      {username ? (
        <div className="mt-auto hidden border-t border-border px-3 py-3 lg:block">
          <p className="truncate text-xs text-text-muted">Your public page</p>
          <Link
            href={`/u/${username}`}
            className="mt-1 block truncate text-xs text-brand hover:text-brand-hover"
          >
            /u/{username}
          </Link>
        </div>
      ) : null}
    </aside>
  );
}
