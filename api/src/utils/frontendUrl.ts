const LOCAL_ORIGINS = [
  "http://localhost:3001",
  "http://127.0.0.1:3001",
];

function normalizeOrigin(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, "");
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** Public web origin used in verify/reset emails. */
export function getFrontendUrl(): string {
  const raw = process.env.FRONTEND_URL?.trim();
  if (!raw) return "http://127.0.0.1:3001";
  return normalizeOrigin(raw);
}

/** Browser CORS origins (http + https of FRONTEND_URL, plus local). */
export function getCorsOrigins(): string[] {
  const origins = new Set(LOCAL_ORIGINS);
  const raw = process.env.FRONTEND_URL?.trim();
  if (!raw) return [...origins];

  const httpsOrigin = normalizeOrigin(raw);
  origins.add(httpsOrigin);
  origins.add(
    httpsOrigin.startsWith("https://")
      ? `http://${httpsOrigin.slice("https://".length)}`
      : `https://${httpsOrigin.slice("http://".length)}`,
  );
  return [...origins];
}
