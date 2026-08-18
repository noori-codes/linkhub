import Link from "next/link";

import { ClientAuthGate } from "@/components/ClientAuthGate";
import HomeAuthActions from "@/components/HomeAuthActions";
import { LandingProfilePreview } from "@/components/LandingProfilePreview";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getAppHost } from "@/lib/app-host";
import { LANDING_DEMO_USERNAME } from "@/lib/demo";
import { uiBtnSecondary } from "@/lib/ui";

const FEATURES = [
  {
    title: "Links you control",
    body: "Add, hide, and reorder. Visitors only see what you choose to publish.",
  },
  {
    title: "Design that stays live",
    body: "Themes and button shapes update the preview as you edit — no guesswork.",
  },
  {
    title: "A shop on the same page",
    body: "Products, collections, and buy links sit next to your bio — not a second site.",
  },
  {
    title: "Clear after you publish",
    body: "Views, clicks, and shares, so you know what people actually open.",
  },
];

export default function Home() {
  const productUrl = `${getAppHost()}/u/you`;

  return (
    <ClientAuthGate>
      <main className="flex flex-1 flex-col">
        <SiteHeader />

        <section className="grid lg:min-h-[calc(100svh-3.5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-14 xl:px-20">
            <div className="lh-rise max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                Link in bio
              </p>

              <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-text sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08]">
                Your whole presence, one public page.
              </h1>

              <p className="mt-5 max-w-md text-base leading-relaxed text-text-muted sm:text-lg">
                Draft privately, then publish links, a look, and a shop at{" "}
                <span className="font-mono text-[0.92em] text-text">
                  {productUrl}
                </span>
                .
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <HomeAuthActions />
                <Link href={`/u/${LANDING_DEMO_USERNAME}`} className={uiBtnSecondary}>
                  See a sample
                </Link>
              </div>
            </div>
          </div>

          <div className="relative flex flex-col items-center justify-center overflow-hidden bg-bg-elevated px-6 py-14 lg:border-l lg:border-border lg:px-10 lg:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,#ffffff_0%,#f3f4f6_70%)]"
            />
            <div className="lh-rise lh-rise-delay relative flex flex-col items-center">
              <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted">
                Sample · @{LANDING_DEMO_USERNAME}
              </p>
              <LandingProfilePreview />
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-surface px-6 py-16 sm:px-10 lg:px-14">
          <div className="mx-auto max-w-5xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">
              What you get
            </p>
            <h2 className="font-display mt-3 max-w-lg text-2xl font-semibold tracking-tight text-text sm:text-3xl">
              Built for a page people actually open.
            </h2>

            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => (
                <li
                  key={feature.title}
                  className="rounded-2xl border border-border bg-bg-elevated p-5"
                >
                  <p className="text-sm font-semibold tracking-tight text-text">
                    {feature.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">
                    {feature.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <SiteFooter />
      </main>
    </ClientAuthGate>
  );
}
