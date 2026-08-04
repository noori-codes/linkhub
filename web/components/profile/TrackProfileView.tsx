"use client";

import { useEffect } from "react";

import { CLIENT_API_BASE } from "@/lib/client-api";

type Props = {
  username: string;
};

/**
 * Fire-and-forget profile view once per tab session.
 * sessionStorage avoids React Strict Mode double-count in dev.
 */
export function TrackProfileView({ username }: Props) {
  useEffect(() => {
    const key = `lh-profile-view:${username.toLowerCase()}`;

    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // private mode / blocked storage — still try once this mount
    }

    void fetch(
      `${CLIENT_API_BASE}/api/v1/analytics/u/${encodeURIComponent(username)}/view`,
      {
        method: "POST",
        keepalive: true,
      },
    ).catch(() => {
      // Never block the public page on analytics failures
    });
  }, [username]);

  return null;
}
