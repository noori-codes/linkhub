import type { ApiSuccess, PublicLink, PublicProfile } from "./types";

// Server-side: talk to the Express API.
// Default assumes API on :3000 and Next on :3001.
const API_BASE =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3000";

async function getJson<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API_BASE}${path}`, {
    // Public profile data can refresh reasonably often while developing
    next: { revalidate: 30 },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`API ${path} failed with ${res.status}`);
  }

  return (await res.json()) as T;
}

export async function getPublicProfile(username: string) {
  const json = await getJson<ApiSuccess<{ profile: PublicProfile }>>(
    `/api/v1/profiles/u/${encodeURIComponent(username)}`,
  );

  return json?.data.profile ?? null;
}

export async function getPublicLinks(username: string) {
  const json = await getJson<ApiSuccess<{ links: PublicLink[] }>>(
    `/api/v1/links/u/${encodeURIComponent(username)}`,
  );

  return json?.data.links ?? [];
}
