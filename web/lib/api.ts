import type {
  ApiSuccess,
  PublicLink,
  PublicProfile,
  PublicShopCollection,
  PublicShopProduct,
} from "./types";

const API_BASE =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:3000";

async function getJson<T>(path: string): Promise<T | null> {
  let res: Response;

  try {
    res = await fetch(`${API_BASE}${path}`, {
      cache: "no-store",
    });
  } catch {
    throw new Error(
      `Cannot reach API at ${API_BASE}${path}. Start the backend with: cd api && yarn dev`,
    );
  }

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

export async function getPublicProducts(username: string) {
  const json = await getJson<ApiSuccess<{ products: PublicShopProduct[] }>>(
    `/api/v1/products/u/${encodeURIComponent(username)}`,
  );

  return json?.data.products ?? [];
}

export async function getPublicCollections(username: string) {
  const json = await getJson<
    ApiSuccess<{ collections: PublicShopCollection[] }>
  >(`/api/v1/collections/u/${encodeURIComponent(username)}`);

  return json?.data.collections ?? [];
}

