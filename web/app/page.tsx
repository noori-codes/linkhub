import Image from "next/image";

import HomeAuthActions from "@/components/HomeAuthActions";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      {/* Full-bleed atmosphere — light, not a watermark logo */}
      <div
        aria-hidden
        className="lh-wash pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_0%,var(--brand-muted),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,#e8a31712,transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent"
      />
      <div aria-hidden className="page-grain pointer-events-none absolute inset-0" />

      {/* First viewport: brand, one line, CTAs */}
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 pb-16 pt-20 text-center">
        <div className="relative flex max-w-xl flex-col items-center gap-7">
          <div className="lh-rise flex flex-col items-center gap-5">
            <Image
              src="/logo.png"
              alt="LinkHub"
              width={48}
              height={48}
              priority
            />
            <h1 className="font-display text-5xl font-bold tracking-tight text-text sm:text-6xl">
              LinkHub
            </h1>
          </div>

          <p className="lh-rise-delay max-w-md text-base leading-relaxed text-text-muted sm:text-lg">
            One page for your identity, links, and affiliate trail.
          </p>

          <div className="lh-rise-delay-2">
            <HomeAuthActions />
          </div>
        </div>
      </section>

      <section className="relative border-t border-border px-6 py-20">
        <div className="mx-auto flex max-w-lg flex-col gap-4 text-center">
          <h2 className="font-display text-2xl font-semibold text-text sm:text-3xl">
            Publish your signal
          </h2>
          <p className="text-base leading-relaxed text-text-muted">
            Claim a username, stack your links, and share{" "}
            <span className="text-brand">/u/you</span> — draft until you&apos;re
            ready, then go live.
          </p>
        </div>
      </section>
    </main>
  );
}
