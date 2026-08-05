import type { CSSProperties } from "react";

import type { ProfileTheme, PublicProfile, ThemeTokens } from "@/lib/types";

export const DEFAULT_THEME_TOKENS: ThemeTokens = {
  backgroundColor: "#eef0f3",
  textColor: "#12141a",
  buttonColor: "#12141a",
  buttonTextColor: "#ffffff",
  fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
};

export function isProfileTheme(
  theme: PublicProfile["theme"],
): theme is ProfileTheme {
  return Boolean(
    theme &&
      typeof theme === "object" &&
      "tokens" in theme &&
      theme.tokens &&
      typeof theme.tokens.backgroundColor === "string",
  );
}

export function resolveThemeTokens(
  profile: Pick<PublicProfile, "theme">,
): ThemeTokens {
  if (isProfileTheme(profile.theme)) {
    return { ...DEFAULT_THEME_TOKENS, ...profile.theme.tokens };
  }
  return DEFAULT_THEME_TOKENS;
}

export function themeIdOf(profile: Pick<PublicProfile, "theme">): string | null {
  if (!profile.theme) return null;
  if (typeof profile.theme === "string") return profile.theme;
  return profile.theme._id ?? null;
}

/** CSS variables applied to the public/preview profile root. */
export function themeStyleVars(tokens: ThemeTokens): CSSProperties {
  return {
    ["--profile-bg" as string]: tokens.backgroundColor,
    ["--profile-text" as string]: tokens.textColor,
    ["--profile-button" as string]: tokens.buttonColor,
    ["--profile-button-text" as string]: tokens.buttonTextColor,
    ["--profile-text-muted" as string]: `color-mix(in srgb, ${tokens.textColor} 62%, ${tokens.backgroundColor})`,
    ["--profile-border" as string]: `color-mix(in srgb, ${tokens.textColor} 14%, ${tokens.backgroundColor})`,
    ["--profile-surface" as string]: `color-mix(in srgb, ${tokens.textColor} 6%, ${tokens.backgroundColor})`,
    backgroundColor: tokens.backgroundColor,
    color: tokens.textColor,
    fontFamily: tokens.fontFamily,
  };
}
