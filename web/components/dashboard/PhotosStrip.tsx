import type { PublicProfile } from "@/lib/types";

type Props = {
  profile: PublicProfile;
};
export function PhotosStrip({ profile }: Props) {
  const shots: { src: string; label: string }[] = [];

  if (profile.avatarUrl?.startsWith("http")) {
    shots.push({ src: profile.avatarUrl, label: "Avatar" });
  }
  if (profile.coverUrl?.startsWith("http")) {
    shots.push({ src: profile.coverUrl, label: "Cover" });
  }

  return (
    <section className="rounded-md border border-border bg-surface p-5">
      <h2 className="font-display text-xl font-semibold text-text">Photos</h2>
      <p className="mt-1 text-xs text-text-muted">
        Your avatar and cover for now. A full gallery comes later with uploads.
      </p>

      {shots.length === 0 ? (
        <p className="mt-4 text-sm text-text-muted">
          Paste image URLs in Edit profile (sidebar) to see them here.
        </p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {shots.map((shot) => (
            <li key={shot.label} className="flex flex-col gap-1.5">
              <div className="aspect-square overflow-hidden rounded-md border border-border bg-bg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shot.src}
                  alt={shot.label}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-xs text-text-muted">{shot.label}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
