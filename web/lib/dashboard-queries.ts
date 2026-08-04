import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import type { AnalyticsSummary, ApiSuccess, PublicLink, PublicProfile } from "@/lib/types";

export const queryKeys = {
  profileMe: ["profile", "me"] as const,
  linksMe: ["links", "me"] as const,
  analyticsMe: ["analytics", "me"] as const,
};

export class HttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

function requireToken() {
  const token = getToken();
  if (!token) {
    throw new HttpError("Please log in again.", 401);
  }
  return token;
}

export async function fetchMyProfile(): Promise<PublicProfile> {
  const token = requireToken();
  const res = await fetch(`${CLIENT_API_BASE}/api/v1/profiles/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = (await res.json()) as ApiSuccess<{ profile: PublicProfile }> & {
    message?: string;
  };

  if (!res.ok) {
    throw new HttpError(json.message || "Could not load profile", res.status);
  }

  return json.data.profile;
}

export async function fetchMyLinks(): Promise<PublicLink[]> {
  const token = requireToken();
  const res = await fetch(`${CLIENT_API_BASE}/api/v1/links/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = (await res.json()) as ApiSuccess<{ links: PublicLink[] }> & {
    message?: string;
  };

  if (!res.ok) {
    throw new HttpError(json.message || "Could not load links", res.status);
  }

  return json.data.links;
}

export async function fetchMyAnalytics(): Promise<AnalyticsSummary> {
  const token = requireToken();
  const res = await fetch(`${CLIENT_API_BASE}/api/v1/analytics/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = (await res.json()) as ApiSuccess<AnalyticsSummary> & {
    message?: string;
  };

  if (!res.ok) {
    throw new HttpError(json.message || "Could not load analytics", res.status);
  }

  return json.data;
}
