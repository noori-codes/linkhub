import { CLIENT_API_BASE } from "@/lib/client-api";

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

export const onboardingInputClass =
  "w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text outline-none transition-colors focus:border-brand";

export const onboardingPrimaryBtnClass =
  "w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-text-inverse hover:bg-brand-hover disabled:opacity-60";

export const onboardingCardClass =
  "flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(18,20,26,0.04)] sm:p-6";

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
      // Removed step — send anyone mid-flow to tags
      return "/onboarding/tags";
    case "tags":
      return "/onboarding/tags";
    case "done":
      return "/profile";
    default:
      return "/onboarding/about";
  }
}
