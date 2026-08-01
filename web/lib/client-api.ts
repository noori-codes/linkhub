// Browser-safe API origin (NEXT_PUBLIC_* is inlined into the client bundle)
export const CLIENT_API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3000";
