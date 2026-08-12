import Image from "next/image";
import type { CSSProperties } from "react";

import { SafeRemoteImage } from "@/components/profile/SafeRemoteImage";
import { PublicShareButton } from "@/components/profile/PublicShareButton";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { buildShopSections } from "@/lib/shop-sections";
import { resolveButtonShape, resolveThemeTokens, themeStyleVars } from "@/lib/theme";
import type {
  PublicLink,
  PublicProfile,
  PublicShopCollection,
  PublicShopProduct,
} from "@/lib/types";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function isRemote(url: string | undefined) {
  return Boolean(
    url && (url.startsWith("http://") || url.startsWith("https://")),
  );
}

type Density = "compact" | "comfortable";

type Props = {
  profile: PublicProfile;
  links: PublicLink[];
  products?: PublicShopProduct[];
  collections?: PublicShopCollection[];
  /** page = visitor /u/... · preview = owner dashboard + landing phone */
  variant: "page" | "preview";
  /** Landing hero wraps preview in a Link — use spans instead of nested <a>s */
  inertLinks?: boolean;
};

const densityStyles = {
  compact: {
    cover: "h-28",
    heroPad: "px-4 pb-5",
    avatarWrap: "mb-2 h-16 w-16 border-[3px] text-sm",
    avatarOverlap: "-mt-8",
    name: "text-[15px] font-semibold leading-tight tracking-tight",
    username: "mt-0.5 text-[11px]",
    bio: "mt-1.5 max-w-[15rem] text-[12px] leading-snug",
    tags: "mt-2 gap-1",
    tag: "rounded-full px-2.5 py-0.5 text-[9px] font-medium",
    heroDivider: "mx-4 mt-2",
    contentPad: "px-4 pb-7 pt-5",
    sectionGap: "gap-2",
    sectionTitle: "text-[13px] font-semibold tracking-tight",
    sectionHint: "mt-0.5 text-[10px]",
    sectionHeaderMb: "mb-2.5",
    link: "px-4 py-3 text-center text-[13px] font-semibold",
    linkArrow: false,
    emptyLinks: "rounded-2xl px-3 py-6 text-center text-[11px]",
    shopGap: "mt-6 gap-6",
    shopTitle: "text-[13px] font-semibold tracking-tight",
    shopHint: "mt-0.5 text-[10px]",
    shopHeaderMb: "mb-3",
    productGrid: "grid-cols-1 gap-3",
    productTitle: "text-[13px]",
    productDesc: "text-[11px]",
    footerPt: "pt-4",
    footerMark: 12,
    footerText: "text-[9px]",
  },
  comfortable: {
    cover: "h-44 sm:h-48",
    heroPad: "px-6 pb-8 sm:px-8",
    avatarWrap:
      "mb-3 h-24 w-24 border-4 text-2xl sm:h-28 sm:w-28 sm:text-3xl",
    avatarOverlap: "-mt-12 sm:-mt-14",
    name: "text-2xl font-semibold tracking-tight sm:text-[1.65rem]",
    username: "mt-1.5 text-sm tracking-wide",
    bio: "mt-3 max-w-md text-sm leading-relaxed sm:text-[15px]",
    tags: "mt-3 gap-1.5",
    tag: "rounded-full px-3 py-1 text-xs font-medium",
    heroDivider: "mx-5 mt-4 sm:mx-8",
    contentPad: "px-5 pb-10 pt-8 sm:px-8 sm:pb-12 sm:pt-10",
    sectionGap: "gap-3",
    sectionTitle: "text-lg font-semibold tracking-tight sm:text-xl",
    sectionHint: "mt-1 text-sm",
    sectionHeaderMb: "mb-4",
    link: "px-5 py-4 text-[15px] font-semibold",
    linkArrow: true,
    emptyLinks: "rounded-xl px-4 py-8 text-center text-sm",
    shopGap: "mt-10 gap-10",
    shopTitle: "text-lg font-semibold tracking-tight sm:text-xl",
    shopHint: "mt-1 text-sm",
    shopHeaderMb: "mb-5",
    productGrid: "grid-cols-1 gap-5 sm:grid-cols-2",
    productTitle: "text-[15px]",
    productDesc: "text-sm",
    footerPt: "pt-10",
    footerMark: 20,
    footerText: "text-[11px]",
  },
} as const;

function linksSectionHint(
  visibleCount: number,
  variant: "page" | "preview",
): string | null {
  if (visibleCount === 0) {
    return variant === "page" ? "Nothing published yet" : "No visible links yet";
  }
  // Simple profiles — links speak for themselves.
  if (visibleCount <= 4) return null;
  return variant === "page"
    ? "Open a destination in a new tab"
    : "Your visible links";
}

function shouldShowShopDescription(
  description: string | undefined,
  username: string,
) {
  if (!description?.trim()) return false;
  return description.trim() !== `Picks from @${username}`;
}

export function PublicProfileView({
  profile,
  links,
  products = [],
  collections = [],
  variant,
  inertLinks = false,
}: Props) {
  const density: Density = variant === "preview" ? "compact" : "comfortable";
  const d = densityStyles[density];

  const name = profile.displayName || profile.username;
  const avatar = isRemote(profile.avatarUrl) ? profile.avatarUrl : null;
  const cover = isRemote(profile.coverUrl) ? profile.coverUrl : null;
  const tokens = resolveThemeTokens(profile);
  const buttonShape = resolveButtonShape(profile);
  const themeStyle = themeStyleVars(tokens, buttonShape);
  const visible =
    variant === "preview"
      ? links.filter((link) => link.isVisible)
      : links;

  const trackedHref = (link: PublicLink) =>
    variant === "page"
      ? `${CLIENT_API_BASE}/api/v1/links/r/${link._id}`
      : link.url;

  const coverFallbackStyle: CSSProperties = {
    background: `linear-gradient(155deg, color-mix(in srgb, ${tokens.buttonColor} 35%, ${tokens.backgroundColor}) 0%, ${tokens.backgroundColor} 100%)`,
  };

  const linkButtonStyle = {
    backgroundColor: tokens.buttonColor,
    color: tokens.buttonTextColor,
    fontFamily: tokens.fontFamily,
    borderRadius: "var(--profile-button-radius)",
  } as const;

  const shopSections =
    variant === "page"
      ? buildShopSections(products, collections, profile.username)
      : [];

  const linksHint = linksSectionHint(visible.length, variant);

  const shellClass =
    variant === "page"
      ? "mx-auto flex min-h-full w-full max-w-lg flex-col"
      : "flex min-h-full flex-col";

  const body = (
    <div className={shellClass} style={themeStyle}>
      {/* Hero */}
      <div className="shrink-0">
        <div className={`relative w-full ${d.cover}`}>
          {cover ? (
            <SafeRemoteImage
              src={cover}
              alt=""
              className="h-full w-full object-cover"
              loading="eager"
              fallback={
                <div
                  aria-hidden
                  className="h-full w-full"
                  style={coverFallbackStyle}
                />
              }
            />
          ) : (
            <div aria-hidden className="h-full w-full" style={coverFallbackStyle} />
          )}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, rgba(0,0,0,0.22), transparent 45%, ${tokens.backgroundColor})`,
            }}
          />
        </div>

        <div
          className={`relative z-10 flex flex-col items-center text-center ${d.avatarOverlap} ${d.heroPad}`}
        >
          <div
            className={`flex items-center justify-center overflow-hidden rounded-full font-semibold shadow-md ${d.avatarWrap}`}
            style={{
              borderColor: tokens.backgroundColor,
              backgroundColor: "var(--profile-surface)",
              color: "var(--profile-text-muted)",
            }}
          >
            {avatar ? (
              <SafeRemoteImage
                src={avatar}
                alt={name}
                className="h-full w-full object-cover"
                fallback={<span>{initials(name) || "?"}</span>}
              />
            ) : (
              <span>{initials(name) || "?"}</span>
            )}
          </div>

          <h1
            className={`font-display ${d.name}`}
            style={{ color: "var(--profile-text)", fontFamily: tokens.fontFamily }}
          >
            {name}
          </h1>
          <p className={d.username} style={{ color: "var(--profile-text-muted)" }}>
            @{profile.username}
          </p>

          {profile.bio ? (
            <p className={d.bio} style={{ color: "var(--profile-text-muted)" }}>
              {profile.bio}
            </p>
          ) : null}

          {profile.tags.length > 0 ? (
            <ul className={`flex flex-wrap justify-center ${d.tags}`}>
              {profile.tags.map((tag) => (
                <li
                  key={tag}
                  className={d.tag}
                  style={{
                    backgroundColor: "var(--profile-surface)",
                    color: "var(--profile-text-muted)",
                    boxShadow: "inset 0 0 0 1px var(--profile-border)",
                  }}
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div
        className={`shrink-0 border-t ${d.heroDivider}`}
        style={{ borderColor: "var(--profile-border)" }}
      />

      {/* Links */}
      <div className={`flex min-h-0 flex-1 flex-col ${d.contentPad}`}>
        <section aria-label="Links">
          <div className={linksHint ? d.sectionHeaderMb : "mb-3"}>
            <h2
              className={`font-display ${d.sectionTitle}`}
              style={{ color: "var(--profile-text)", fontFamily: tokens.fontFamily }}
            >
              Links
            </h2>
            {linksHint ? (
              <p
                className={d.sectionHint}
                style={{ color: "var(--profile-text-muted)" }}
              >
                {linksHint}
              </p>
            ) : null}
          </div>

          <div className={`flex flex-col ${d.sectionGap}`}>
            {visible.length === 0 ? (
              <p
                className={`border border-dashed ${d.emptyLinks}`}
                style={{
                  borderColor: "var(--profile-border)",
                  backgroundColor: "var(--profile-surface)",
                  color: "var(--profile-text-muted)",
                }}
              >
                {variant === "page" ? "No links yet." : "No visible links yet"}
              </p>
            ) : (
              visible.map((link) => {
                const linkClass = d.linkArrow
                  ? `flex w-full items-center justify-between gap-3 shadow-[0_1px_2px_rgba(18,20,26,0.04)] transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-md active:translate-y-0 ${d.link}`
                  : `block w-full text-center shadow-[0_1px_2px_rgba(18,20,26,0.05)] ${d.link}`;

                if (inertLinks) {
                  return (
                    <span key={link._id} className={linkClass} style={linkButtonStyle}>
                      {link.title}
                    </span>
                  );
                }

                return (
                  <a
                    key={link._id}
                    href={trackedHref(link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                    style={linkButtonStyle}
                  >
                    <span className={d.linkArrow ? "truncate" : undefined}>
                      {link.title}
                    </span>
                    {d.linkArrow ? (
                      <span aria-hidden className="shrink-0 opacity-50">
                        ↗
                      </span>
                    ) : null}
                  </a>
                );
              })
            )}
          </div>
        </section>

        {/* Shop — public page only */}
        {shopSections.length > 0 ? (
          <div className={`flex flex-col ${d.shopGap}`} aria-label="Shop">
            {shopSections.map((section) => (
              <section key={section.key} aria-label={section.title}>
                <div className={d.shopHeaderMb}>
                  <h2
                    className={`font-display ${d.shopTitle}`}
                    style={{
                      color: "var(--profile-text)",
                      fontFamily: tokens.fontFamily,
                    }}
                  >
                    {section.title}
                  </h2>
                  {shouldShowShopDescription(
                    section.description,
                    profile.username,
                  ) ? (
                    <p
                      className={d.shopHint}
                      style={{ color: "var(--profile-text-muted)" }}
                    >
                      {section.description}
                    </p>
                  ) : null}
                </div>

                <ul className={`grid ${d.productGrid}`}>
                  {section.products.map((product) => {
                    const primary = product.links[0];
                    const extraLinks = product.links.slice(1);
                    const hasAffiliate = product.links.some((l) => l.isAffiliate);

                    return (
                      <li
                        key={product._id}
                        className="group flex flex-col overflow-hidden rounded-2xl transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(18,20,26,0.08)]"
                        style={{
                          border: "1px solid var(--profile-border)",
                          backgroundColor: "var(--profile-surface)",
                        }}
                      >
                        <div
                          className="relative aspect-square w-full overflow-hidden"
                          style={{ backgroundColor: tokens.backgroundColor }}
                        >
                          {isRemote(product.imageUrl) ? (
                            <SafeRemoteImage
                              src={product.imageUrl}
                              alt=""
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                              fallback={
                                <div
                                  aria-hidden
                                  className="flex h-full w-full items-center justify-center text-lg font-semibold"
                                  style={{
                                    ...coverFallbackStyle,
                                    color: "var(--profile-text-muted)",
                                  }}
                                >
                                  {initials(product.title)}
                                </div>
                              }
                            />
                          ) : (
                            <div
                              aria-hidden
                              className="flex h-full w-full items-center justify-center text-lg font-semibold"
                              style={{
                                ...coverFallbackStyle,
                                color: "var(--profile-text-muted)",
                              }}
                            >
                              {initials(product.title) || product.title.slice(0, 1)}
                            </div>
                          )}
                          {hasAffiliate ? (
                            <span
                              className="absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide shadow-sm backdrop-blur-sm"
                              style={{
                                backgroundColor:
                                  "color-mix(in srgb, var(--profile-surface) 95%, transparent)",
                                color: "var(--profile-text)",
                              }}
                            >
                              Affiliate
                            </span>
                          ) : null}
                        </div>

                        <div className="flex flex-1 flex-col px-4 pt-4 pb-4">
                          <div className="min-h-[3.5rem]">
                            <h3
                              className={`line-clamp-2 font-semibold leading-snug ${d.productTitle}`}
                              style={{ color: "var(--profile-text)" }}
                            >
                              {product.title}
                            </h3>
                            {product.description ? (
                              <p
                                className={`mt-1.5 line-clamp-2 leading-relaxed ${d.productDesc}`}
                                style={{ color: "var(--profile-text-muted)" }}
                              >
                                {product.description}
                              </p>
                            ) : null}
                          </div>

                          <div className="mt-4 flex flex-col gap-2">
                            {primary ? (
                              <a
                                href={primary.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                                style={linkButtonStyle}
                              >
                                <span className="truncate">
                                  {product.links.length === 1
                                    ? "Shop"
                                    : primary.title}
                                </span>
                                <span aria-hidden className="opacity-70">
                                  →
                                </span>
                              </a>
                            ) : null}

                            {extraLinks.map((productLink) => (
                              <a
                                key={productLink._id}
                                href={productLink.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex w-full items-center justify-center gap-1.5 border px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
                                style={{
                                  borderColor: "var(--profile-border)",
                                  backgroundColor: tokens.backgroundColor,
                                  color: "var(--profile-text)",
                                  borderRadius: "var(--profile-button-radius)",
                                }}
                              >
                                <span className="truncate">{productLink.title}</span>
                                {productLink.isAffiliate ? (
                                  <span
                                    className="shrink-0 text-[10px] uppercase tracking-wide"
                                    style={{ color: "var(--profile-text-muted)" }}
                                  >
                                    · aff
                                  </span>
                                ) : null}
                              </a>
                            ))}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        ) : null}

        <footer
          className={`mt-auto flex flex-col items-center gap-1.5 ${d.footerPt} opacity-50`}
        >
          <Image
            src="/linkhub-mark.png"
            alt=""
            width={d.footerMark}
            height={d.footerMark}
            unoptimized
          />
          <p className={d.footerText} style={{ color: "var(--profile-text-muted)" }}>
            {variant === "page" ? "Powered by LinkHub" : "LinkHub"}
          </p>
        </footer>
      </div>
    </div>
  );

  if (variant === "preview") {
    return body;
  }

  return (
    <>
      <PublicShareButton username={profile.username} displayName={name} />
      <div className="flex min-h-full flex-1 flex-col bg-[var(--profile-bg)]">
        {body}
      </div>
    </>
  );
}
