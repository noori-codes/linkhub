import type { CSSProperties } from "react";

import { SafeRemoteImage } from "@/components/profile/SafeRemoteImage";
import type { PublicProfile, ThemeTokens } from "@/lib/types";

type Props = {
  profile: PublicProfile;
  name: string;
  cover: string | null;
  tokens: ThemeTokens;
  isDemo: boolean;
  coverFallbackStyle: CSSProperties;
};

function displayWebsite(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function PublicProfileStage({
  profile,
  name,
  cover,
  tokens,
  isDemo,
  coverFallbackStyle,
}: Props) {
  const onPhoto = Boolean(cover);

  return (
    <aside
      className="relative hidden min-h-dvh flex-col justify-end overflow-hidden px-12 py-14 xl:px-16 xl:py-16 lg:flex"
    >
      {cover ? (
        <div className="absolute inset-0">
          <SafeRemoteImage
            src={cover}
            alt=""
            className="h-full w-full object-cover"
            loading="eager"
            fallback={
              <div className="h-full w-full" style={coverFallbackStyle} />
            }
          />
        </div>
      ) : (
        <div className="absolute inset-0" style={coverFallbackStyle} />
      )}

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: onPhoto
            ? "linear-gradient(to top, rgba(8,9,12,0.82) 0%, rgba(8,9,12,0.28) 42%, rgba(8,9,12,0.12) 100%)"
            : `linear-gradient(165deg, color-mix(in srgb, ${tokens.buttonColor} 18%, ${tokens.backgroundColor}) 0%, ${tokens.backgroundColor} 100%)`,
        }}
      />

      <div className="relative z-10 max-w-lg">
        {isDemo ? (
          <p
            className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: onPhoto ? "rgba(255,255,255,0.7)" : "var(--profile-text-muted)" }}
          >
            Sample profile
          </p>
        ) : null}

        <p
          className="text-[13px] font-medium tracking-wide"
          style={{
            color: onPhoto ? "rgba(255,255,255,0.72)" : "var(--profile-text-muted)",
            fontFamily: tokens.fontFamily,
          }}
        >
          @{profile.username}
        </p>

        <p
          className="font-display mt-2 text-5xl font-semibold tracking-tight xl:text-6xl"
          style={{
            color: onPhoto ? "#fff" : "var(--profile-text)",
            fontFamily: tokens.fontFamily,
          }}
        >
          {name}
        </p>

        {profile.bio ? (
          <p
            className="mt-5 max-w-md text-base leading-relaxed xl:text-lg"
            style={{
              color: onPhoto ? "rgba(255,255,255,0.82)" : "var(--profile-text-muted)",
            }}
          >
            {profile.bio}
          </p>
        ) : null}

        {profile.tags.length > 0 ? (
          <ul className="mt-6 flex flex-wrap gap-2">
            {profile.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  backgroundColor: onPhoto
                    ? "rgba(255,255,255,0.14)"
                    : "var(--profile-surface)",
                  color: onPhoto ? "#fff" : "var(--profile-text-muted)",
                  boxShadow: onPhoto
                    ? "inset 0 0 0 1px rgba(255,255,255,0.18)"
                    : "inset 0 0 0 1px var(--profile-border)",
                }}
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}

        {profile.location || profile.website ? (
          <div
            className="mt-8 flex flex-col gap-1.5 text-sm"
            style={{
              color: onPhoto ? "rgba(255,255,255,0.7)" : "var(--profile-text-muted)",
            }}
          >
            {profile.location ? <p>{profile.location}</p> : null}
            {profile.website ? (
              <a
                href={
                  profile.website.startsWith("http")
                    ? profile.website
                    : `https://${profile.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
                style={{ color: onPhoto ? "#fff" : "var(--profile-text)" }}
              >
                {displayWebsite(profile.website)}
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
