/** Stable object path for remote images (ignores presigned query params). */
export function imageObjectKey(url: string): string {
  if (!url) return "";
  try {
    return new URL(url).pathname;
  } catch {
    return url.split("?")[0]?.split("#")[0] ?? url;
  }
}

export function isRemoteImageUrl(url: string | undefined): boolean {
  return Boolean(url?.startsWith("http"));
}
