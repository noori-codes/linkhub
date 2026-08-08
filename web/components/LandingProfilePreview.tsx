import Link from "next/link";

import { PhoneFrame } from "@/components/profile/PhoneFrame";
import { PublicProfileView } from "@/components/profile/PublicProfileView";
import { getLandingDemo } from "@/lib/api";
import { LANDING_DEMO_USERNAME } from "@/lib/demo";

function OfflineFallback() {
  return (
    <div className="mx-auto w-[292px] max-w-full">
      <PhoneFrame className="w-full min-w-0">
        <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
          <p className="text-[12px] leading-relaxed text-text-muted">
            Live demo needs the API and a published profile at{" "}
            <span className="text-text">/u/{LANDING_DEMO_USERNAME}</span>.
          </p>
          <Link
            href={`/u/${LANDING_DEMO_USERNAME}`}
            className="mt-5 text-[12px] font-semibold text-brand hover:underline"
          >
            Open /u/{LANDING_DEMO_USERNAME} →
          </Link>
        </div>
      </PhoneFrame>
    </div>
  );
}

export async function LandingProfilePreview() {
  const demo = await getLandingDemo(LANDING_DEMO_USERNAME);

  if (!demo) {
    return <OfflineFallback />;
  }

  return (
    <Link
      href={`/u/${demo.profile.username}`}
      className="mx-auto block w-[292px] max-w-full outline-none transition-transform duration-300 ease-out hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-text/20"
      aria-label={`See ${demo.profile.displayName || demo.profile.username}'s live profile`}
    >
      <PhoneFrame className="w-full min-w-0">
        <PublicProfileView
          profile={demo.profile}
          links={demo.links}
          variant="preview"
          inertLinks
        />
      </PhoneFrame>
    </Link>
  );
}
