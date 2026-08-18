import Link from "next/link";

import { ClientAuthGate } from "@/components/ClientAuthGate";
import HomeAuthActions from "@/components/HomeAuthActions";
import { LandingProfilePreview } from "@/components/LandingProfilePreview";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getAppHost } from "@/lib/app-host";
import { LANDING_DEMO_USERNAME } from "@/lib/demo";

export default function Home() {
  const productUrl = `${getAppHost()}/u/you`;

  return (
    <ClientAuthGate>
      <main className="flex flex-1 flex-col">
      <SiteHeader />

      <section className="grid flex-1 lg:min-h-[calc(100svh-3.5rem)] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="flex flex-col justify-center px-6 py-14 sm:px-10 lg:px-14 xl:px-20">
          <div className="lh-rise max-w-lg">
            <p className="font-display text-5xl font-bold tracking-tight text-text sm:text-6xl lg:text-7xl">
              LinkHub
            </p>

            <h1 className="mt-4 max-w-md text-xl font-semibold tracking-tight text-text sm:text-2xl">
              Your bio and links, one public page.
            </h1>

            <p className="mt-4 max-w-md text-base leading-relaxed text-text-muted sm:text-lg">
              Draft privately, publish when you&apos;re ready — at{" "}
              <span className="font-mono text-[0.95em] text-text">
                {productUrl}
              </span>
              .
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
              <HomeAuthActions />
              <Link
                href={`/u/${LANDING_DEMO_USERNAME}`}
                className="text-sm font-medium text-text-muted transition-colors hover:text-brand"
              >
                See a sample page →
              </Link>
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center overflow-hidden border-t border-border px-6 py-16 lg:border-l lg:border-t-0 lg:px-10 lg:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_55%_40%,#ffffff_0%,#eef1f5_55%,#e4e8ee_100%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,#c5ccd6_1px,transparent_1px),linear-gradient(to_bottom,#c5ccd6_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"
          />
          <div className="lh-rise lh-rise-delay relative">
            <LandingProfilePreview />
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
    </ClientAuthGate>
  );
}
