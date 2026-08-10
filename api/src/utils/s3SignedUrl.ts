import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { getS3Client, getS3Config } from "../config/s3.js";

const DEFAULT_EXPIRES_SECONDS = 60 * 60; // 1 hour

function signedUrlExpiresSeconds(): number {
  const raw = process.env.S3_SIGNED_URL_EXPIRES;
  if (!raw) return DEFAULT_EXPIRES_SECONDS;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_EXPIRES_SECONDS;
}

/** Drop query/hash so signed URLs can be matched back to our stored object URL. */
export function stripUrlQuery(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url.split("?")[0]?.split("#")[0] ?? url;
  }
}

/**
 * Object key if `url` points at our bucket public base; otherwise null.
 * Accepts already-signed URLs (query params ignored).
 */
export function keyFromOurPublicUrl(
  url: string | undefined,
  publicUrl?: string,
): string | null {
  if (!url) return null;

  let base: string;
  try {
    base = (publicUrl ?? getS3Config().publicUrl).replace(/\/$/, "");
  } catch {
    return null;
  }

  const cleaned = stripUrlQuery(url);
  const prefix = `${base}/`;
  if (!cleaned.startsWith(prefix)) return null;
  const key = cleaned.slice(prefix.length);
  return key || null;
}

/** Stable URL we store in Mongo (never store a signed URL). */
export function canonicalizeOurObjectUrl(
  url: string | undefined,
): string | undefined {
  if (url === undefined) return undefined;
  if (typeof url !== "string") return url;
  const trimmed = url.trim();
  if (!trimmed) return "";

  const key = keyFromOurPublicUrl(trimmed);
  if (!key) return stripUrlQuery(trimmed);

  try {
    const { publicUrl } = getS3Config();
    return `${publicUrl}/${key}`;
  } catch {
    return stripUrlQuery(trimmed);
  }
}

/** Presigned GET for a stored object URL; leaves non-S3 URLs unchanged. */
export async function signStoredObjectUrl(
  url: string | undefined | null,
): Promise<string | undefined> {
  if (!url) return url ?? undefined;

  const key = keyFromOurPublicUrl(url);
  if (!key) return url;

  try {
    const { bucket } = getS3Config();
    const s3 = getS3Client();
    return await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn: signedUrlExpiresSeconds() },
    );
  } catch (err) {
    console.warn("Could not sign S3 URL:", key, err);
    return url;
  }
}

type ProfileMedia = {
  avatarUrl?: string;
  coverUrl?: string;
};

export async function withSignedProfileMedia<T extends ProfileMedia>(
  profile: T,
): Promise<T> {
  const [avatarUrl, coverUrl] = await Promise.all([
    signStoredObjectUrl(profile.avatarUrl),
    signStoredObjectUrl(profile.coverUrl),
  ]);

  return {
    ...profile,
    ...(avatarUrl !== undefined ? { avatarUrl } : {}),
    ...(coverUrl !== undefined ? { coverUrl } : {}),
  };
}

type ProductMedia = {
  imageUrl?: string;
};

export async function withSignedProductMedia<T extends ProductMedia>(
  product: T,
): Promise<T> {
  const imageUrl = await signStoredObjectUrl(product.imageUrl);
  return {
    ...product,
    ...(imageUrl !== undefined ? { imageUrl } : {}),
  };
}

export async function withSignedProductMediaList<T extends ProductMedia>(
  products: T[],
): Promise<T[]> {
  return Promise.all(products.map((product) => withSignedProductMedia(product)));
}

function plainProfile(profile: unknown): Record<string, unknown> {
  if (
    profile &&
    typeof profile === "object" &&
    "toObject" in profile &&
    typeof (profile as { toObject: () => unknown }).toObject === "function"
  ) {
    return (profile as { toObject: () => Record<string, unknown> }).toObject();
  }
  return { ...(profile as Record<string, unknown>) };
}

export async function signedProfileJson(profile: unknown) {
  return withSignedProfileMedia(plainProfile(profile) as ProfileMedia & Record<string, unknown>);
}

export async function signedProductJson(product: unknown) {
  const plain =
    product &&
    typeof product === "object" &&
    "toObject" in product &&
    typeof (product as { toObject: () => unknown }).toObject === "function"
      ? (product as { toObject: () => ProductMedia & Record<string, unknown> }).toObject()
      : { ...(product as ProductMedia & Record<string, unknown>) };

  return withSignedProductMedia(plain);
}
