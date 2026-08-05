import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const FETCH_TIMEOUT_MS = 15_000;
const MAX_HTML_BYTES = 1_500_000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const IMAGE_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export type LinkPreview = {
  url: string;
  title: string;
  description: string;
  imageUrl: string | null;
};

function isPrivateIp(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === "::1" || normalized === "0.0.0.0") return true;
  if (normalized.startsWith("127.") || normalized.startsWith("10.")) return true;
  if (normalized.startsWith("192.168.") || normalized.startsWith("169.254.")) {
    return true;
  }
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(normalized)) return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  if (normalized.startsWith("fe80:")) return true;
  return false;
}

async function assertPublicHttpUrl(raw: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("Please provide a valid URL.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http and https URLs are supported.");
  }

  const host = parsed.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local")
  ) {
    throw new Error("That URL is not allowed.");
  }

  const ipLiteral = isIP(host);
  if (ipLiteral && isPrivateIp(host)) {
    throw new Error("That URL is not allowed.");
  }

  if (!ipLiteral) {
    const records = await lookup(host, { all: true });
    if (records.length === 0 || records.some((r) => isPrivateIp(r.address))) {
      throw new Error("That URL is not allowed.");
    }
  }

  return parsed;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, num: string) =>
      String.fromCodePoint(Number.parseInt(num, 10)),
    );
}

function metaContent(html: string, keys: string[]): string {
  for (const key of keys) {
    const patterns = [
      new RegExp(
        `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`,
        "i",
      ),
      new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["'][^>]*>`,
        "i",
      ),
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) {
        return decodeHtmlEntities(match[1].trim());
      }
    }
  }
  return "";
}

function absoluteUrl(base: URL, maybeRelative: string): string | null {
  try {
    return new URL(maybeRelative, base).toString();
  } catch {
    return null;
  }
}

function isAmazonHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === "amazon.com" ||
    host.endsWith(".amazon.com") ||
    /^amazon\.[a-z.]+$/.test(host) ||
    /^www\.amazon\.[a-z.]+$/.test(host) ||
    host.includes("amazon.")
  );
}

/** Extract ASIN from common Amazon product URL shapes. */
function extractAmazonAsin(url: URL): string | null {
  const patterns = [
    /\/(?:dp|gp\/product|gp\/aw\/d|product)\/([A-Z0-9]{10})(?:[/?]|$)/i,
    /\/([A-Z0-9]{10})(?:[/?]|$)/i,
  ];

  for (const pattern of patterns) {
    const match = url.pathname.match(pattern);
    if (match?.[1] && /^[A-Z0-9]{10}$/i.test(match[1])) {
      return match[1].toUpperCase();
    }
  }

  const asinParam = url.searchParams.get("asin") || url.searchParams.get("ASIN");
  if (asinParam && /^[A-Z0-9]{10}$/i.test(asinParam)) {
    return asinParam.toUpperCase();
  }

  return null;
}

function titleFromAmazonPath(url: URL): string {
  const parts = url.pathname.split("/").filter(Boolean);
  // /Title-Slug/dp/ASIN
  const dpIndex = parts.findIndex((p) => p.toLowerCase() === "dp");
  const slug = dpIndex > 0 ? parts[dpIndex - 1] : undefined;
  if (!slug) return "";
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function amazonImageUrl(asin: string): string {
  return `https://m.media-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_SX500_.jpg`;
}

async function fetchText(url: URL): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": BROWSER_UA,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      },
    });

    if (!res.ok) {
      throw new Error("Could not load that page.");
    }

    const contentType = res.headers.get("content-type") || "";
    if (
      contentType &&
      !contentType.includes("text/html") &&
      !contentType.includes("application/xhtml")
    ) {
      throw new Error("That URL does not look like a product page.");
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.byteLength > MAX_HTML_BYTES) {
      throw new Error("That page is too large to preview.");
    }

    return buffer.toString("utf8");
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Timed out loading that page.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function previewFromHtml(url: URL, html: string): LinkPreview {
  const title =
    metaContent(html, ["og:title", "twitter:title"]) ||
    html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ||
    "";

  const description = metaContent(html, [
    "og:description",
    "twitter:description",
    "description",
  ]);

  const rawImage = metaContent(html, [
    "og:image",
    "og:image:url",
    "twitter:image",
    "twitter:image:src",
  ]);

  return {
    url: url.toString(),
    title: decodeHtmlEntities(title).slice(0, 120),
    description: description.slice(0, 1000),
    imageUrl: rawImage ? absoluteUrl(url, rawImage) : null,
  };
}

function amazonFallbackPreview(url: URL, asin: string): LinkPreview {
  return {
    url: url.toString(),
    title: titleFromAmazonPath(url) || `Amazon product ${asin}`,
    description: "",
    imageUrl: amazonImageUrl(asin),
  };
}

/** Fetch Open Graph metadata — with Amazon ASIN fallback (Amazon blocks bots). */
export async function fetchLinkPreview(rawUrl: string): Promise<LinkPreview> {
  const url = await assertPublicHttpUrl(rawUrl);
  const amazonAsin = isAmazonHost(url.hostname)
    ? extractAmazonAsin(url)
    : null;

  // Prefer ASIN CDN for Amazon — scraping usually hits a bot wall / timeout
  if (amazonAsin) {
    return amazonFallbackPreview(url, amazonAsin);
  }

  const html = await fetchText(url);
  const preview = previewFromHtml(url, html);

  if (!preview.imageUrl) {
    throw new Error(
      "No image found on that page. Try uploading a photo instead.",
    );
  }

  return preview;
}

export type DownloadedImage = {
  buffer: Buffer;
  contentType: string;
  ext: string;
};

/** Download a remote image after SSRF checks (for MinIO storage). */
export async function downloadRemoteImage(
  rawUrl: string,
): Promise<DownloadedImage> {
  const url = await assertPublicHttpUrl(rawUrl);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) {
      throw new Error("Could not download that image.");
    }

    let contentType = (res.headers.get("content-type") || "")
      .split(";")[0]
      ?.trim()
      .toLowerCase();

    // Some CDNs omit / lie about content-type; sniff from URL
    if (!contentType || !IMAGE_MIME_TO_EXT[contentType]) {
      if (/\.jpe?g(\?|$)/i.test(url.pathname)) contentType = "image/jpeg";
      else if (/\.png(\?|$)/i.test(url.pathname)) contentType = "image/png";
      else if (/\.webp(\?|$)/i.test(url.pathname)) contentType = "image/webp";
      else if (/\.gif(\?|$)/i.test(url.pathname)) contentType = "image/gif";
    }

    if (!contentType || !IMAGE_MIME_TO_EXT[contentType]) {
      throw new Error("That link did not return a supported image.");
    }

    const ext = IMAGE_MIME_TO_EXT[contentType];
    if (!ext) {
      throw new Error("That link did not return a supported image.");
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.byteLength === 0) {
      throw new Error("That image was empty.");
    }
    if (buffer.byteLength > MAX_IMAGE_BYTES) {
      throw new Error("That image is too large (max 5MB).");
    }

    return {
      buffer,
      contentType,
      ext,
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Timed out downloading that image.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
