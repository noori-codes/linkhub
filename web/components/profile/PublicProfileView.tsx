import Image from "next/image";

import { SafeRemoteImage } from "@/components/profile/SafeRemoteImage";
import { CLIENT_API_BASE } from "@/lib/client-api";
import type { PublicLink, PublicProfile, PublicShopProduct } from "@/lib/types";

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
  /** page = visitor /u/... · preview = owner dashboard card */
  variant: "page" | "preview";
};

/**
 * One public profile UI — used by /u/[username] and the owner preview.
 * Preview = compact centered phone layout (Linktree-style).
 * Page = desktop split / mobile stack visitor layout.
 */
export function PublicProfileView({ profile, links, products = [], variant }: Props) {
  const name = profile.displayName || profile.username;
  const avatar = isRemote(profile.avatarUrl) ? profile.avatarUrl : null;
  const cover = isRemote(profile.coverUrl) ? profile.coverUrl : null;
  const visible =
    variant === "preview"
      ? links.filter((link) => link.isVisible)
      : links;

  const trackedHref = (link: PublicLink) =>
    variant === "page"
      ? `${CLIENT_API_BASE}/api/v1/links/r/${link._id}`
      : link.url;

  /* —— Owner phone preview: top = identity · bottom = links —— */
  if (variant === "preview") {
    return (
      <div className="flex min-h-full flex-col bg-[#eef0f3]">
        {/* TOP: cover + avatar + personal info */}
        <div className="shrink-0">
          <div className="relative h-[4.75rem] w-full">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="" className="h-full w-full object-cover" />
            ) : (
              <div
                aria-hidden
                className="h-full w-full bg-[linear-gradient(155deg,#9aa3b2_0%,#c5cbd4_55%,#eef0f3_100%)]"
              />
            )}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-[#eef0f3]"
            />
          </div>

          <div className="relative z-10 -mt-7 flex flex-col items-center px-4 pb-3 text-center">
            <div className="mb-2 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-[3px] border-[#eef0f3] bg-surface text-sm font-semibold text-text-muted shadow-md">
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

            <h1 className="font-display text-[15px] font-semibold leading-tight tracking-tight text-text">
              {name}
            </h1>
            <p className="mt-0.5 text-[11px] text-text-muted">
              @{profile.username}
            </p>

            {profile.bio ? (
              <p className="mt-1.5 max-w-[15rem] text-[12px] leading-snug text-text-muted">
                {profile.bio}
              </p>
            ) : null}

            {profile.tags.length > 0 ? (
              <ul className="mt-2 flex flex-wrap justify-center gap-1">
                {profile.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-surface/90 px-2.5 py-0.5 text-[9px] font-medium text-text-muted ring-1 ring-border"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        {/* BOTTOM: links + logo */}
        <div className="mx-4 mb-1 border-t border-border/80" />
        <div className="flex min-h-0 flex-1 flex-col px-4 pb-7 pt-3">
          <div className="flex flex-1 flex-col gap-2">
            {visible.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border bg-surface/70 px-3 py-6 text-center text-[11px] text-text-muted">
                No visible links yet
              </p>
            ) : (
              visible.map((link) => (
                <a
                  key={link._id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-2xl border border-border bg-surface px-4 py-3 text-center text-[13px] font-semibold text-text shadow-[0_1px_2px_rgba(18,20,26,0.05)]"
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
            <span className="text-[9px] tracking-wide text-text">LinkHub</span>
          </div>
        </div>
      </div>
    );
  }

  /* —— Public /u/[username] page —— */
  const coverBlock = (
    <div className="relative z-0 h-36 w-full sm:h-44">
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt="" className="h-full w-full object-cover" />
      ) : (
        <div
          aria-hidden
          className="h-full w-full bg-[linear-gradient(135deg,#dfe4ec_0%,#eef0f4_45%,#f3f4f6_100%)]"
        />
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/5 via-transparent to-bg"
      />
    </div>
  );

  const identityInner = (
    <>
      <div className="relative z-10 -mt-14 mb-0 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-surface text-3xl font-semibold tracking-wide text-text-muted shadow-sm sm:-mt-16 sm:h-32 sm:w-32 sm:text-4xl lg:mt-0 lg:h-24 lg:w-24 lg:border-white/35 lg:text-3xl lg:shadow-lg">
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

      <h1 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl lg:text-2xl lg:text-white xl:text-3xl">
        {name}
      </h1>
      <p className="mt-1.5 text-sm tracking-wide text-text-muted lg:text-white/70">
        @{profile.username}
      </p>

      {profile.bio ? (
        <p className="mt-4 max-w-sm px-2 text-sm leading-relaxed text-text-muted sm:text-[15px] lg:max-w-none lg:px-0 lg:text-white/85">
          {profile.bio}
        </p>
      ) : null}
    </>
  );

  const identity = (
    <header className="relative z-10 flex flex-col items-center bg-bg px-6 pb-8 pt-0 text-center lg:items-start lg:bg-transparent lg:px-10 lg:pb-12 lg:pt-0 lg:text-left xl:px-12">
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
      <p className="text-[11px] tracking-wide text-text-muted">
        Powered by LinkHub
      </p>
    </footer>
  );

  const pageLinkButtonClass =
    "flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface px-5 py-4 text-[15px] font-semibold text-text shadow-[0_1px_2px_rgba(18,20,26,0.04)] transition-[transform,box-shadow,background-color,color] hover:-translate-y-px hover:border-brand/25 hover:bg-bg-elevated hover:text-brand hover:shadow-md active:translate-y-0";

  const pageLinkChevron = (
    <span aria-hidden className="shrink-0 text-text-muted/50">
      ↗
    </span>
  );

  const linkList = (
    <section className="flex flex-col gap-3" aria-label="Links">
      <div className="mb-4">
        <h2 className="font-display text-xl font-semibold tracking-tight text-text sm:text-2xl">
          Links
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          {visible.length > 0
            ? "Open a destination in a new tab"
            : "Nothing published yet"}
        </p>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-surface/60 px-4 py-8 text-center text-sm text-text-muted">
          No links yet.
        </p>
      ) : (
        visible.map((link) => (
          <a
            key={link._id}
            href={trackedHref(link)}
            target="_blank"
            rel="noopener noreferrer"
            className={pageLinkButtonClass}
          >
            <span className="truncate">{link.title}</span>
            {pageLinkChevron}
          </a>
        ))
      )}
    </section>
  );

  const shopSection =
    products.length > 0 ? (
      <section className="mt-12" aria-label="Shop">
        <div className="mb-6">
          <h2 className="font-display text-xl font-semibold tracking-tight text-text sm:text-2xl">
            Shop
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Picks from @{profile.username}
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:items-stretch">
          {products.map((product) => {
            const primary = product.links[0];
            const extraLinks = product.links.slice(1);
            const hasAffiliate = product.links.some((l) => l.isAffiliate);

            return (
              <li
                key={product._id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(18,20,26,0.08)]"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-bg">
                  {isRemote(product.imageUrl) ? (
                    <SafeRemoteImage
                      src={product.imageUrl}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      fallback={
                        <div
                          aria-hidden
                          className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#eef0f4,#f8f9fb)] text-lg font-semibold text-text-muted"
                        >
                          {initials(product.title)}
                        </div>
                      }
                    />
                  ) : (
                    <div
                      aria-hidden
                      className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#eef0f4,#f8f9fb)] text-lg font-semibold text-text-muted"
                    >
                      {initials(product.title) || product.title.slice(0, 1)}
                    </div>
                  )}
                  {hasAffiliate ? (
                    <span className="absolute top-3 left-3 rounded-full bg-surface/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-text shadow-sm backdrop-blur-sm">
                      Affiliate
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col px-4 pt-4 pb-4">
                  <div className="min-h-[4.75rem]">
                    <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-text">
                      {product.title}
                    </h3>
                    {product.description ? (
                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-text-muted">
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
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-text px-4 py-3 text-sm font-semibold text-text-inverse transition-colors hover:bg-text/90"
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
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-bg px-4 py-2.5 text-sm font-medium text-text transition-colors hover:border-brand/30 hover:text-brand"
                      >
                        <span className="truncate">{productLink.title}</span>
                        {productLink.isAffiliate ? (
                          <span className="shrink-0 text-[10px] uppercase tracking-wide text-text-muted">
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
    ) : null;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-bg lg:min-h-screen lg:grid lg:grid-cols-[minmax(300px,38%)_1fr]">
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
              className="h-full w-full bg-[linear-gradient(160deg,#3d4654_0%,#5c6470_40%,#8b939e_100%)]"
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

      <main className="flex min-w-0 flex-1 flex-col border-border bg-bg-elevated lg:border-l">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14 xl:px-14">
          {linkList}
          {shopSection}
          {pageFooter}
        </div>
      </main>
    </div>
  );
}
