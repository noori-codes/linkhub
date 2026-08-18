import { DEFAULT_THEME_TOKENS } from "@/lib/theme";
import type { PublicLink, PublicProfile } from "@/lib/types";

export const LANDING_DEMO_USERNAME = "demo";

export function isDemoUsername(username: string | undefined) {
  return username?.trim().toLowerCase() === LANDING_DEMO_USERNAME;
}

export const DEMO_PROFILE: PublicProfile = {
  _id: "demo-profile",
  username: LANDING_DEMO_USERNAME,
  displayName: "LinkHub Demo",
  bio: "This is a sample page — not a real account. Publish yours when you're ready.",
  avatarUrl: "/demo-avatar.jpg",
  coverUrl: "/demo-cover.jpg",
  location: "",
  website: "",
  status: "published",
  tags: ["demo", "sample", "link-in-bio"],
  buttonShape: "rounded",
  theme: {
    _id: "demo-theme",
    name: "Demo",
    slug: "demo",
    isDefault: true,
    tokens: DEFAULT_THEME_TOKENS,
  },
};

export const DEMO_LINKS: PublicLink[] = [
  {
    _id: "demo-link-website",
    title: "Website",
    url: "/signup",
    type: "custom",
    platform: "custom",
    order: 0,
    isVisible: true,
    clickCount: 0,
  },
  {
    _id: "demo-link-youtube",
    title: "YouTube",
    url: "/signup",
    type: "social",
    platform: "youtube",
    order: 1,
    isVisible: true,
    clickCount: 0,
  },
  {
    _id: "demo-link-instagram",
    title: "Instagram",
    url: "/signup",
    type: "social",
    platform: "instagram",
    order: 2,
    isVisible: true,
    clickCount: 0,
  },
  {
    _id: "demo-link-newsletter",
    title: "Newsletter",
    url: "/signup",
    type: "custom",
    platform: "custom",
    order: 3,
    isVisible: true,
    clickCount: 0,
  },
];
