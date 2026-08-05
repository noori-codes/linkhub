import type { IThemeTokens } from "../models/theme.model.js";

export type ThemeSeed = {
  name: string;
  slug: string;
  isDefault: boolean;
  tokens: IThemeTokens;
};

/** Built-in appearance presets — upserted on API start. */
export const THEME_SEEDS: ThemeSeed[] = [
  {
    name: "Classic",
    slug: "classic",
    isDefault: true,
    tokens: {
      backgroundColor: "#eef0f3",
      textColor: "#12141a",
      buttonColor: "#12141a",
      buttonTextColor: "#ffffff",
      fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
    },
  },
  {
    name: "Midnight",
    slug: "midnight",
    isDefault: false,
    tokens: {
      backgroundColor: "#0f1115",
      textColor: "#f0f2f5",
      buttonColor: "#f0f2f5",
      buttonTextColor: "#0f1115",
      fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
    },
  },
  {
    name: "Sky",
    slug: "sky",
    isDefault: false,
    tokens: {
      backgroundColor: "#e8f1f8",
      textColor: "#1a2b3c",
      buttonColor: "#2f6fed",
      buttonTextColor: "#ffffff",
      fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
    },
  },
  {
    name: "Forest",
    slug: "forest",
    isDefault: false,
    tokens: {
      backgroundColor: "#edf2ef",
      textColor: "#1a2e24",
      buttonColor: "#2d5a45",
      buttonTextColor: "#ffffff",
      fontFamily: '"Syne", ui-sans-serif, system-ui, sans-serif',
    },
  },
  {
    name: "Paper",
    slug: "paper",
    isDefault: false,
    tokens: {
      backgroundColor: "#f6f5f2",
      textColor: "#1c1c1a",
      buttonColor: "#3d4654",
      buttonTextColor: "#ffffff",
      fontFamily: 'Georgia, "Times New Roman", serif',
    },
  },
  {
    name: "Mono",
    slug: "mono",
    isDefault: false,
    tokens: {
      backgroundColor: "#f4f4f5",
      textColor: "#18181b",
      buttonColor: "#18181b",
      buttonTextColor: "#fafafa",
      fontFamily: 'ui-monospace, "SF Mono", Menlo, Monaco, monospace',
    },
  },
];
