import Link from "next/link";

import { PhoneFrame } from "@/components/profile/PhoneFrame";
import { PublicProfileView } from "@/components/profile/PublicProfileView";
import {
  DEMO_LINKS,
  DEMO_PROFILE,
  LANDING_DEMO_USERNAME,
} from "@/lib/demo";

export function LandingProfilePreview() {
  return (
    <Link
      href={`/u/${LANDING_DEMO_USERNAME}`}
      className="mx-auto block w-[292px] max-w-full outline-none transition-transform duration-300 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-text/20"
      aria-label="See the sample LinkHub demo page"
    >
      <PhoneFrame className="w-full min-w-0">
        <PublicProfileView
          profile={DEMO_PROFILE}
          links={DEMO_LINKS}
          variant="preview"
          inertLinks
        />
      </PhoneFrame>
    </Link>
  );
}
