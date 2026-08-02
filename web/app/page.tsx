import HomeAuthActions from "@/components/HomeAuthActions";
import { LandingProfilePreview } from "@/components/LandingProfilePreview";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getAppHost } from "@/lib/app-host";

export default function Home() {
  const productUrl = `${getAppHost()}/u/you`;

  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader />

      <section className="grid flex-1 lg:min-h-[calc(100svh-3.5rem)] lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-14 xl:px-20">
          <h1 className="font-display text-5xl font-bold tracking-tight text-text sm:text-6xl">
            LinkHub
          </h1>

          <p
            className="mt-5 inline-flex w-fit items-center rounded-md border border-border bg-surface px-3 py-1.5 font-mono text-sm text-text-muted"
            title="Your public page URL"
          >
            {productUrl}
          </p>

          <p className="mt-5 max-w-md text-base leading-relaxed text-text-muted sm:text-lg">
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

      <section className="border-t border-border px-6 py-14 sm:px-10">
        <div className="mx-auto flex max-w-xl flex-col items-start gap-5 sm:items-center sm:text-center">
          <p className="text-base text-text-muted sm:text-lg">
            Draft privately. Publish when ready.
          </p>
          <HomeAuthActions primaryOnly />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
