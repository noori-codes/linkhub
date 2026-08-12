import { CLIENT_API_BASE } from "@/lib/client-api";
import { uiBtnPrimaryBlock, uiCard, uiInput } from "@/lib/ui";

export type OnboardingStepId =
  | "profile"
  | "about"
  | "socials"
  | "theme"
  | "links"
  | "tags";

/** Username is collected on signup; wizard starts at About. */
export type OnboardingWizardStepId = Exclude<OnboardingStepId, "profile">;

export const ONBOARDING_WIZARD_STEPS: Array<{
  id: OnboardingWizardStepId;
  label: string;
  href: string;
  apiStep: "profile" | "socials" | "theme" | "links" | "tags" | "done";
}> = [
  {
    id: "about",
    label: "About",
    href: "/onboarding/about",
    apiStep: "profile",
  },
  {
    id: "socials",
    label: "Platforms",
    href: "/onboarding/socials",
    apiStep: "socials",
  },
  { id: "links", label: "Links", href: "/onboarding/links", apiStep: "links" },
  { id: "theme", label: "Theme", href: "/onboarding/theme", apiStep: "theme" },
  { id: "tags", label: "Tags", href: "/onboarding/tags", apiStep: "tags" },
];

export function wizardStepIndex(id: OnboardingWizardStepId) {
  return ONBOARDING_WIZARD_STEPS.findIndex((s) => s.id === id);
}

export function nextWizardStep(id: OnboardingWizardStepId) {
  const i = wizardStepIndex(id);
  return i >= 0 ? ONBOARDING_WIZARD_STEPS[i + 1] : undefined;
}

export function prevWizardStep(id: OnboardingWizardStepId) {
  const i = wizardStepIndex(id);
  return i > 0 ? ONBOARDING_WIZARD_STEPS[i - 1] : undefined;
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
            data?: {
              themes?: Array<{
                _id: string;
                slug?: string;
                isDefault?: boolean;
              }>;
            };
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

export const onboardingFormClass = "flex flex-col gap-4";

export const onboardingCardClass = `${onboardingFormClass} ${uiCard}`;

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
