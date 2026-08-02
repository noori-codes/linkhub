import HomeAuthActions from "@/components/HomeAuthActions";
import { LandingProfilePreview } from "@/components/LandingProfilePreview";
import { SiteHeader } from "@/components/SiteHeader";

/**
 * Landing: real product site shell + live demo profile in the hero.
 */
export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader />

      {/* Hero — one composition: brand + line + CTA | product */}
      <section className="grid flex-1 lg:min-h-[calc(100svh-3.5rem)] lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-14 xl:px-20">
          <p className="font-display text-5xl font-bold tracking-tight text-text sm:text-6xl lg:text-7xl">
            LinkHub
          </p>

          <p className="mt-5 max-w-md text-lg leading-relaxed text-text-muted">
            One public page for your bio and links. Edit in draft, publish when
            you&apos;re ready.
          </p>

          <div className="mt-8">
            <HomeAuthActions />
          </div>
        </div>

        <div className="flex items-center justify-center border-t border-border bg-bg-elevated px-6 py-14 lg:border-l lg:border-t-0">
          <LandingProfilePreview />
        </div>
      </section>

      {/* Below fold — short path, not a marketing essay */}
      <section className="border-t border-border px-6 py-16 sm:px-10">
        <div className="mx-auto grid max-w-4xl gap-10 sm:grid-cols-3 sm:gap-8">
          <div>
            <p className="text-sm font-medium text-text">Claim a username</p>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">
              Your page lives at <span className="text-text">/u/you</span>.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-text">Add your links</p>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">
              Reorder, hide, and update anytime.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-text">Publish when ready</p>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">
              Stay private in draft until you go live.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
