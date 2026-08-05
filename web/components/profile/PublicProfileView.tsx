import Image from "next/image";
import Link from "next/link";

import { PreviewShareActions } from "@/components/profile/PreviewShareActions";
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
 * Change spacing/styles here so both stay in sync.
 */
export function PublicProfileView({ profile, links, products = [], variant }: Props) {
  const name = profile.displayName || profile.username;
  const avatar = isRemote(profile.avatarUrl) ? profile.avatarUrl : null;
  const cover = isRemote(profile.coverUrl) ? profile.coverUrl : null;
  const visible =
    variant === "preview"
      ? links.filter((link) => link.isVisible)
      : links;

  const avatarBorder =
    variant === "page" ? "border-surface" : "border-surface";
  const trackedHref = (link: PublicLink) =>
    variant === "page"
      ? `${CLIENT_API_BASE}/api/v1/links/r/${link._id}`
      : link.url;

  const coverBlock = (
    <div
      className={
        variant === "page"
          ? "relative z-0 h-36 w-full sm:h-44"
          : "relative z-0 h-52 w-full sm:h-64"
      }
    >
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt="" className="h-full w-full object-cover" />
      ) : (
        <div
          aria-hidden
          className="h-full w-full bg-[linear-gradient(135deg,#dfe4ec_0%,#eef0f4_45%,#f3f4f6_100%)]"
        />
      )}
      {variant === "page" ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/5 via-transparent to-bg"
        />
      ) : null}
    </div>
  );

  const identityInner = (
    <>
      <div
        className={`relative z-10 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-[4px] ${avatarBorder} bg-surface text-3xl font-semibold tracking-wide text-text-muted shadow-sm sm:h-32 sm:w-32 sm:text-4xl ${
          variant === "page" ? "-mt-14 sm:-mt-16" : "-mt-16 mb-7 sm:-mt-18"
        }`}
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

      <h1 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl lg:text-[2rem]">
        {name}
      </h1>
      <p className="mt-1.5 text-sm tracking-wide text-text-muted">
        @{profile.username}
      </p>

      {profile.bio ? (
        <p
          className={`mt-4 text-sm leading-relaxed text-text-muted sm:text-[15px] ${
            variant === "page" ? "max-w-sm px-2" : "max-w-xl"
          }`}
        >
          {profile.bio}
        </p>
      ) : variant === "preview" ? (
        <p className="mt-5 max-w-xl text-sm text-text-muted">
          Add a short bio. Tell the world who you are and what you do.
        </p>
      ) : null}

      {variant === "preview" && profile.tags.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {profile.tags.map((tag) => (
            <li
              key={tag}
              className="text-[10px] uppercase tracking-wider text-text-muted"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}

      {variant === "preview" ? (
        <PreviewShareActions
          username={profile.username}
          status={profile.status}
        />
      ) : null}
    </>
  );

  const identity =
    variant === "page" ? (
      <header className="flex flex-col items-center px-2 text-center">
        {identityInner}
      </header>
    ) : (
      <header className="mb-10 flex flex-col px-5 sm:px-8">{identityInner}</header>
    );

  const pageLinkButtonClass =
    "block w-full rounded-xl border border-border bg-surface px-5 py-3.5 text-center text-[15px] font-semibold text-text shadow-[0_1px_2px_rgba(18,20,26,0.04)] transition-[transform,box-shadow,background-color,color] hover:-translate-y-px hover:border-brand/25 hover:bg-bg-elevated hover:text-brand hover:shadow-md active:translate-y-0";

  const linkList = (
    <section
      className={
        variant === "preview"
          ? "mx-5 flex flex-col gap-2.5 border-t border-border px-0 pb-7 pt-8 sm:mx-8"
          : "flex flex-col gap-3"
      }
      aria-label="Links"
    >
      {visible.length === 0 ? (
        variant === "preview" ? (
          <div className="flex flex-col items-start gap-2 py-1">
            <p className="text-sm text-text-muted">No visible links yet.</p>
            <Link
              href="/profile/links"
              className="text-sm font-medium text-brand hover:text-brand-hover"
            >
              Add your first link
            </Link>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-surface/60 px-4 py-8 text-center text-sm text-text-muted">
            No links yet.
          </p>
        )
      ) : (
        visible.map((link) => (
          <a
            key={link._id}
            href={trackedHref(link)}
            target="_blank"
            rel="noopener noreferrer"
            className={
              variant === "page"
                ? pageLinkButtonClass
                : "block rounded-md border border-border bg-transparent px-4 py-3.5 text-center text-[15px] font-medium text-text transition-colors hover:bg-bg hover:text-brand"
            }
          >
            {link.title}
          </a>
        ))
      )}
    </section>
  );

  const shopSection =
    variant === "page" && products.length > 0 ? (
      <section className="mt-8 flex flex-col gap-3" aria-label="Shop">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
          Shop
        </p>
        {products.map((product) => (
          <div key={product._id} className="flex flex-col gap-2">
            {(product.description || isRemote(product.imageUrl)) && (
              <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-surface/80 px-4 py-3">
                {isRemote(product.imageUrl) ? (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-bg">
                    <SafeRemoteImage
                      src={product.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      fallback={
                        <div
                          aria-hidden
                          className="flex h-full w-full items-center justify-center bg-bg text-[10px] font-semibold text-text-muted"
                        >
                          {initials(product.title)}
                        </div>
                      }
                    />
                  </div>
                ) : null}
                <div className="min-w-0 text-left">
                  <p className="text-sm font-semibold text-text">{product.title}</p>
                  {product.description ? (
                    <p className="mt-0.5 text-xs leading-relaxed text-text-muted line-clamp-2">
                      {product.description}
                    </p>
                  ) : null}
                </div>
              </div>
            )}
            {product.links.map((productLink) => (
              <a
                key={productLink._id}
                href={productLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${pageLinkButtonClass} flex items-center justify-center gap-2`}
              >
                <span className="truncate">
                  {product.links.length === 1 && !product.description
                    ? product.title
                    : productLink.title}
                </span>
                {productLink.isAffiliate ? (
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-brand">
                    · affiliate
                  </span>
                ) : null}
              </a>
            ))}
          </div>
        ))}
      </section>
    ) : null;

  if (variant === "preview") {
    return (
      <div className="lh-panel overflow-hidden rounded-xl">
        {coverBlock}
        {identity}
        {linkList}
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-bg">
      {coverBlock}
      <div className="relative z-10 mx-auto w-full max-w-[26rem] flex-1 px-5 pb-14 sm:max-w-md sm:px-6">
        <div className="-mt-12 sm:-mt-14">
          {identity}
        </div>
        <div className="mt-7 flex flex-col">
          {linkList}
          {shopSection}
        </div>

        <footer className="mt-14 flex flex-col items-center gap-1.5">
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
      </div>
    </div>
  );
}
