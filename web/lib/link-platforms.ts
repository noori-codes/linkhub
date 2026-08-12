export type LinkPlatform = {
  id: string;
  label: string;
  title: string;
  placeholder: string;
  brandColor: string;
};

export const LINK_PLATFORMS: LinkPlatform[] = [
  {
    id: "instagram",
    label: "Instagram",
    title: "Instagram",
    placeholder: "https://instagram.com/you",
    brandColor: "#E4405F",
  },
  {
    id: "x",
    label: "X",
    title: "X",
    placeholder: "https://x.com/you",
    brandColor: "#000000",
  },
  {
    id: "tiktok",
    label: "TikTok",
    title: "TikTok",
    placeholder: "https://tiktok.com/@you",
    brandColor: "#010101",
  },
  {
    id: "youtube",
    label: "YouTube",
    title: "YouTube",
    placeholder: "https://youtube.com/@you",
    brandColor: "#FF0000",
  },
  {
    id: "github",
    label: "GitHub",
    title: "GitHub",
    placeholder: "https://github.com/you",
    brandColor: "#181717",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    title: "LinkedIn",
    placeholder: "https://linkedin.com/in/you",
    brandColor: "#0A66C2",
  },
  {
    id: "facebook",
    label: "Facebook",
    title: "Facebook",
    placeholder: "https://facebook.com/you",
    brandColor: "#1877F2",
  },
  {
    id: "discord",
    label: "Discord",
    title: "Discord",
    placeholder: "https://discord.gg/invite",
    brandColor: "#5865F2",
  },
  {
    id: "twitch",
    label: "Twitch",
    title: "Twitch",
    placeholder: "https://twitch.tv/you",
    brandColor: "#9146FF",
  },
  {
    id: "spotify",
    label: "Spotify",
    title: "Spotify",
    placeholder: "https://open.spotify.com/user/you",
    brandColor: "#1DB954",
  },
  {
    id: "threads",
    label: "Threads",
    title: "Threads",
    placeholder: "https://threads.net/@you",
    brandColor: "#000000",
  },
  {
    id: "pinterest",
    label: "Pinterest",
    title: "Pinterest",
    placeholder: "https://pinterest.com/you",
    brandColor: "#BD081C",
  },
  {
    id: "reddit",
    label: "Reddit",
    title: "Reddit",
    placeholder: "https://reddit.com/u/you",
    brandColor: "#FF4500",
  },
  {
    id: "snapchat",
    label: "Snapchat",
    title: "Snapchat",
    placeholder: "https://snapchat.com/add/you",
    brandColor: "#FFFC00",
  },
  {
    id: "telegram",
    label: "Telegram",
    title: "Telegram",
    placeholder: "https://t.me/you",
    brandColor: "#26A5E4",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    title: "WhatsApp",
    placeholder: "https://wa.me/1234567890",
    brandColor: "#25D366",
  },
  {
    id: "behance",
    label: "Behance",
    title: "Behance",
    placeholder: "https://behance.net/you",
    brandColor: "#1769FF",
  },
  {
    id: "website",
    label: "Website",
    title: "Website",
    placeholder: "https://yoursite.com",
    brandColor: "#64748B",
  },
];

export const ONBOARDING_PLATFORMS_KEY = "linkhub_onboarding_selected_platforms";

export function getLinkPlatform(id: string) {
  return LINK_PLATFORMS.find((p) => p.id === id);
}

export function readSelectedPlatforms(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(ONBOARDING_PLATFORMS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export function writeSelectedPlatforms(ids: string[]) {
  sessionStorage.setItem(ONBOARDING_PLATFORMS_KEY, JSON.stringify(ids));
}
