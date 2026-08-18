import { CLIENT_API_BASE } from "@/lib/client-api";
import { isDemoUsername } from "@/lib/demo";

export function trackProfileShare(
  username: string,
  method: "copy" | "native" | "qr" | "open" = "copy",
) {
  if (isDemoUsername(username)) return;

  void fetch(
    `${CLIENT_API_BASE}/api/v1/analytics/u/${encodeURIComponent(username)}/share`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method }),
      keepalive: true,
    },
  ).catch(() => {
    /* ignore analytics failures */
  });
}
