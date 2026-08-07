import { CLIENT_API_BASE } from "@/lib/client-api";
import {
  uiBtnPrimaryBlock,
  uiCard,
  uiInput,
} from "@/lib/ui";

export type OnboardingStepId =
  | "profile"
  | "about"
  | "socials"
  | "theme"
  | "links"
  | "tags";

/** Ordered wizard screens (UI). Maps to user.onboardingStep where noted. */
export const ONBOARDING_STEPS: Array<{
  id: OnboardingStepId;
  label: string;
  href: string;
  /** Value stored on user.onboardingStep when entering / leaving this screen */
  apiStep: "profile" | "socials" | "theme" | "links" | "tags" | "done";
}> = [
  { id: "profile", label: "Username", href: "/onboarding", apiStep: "profile" },
  { id: "about", label: "About", href: "/onboarding/about", apiStep: "profile" },
  { id: "socials", label: "Socials", href: "/onboarding/socials", apiStep: "socials" },
  { id: "theme", label: "Theme", href: "/onboarding/theme", apiStep: "theme" },
  { id: "links", label: "Links", href: "/onboarding/links", apiStep: "links" },
  { id: "tags", label: "Tags", href: "/onboarding/tags", apiStep: "tags" },
];

export function stepIndex(id: OnboardingStepId) {
  return ONBOARDING_STEPS.findIndex((s) => s.id === id);
}

export function nextStep(id: OnboardingStepId) {
  const i = stepIndex(id);
  return i >= 0 ? ONBOARDING_STEPS[i + 1] : undefined;
}

export async function setOnboardingStep(
  token: string,
  step: "profile" | "socials" | "theme" | "links" | "tags" | "done",
) {
  await fetch(`${CLIENT_API_BASE}/api/v1/users/updateMe`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ onboardingStep: step }),
  });
}

export async function completeOnboarding(token: string) {
  await fetch(`${CLIENT_API_BASE}/api/v1/users/updateMe`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ onboardingCompleted: true }),
  });
}

/**
 * Skip rest of wizard → apply defaults (theme) and open dashboard.
 * Safe to call from any step once a profile exists.
 */
export async function skipToDashboard(token: string) {
  // Ensure Classic (or any default) theme if profile has none
  try {
    const profileRes = await fetch(`${CLIENT_API_BASE}/api/v1/profiles/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (profileRes.ok) {
      const profileJson = (await profileRes.json()) as {
        data?: { profile?: { theme?: unknown; displayName?: string } };
      };
      const profile = profileJson.data?.profile;
      const hasTheme = Boolean(
        profile?.theme &&
          (typeof profile.theme === "string" ||
            (typeof profile.theme === "object" &&
              profile.theme !== null &&
              "_id" in profile.theme)),
      );

      if (!hasTheme) {
        const themesRes = await fetch(`${CLIENT_API_BASE}/api/v1/themes`);
        if (themesRes.ok) {
          const themesJson = (await themesRes.json()) as {
            data?: { themes?: Array<{ _id: string; slug?: string; isDefault?: boolean }> };
          };
          const themes = themesJson.data?.themes ?? [];
          const fallback =
            themes.find((t) => t.slug === "classic") ??
            themes.find((t) => t.isDefault) ??
            themes[0];
          if (fallback) {
            await fetch(`${CLIENT_API_BASE}/api/v1/profiles/me`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ theme: fallback._id }),
            });
          }
        }
      }
    }
  } catch {
    /* still complete onboarding */
  }

  await completeOnboarding(token);
}

export const onboardingInputClass = uiInput;

export const onboardingPrimaryBtnClass = uiBtnPrimaryBlock;

export const onboardingCardClass = `flex flex-col gap-4 ${uiCard}`;

/** Where to send a user who logged in mid-wizard. */
export function resumeOnboardingHref(
  apiStep: string | undefined,
  hasProfile: boolean,
): string {
  if (!hasProfile) return "/onboarding";
  switch (apiStep) {
    case "profile":
      return "/onboarding/about";
    case "socials":
      return "/onboarding/socials";
    case "theme":
      return "/onboarding/theme";
    case "links":
      return "/onboarding/links";
    case "wallets":
      // Legacy step removed — send anyone mid-flow to tags
      return "/onboarding/tags";
    case "tags":
      return "/onboarding/tags";
    case "done":
      return "/profile";
    default:
      return "/onboarding/about";
  }
}
