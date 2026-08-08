import type { CSSProperties } from "react";

import type {
  ButtonShape,
  ProfileTheme,
  PublicProfile,
  ThemeTokens,
} from "@/lib/types";

export const DEFAULT_THEME_TOKENS: ThemeTokens = {
  backgroundColor: "#eef0f3",
  textColor: "#12141a",
  buttonColor: "#12141a",
  buttonTextColor: "#ffffff",
  fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
};

export const BUTTON_SHAPES: Array<{
  id: ButtonShape;
  label: string;
  radius: string;
}> = [
  { id: "square", label: "Square", radius: "0.5rem" },
  { id: "rounded", label: "Rounded", radius: "1rem" },
  { id: "pill", label: "Pill", radius: "9999px" },
];

export function resolveButtonShape(
  profile: Pick<PublicProfile, "buttonShape">,
): ButtonShape {
  const shape = profile.buttonShape;
  if (shape === "square" || shape === "rounded" || shape === "pill") {
    return shape;
  }
  return "rounded";
}

export function buttonRadius(shape: ButtonShape): string {
  return BUTTON_SHAPES.find((s) => s.id === shape)?.radius ?? "1rem";
}

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

export function themeIdOf(
  profile: Pick<PublicProfile, "theme">,
): string | null {
  if (!profile.theme) return null;
  if (typeof profile.theme === "string") return profile.theme;
  return profile.theme._id ?? null;
}

export function themeStyleVars(
  tokens: ThemeTokens,
  shape: ButtonShape = "rounded",
): CSSProperties {
  return {
    ["--profile-bg" as string]: tokens.backgroundColor,
    ["--profile-text" as string]: tokens.textColor,
    ["--profile-button" as string]: tokens.buttonColor,
    ["--profile-button-text" as string]: tokens.buttonTextColor,
    ["--profile-button-radius" as string]: buttonRadius(shape),
    ["--profile-text-muted" as string]: `color-mix(in srgb, ${tokens.textColor} 62%, ${tokens.backgroundColor})`,
    ["--profile-border" as string]: `color-mix(in srgb, ${tokens.textColor} 14%, ${tokens.backgroundColor})`,
    ["--profile-surface" as string]: `color-mix(in srgb, ${tokens.textColor} 6%, ${tokens.backgroundColor})`,
    backgroundColor: tokens.backgroundColor,
    color: tokens.textColor,
    fontFamily: tokens.fontFamily,
  };
}
