import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import type {
  AnalyticsSummary,
  ApiSuccess,
  PublicLink,
  PublicProfile,
  ShopProduct,
  ShopProductLink,
} from "@/lib/types";

export const queryKeys = {
  profileMe: ["profile", "me"] as const,
  linksMe: ["links", "me"] as const,
  analyticsMe: ["analytics", "me"] as const,
  productsMe: ["products", "me"] as const,
  themes: ["themes"] as const,
  productLinks: (productId: string) =>
    ["products", productId, "links"] as const,
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

export async function fetchMyProducts(): Promise<ShopProduct[]> {
  const token = requireToken();
  const res = await fetch(`${CLIENT_API_BASE}/api/v1/products/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = (await res.json()) as ApiSuccess<{ products: ShopProduct[] }> & {
    message?: string;
  };

  if (!res.ok) {
    throw new HttpError(json.message || "Could not load products", res.status);
  }

  return json.data.products;
}

export async function fetchProductLinks(
  productId: string,
): Promise<ShopProductLink[]> {
  const token = requireToken();
  const res = await fetch(
    `${CLIENT_API_BASE}/api/v1/products/${encodeURIComponent(productId)}/links`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  const json = (await res.json()) as ApiSuccess<{
    productLinks: ShopProductLink[];
  }> & { message?: string };

  if (!res.ok) {
    throw new HttpError(
      json.message || "Could not load product links",
      res.status,
    );
  }

  return json.data.productLinks;
}
