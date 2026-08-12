import { PlatformIcon } from "@/components/onboarding/PlatformIcon";
import { getLinkPlatform } from "@/lib/link-platforms";

type Size = "xs" | "sm" | "md";

const sizeClass: Record<Size, { wrap: string; icon: string; tint: number }> = {
  xs: { wrap: "h-6 w-6 rounded-md", icon: "h-3 w-3", tint: 10 },
  sm: { wrap: "h-7 w-7 rounded-lg", icon: "h-3.5 w-3.5", tint: 14 },
  md: { wrap: "h-10 w-10 rounded-xl", icon: "h-5 w-5", tint: 14 },
};

type Props = {
  platform: string;
  size?: Size;
};

export function PlatformIconBadge({ platform, size = "md" }: Props) {
  const config = getLinkPlatform(platform);
  const brandColor = config?.brandColor ?? "#64748B";
  const { wrap, icon, tint } = sizeClass[size];
  const darkIcon = platform === "snapchat";

  return (
    <span
      className={`flex shrink-0 items-center justify-center ${wrap}`}
      style={{
        backgroundColor: `color-mix(in srgb, ${brandColor} ${tint}%, var(--surface))`,
        color: darkIcon ? "#000000" : brandColor,
      }}
    >
      <PlatformIcon platform={platform} className={icon} />
    </span>
  );
}
