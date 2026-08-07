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

type Props = {
  profile: PublicProfile;
  links: PublicLink[];
  products?: PublicShopProduct[];
  collections?: PublicShopCollection[];
  /** page = visitor /u/... · preview = owner dashboard card */
  variant: "page" | "preview";
};

/**
 * One public profile UI — used by /u/[username] and the owner preview.
 * Preview = compact centered phone layout (Linktree-style).
 * Page = desktop split / mobile stack visitor layout.
 */
export function PublicProfileView({
  profile,
  links,
  products = [],
  collections = [],
  variant,
}: Props) {
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

  /* —— Owner phone preview: top = identity · bottom = links —— */
  if (variant === "preview") {
    return (
      <div className="flex min-h-full flex-col" style={themeStyle}>
        {/* TOP: cover + avatar + personal info */}
        <div className="shrink-0">
          <div className="relative h-[4.75rem] w-full">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="" className="h-full w-full object-cover" />
            ) : (
              <div aria-hidden className="h-full w-full" style={coverFallbackStyle} />
            )}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, rgba(0,0,0,0.2), transparent 45%, ${tokens.backgroundColor})`,
              }}
            />
          </div>

          <div className="relative z-10 -mt-7 flex flex-col items-center px-4 pb-3 text-center">
            <div
              className="mb-2 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-[3px] text-sm font-semibold shadow-md"
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
              className="font-display text-[15px] font-semibold leading-tight tracking-tight"
              style={{ color: "var(--profile-text)", fontFamily: tokens.fontFamily }}
            >
              {name}
            </h1>
            <p
              className="mt-0.5 text-[11px]"
              style={{ color: "var(--profile-text-muted)" }}
            >
              @{profile.username}
            </p>

            {profile.bio ? (
              <p
                className="mt-1.5 max-w-[15rem] text-[12px] leading-snug"
                style={{ color: "var(--profile-text-muted)" }}
              >
                {profile.bio}
              </p>
            ) : null}

            {profile.tags.length > 0 ? (
              <ul className="mt-2 flex flex-wrap justify-center gap-1">
                {profile.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full px-2.5 py-0.5 text-[9px] font-medium"
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

        {/* BOTTOM: links + logo */}
        <div
          className="mx-4 mb-1 border-t"
          style={{ borderColor: "var(--profile-border)" }}
        />
        <div className="flex min-h-0 flex-1 flex-col px-4 pb-7 pt-3">
          <div className="flex flex-1 flex-col gap-2">
            {visible.length === 0 ? (
              <p
                className="rounded-2xl border border-dashed px-3 py-6 text-center text-[11px]"
                style={{
                  borderColor: "var(--profile-border)",
                  backgroundColor: "var(--profile-surface)",
                  color: "var(--profile-text-muted)",
                }}
              >
                No visible links yet
              </p>
            ) : (
              visible.map((link) => (
                <a
                  key={link._id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-3 text-center text-[13px] font-semibold shadow-[0_1px_2px_rgba(18,20,26,0.05)]"
                  style={{
                    backgroundColor: tokens.buttonColor,
                    color: tokens.buttonTextColor,
                    fontFamily: tokens.fontFamily,
                    borderRadius: "var(--profile-button-radius)",
                  }}
                >
                  {link.title}
                </a>
              ))
            )}
          </div>

          <div className="mt-auto flex items-center justify-center gap-1.5 pt-4 opacity-40">
            <Image
              src="/linkhub-mark.png"
              alt=""
              width={12}
              height={12}
              unoptimized
            />
            <span
              className="text-[9px] tracking-wide"
              style={{ color: "var(--profile-text)" }}
            >
              LinkHub
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* —— Public /u/[username] page —— */
  const identityInner = (
    <>
      <div
        className="relative z-10 -mt-14 mb-0 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 text-3xl font-semibold tracking-wide shadow-sm sm:-mt-16 sm:h-32 sm:w-32 sm:text-4xl lg:mt-0 lg:h-24 lg:w-24 lg:border-white/35 lg:text-3xl lg:shadow-lg"
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
        className="font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-2xl lg:text-white xl:text-3xl"
        style={{ fontFamily: tokens.fontFamily }}
      >
        {name}
      </h1>
      <p
        className="mt-1.5 text-sm tracking-wide lg:text-white/70"
        style={{ color: "var(--profile-text-muted)" }}
      >
        @{profile.username}
      </p>

      {profile.bio ? (
        <p
          className="mt-4 max-w-sm px-2 text-sm leading-relaxed sm:text-[15px] lg:max-w-none lg:px-0 lg:text-white/85"
          style={{ color: "var(--profile-text-muted)" }}
        >
          {profile.bio}
        </p>
      ) : null}
    </>
  );

  const identity = (
    <header className="relative z-10 flex flex-col items-center bg-[var(--profile-bg)] px-6 pb-8 pt-0 text-center lg:items-start lg:bg-transparent lg:px-10 lg:pb-12 lg:pt-0 lg:text-left xl:px-12">
      {identityInner}
    </header>
  );

  const pageFooter = (
    <footer className="mt-16 flex flex-col items-center gap-1.5 lg:items-start">
      <Image
        src="/linkhub-mark.png"
        alt="LinkHub"
        width={20}
        height={20}
        unoptimized
        className="opacity-50"
      />
      <p
        className="text-[11px] tracking-wide"
        style={{ color: "var(--profile-text-muted)" }}
      >
        Powered by LinkHub
      </p>
    </footer>
  );

  const linkList = (
    <section className="flex flex-col gap-3" aria-label="Links">
      <div className="mb-4">
        <h2
          className="font-display text-xl font-semibold tracking-tight sm:text-2xl"
          style={{ color: "var(--profile-text)", fontFamily: tokens.fontFamily }}
        >
          Links
        </h2>
        <p
          className="mt-1 text-sm"
          style={{ color: "var(--profile-text-muted)" }}
        >
          {visible.length > 0
            ? "Open a destination in a new tab"
            : "Nothing published yet"}
        </p>
      </div>

      {visible.length === 0 ? (
        <p
          className="rounded-xl border border-dashed px-4 py-8 text-center text-sm"
          style={{
            borderColor: "var(--profile-border)",
            backgroundColor: "var(--profile-surface)",
            color: "var(--profile-text-muted)",
          }}
        >
          No links yet.
        </p>
      ) : (
        visible.map((link) => (
          <a
            key={link._id}
            href={trackedHref(link)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-[15px] font-semibold shadow-[0_1px_2px_rgba(18,20,26,0.04)] transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-md active:translate-y-0"
            style={{
              backgroundColor: tokens.buttonColor,
              color: tokens.buttonTextColor,
              fontFamily: tokens.fontFamily,
              borderRadius: "var(--profile-button-radius)",
            }}
          >
            <span className="truncate">{link.title}</span>
            <span aria-hidden className="shrink-0 opacity-50">
              ↗
            </span>
          </a>
        ))
      )}
    </section>
  );

  const shopSections = buildShopSections(
    products,
    collections,
    profile.username,
  );

  const shopSection =
    shopSections.length > 0 ? (
      <div className="mt-12 flex flex-col gap-12" aria-label="Shop">
        {shopSections.map((section) => (
          <section key={section.key} aria-label={section.title}>
            <div className="mb-6">
              <h2
                className="font-display text-xl font-semibold tracking-tight sm:text-2xl"
                style={{ color: "var(--profile-text)", fontFamily: tokens.fontFamily }}
              >
                {section.title}
              </h2>
              {section.description ? (
                <p
                  className="mt-1 text-sm"
                  style={{ color: "var(--profile-text-muted)" }}
                >
                  {section.description}
                </p>
              ) : null}
            </div>

            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:items-stretch">
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
                            backgroundColor: "color-mix(in srgb, var(--profile-surface) 95%, transparent)",
                            color: "var(--profile-text)",
                          }}
                        >
                          Affiliate
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-1 flex-col px-4 pt-4 pb-4">
                      <div className="min-h-[4.75rem]">
                        <h3
                          className="line-clamp-2 text-[15px] font-semibold leading-snug"
                          style={{ color: "var(--profile-text)" }}
                        >
                          {product.title}
                        </h3>
                        {product.description ? (
                          <p
                            className="mt-1.5 line-clamp-2 text-sm leading-relaxed"
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
                            style={{
                              backgroundColor: tokens.buttonColor,
                              color: tokens.buttonTextColor,
                              borderRadius: "var(--profile-button-radius)",
                            }}
                          >
                            <span className="truncate">
                              {product.links.length === 1 ? "Shop" : primary.title}
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
    ) : null;

  const contentBg = `color-mix(in srgb, ${tokens.backgroundColor} 88%, #ffffff)`;

  return (
    <>
      <PublicShareButton
        username={profile.username}
        displayName={name}
      />
      <div
        className="flex min-h-full flex-1 flex-col lg:min-h-screen lg:grid lg:grid-cols-[minmax(300px,38%)_1fr]"
        style={themeStyle}
      >
        <aside className="relative flex flex-col lg:sticky lg:top-0 lg:h-screen lg:min-h-0 lg:overflow-hidden">
          <div className="relative h-44 shrink-0 sm:h-52 lg:absolute lg:inset-0 lg:h-full">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                aria-hidden
                className="h-full w-full"
                style={{
                  background: `linear-gradient(160deg, color-mix(in srgb, ${tokens.buttonColor} 55%, #000) 0%, color-mix(in srgb, ${tokens.buttonColor} 30%, ${tokens.backgroundColor}) 50%, ${tokens.backgroundColor} 100%)`,
                }}
              />
            )}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/25 via-black/10 to-black/75 lg:from-black/30 lg:via-black/20 lg:to-black/80"
            />
          </div>

          <div className="-mt-14 sm:-mt-16 lg:mt-auto lg:flex lg:flex-1 lg:flex-col lg:justify-end">
            {identity}
          </div>
        </aside>

        <main
          className="flex min-w-0 flex-1 flex-col border-l-0 lg:border-l"
          style={{
            backgroundColor: contentBg,
            borderColor: "var(--profile-border)",
          }}
        >
          <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14 xl:px-14">
            {linkList}
            {shopSection}
            {pageFooter}
          </div>
        </main>
      </div>
    </>
  );
}
