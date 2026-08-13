import type { QueryClient } from "@tanstack/react-query";

import { clearToken, saveToken } from "@/lib/auth";
import { clearDashboardCache } from "@/lib/dashboard-queries";

const AUTH_CHANGED_EVENT = "linkhub-auth-changed";

function notifyAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}

export function subscribeAuthChanges(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(AUTH_CHANGED_EVENT, onChange);
  return () => window.removeEventListener(AUTH_CHANGED_EVENT, onChange);
}

export function beginAuthSession(queryClient: QueryClient, token: string) {
  clearDashboardCache(queryClient);
  saveToken(token);
  notifyAuthChanged();
}

export function endAuthSession(queryClient: QueryClient) {
  clearDashboardCache(queryClient);
  clearToken();
  notifyAuthChanged();
}
