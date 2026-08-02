import type { PublicLink } from "@/lib/types";

type Props = {
  links: PublicLink[];
};

// Preview under the hero — same rows visitors see on /u/[username]
export function ProfileLinksPreview({ links }: Props) {
  const visible = links.filter((link) => link.isVisible);

  return (
    <section className="mt-6 flex flex-col gap-3" aria-label="Links preview">
      <h2 className="text-sm font-medium text-text-muted">Links</h2>

      {visible.length === 0 ? (
        <p className="text-sm text-text-muted">
          No visible links yet. Add some in the Links sidebar.
        </p>
      ) : (
        visible.map((link) => (
          <a
            key={link._id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-lg border border-border bg-surface px-4 py-3.5 text-center text-base font-medium text-text transition-colors duration-200 hover:bg-bg"
          >
            <span className="transition-colors group-hover:text-brand">
              {link.title}
            </span>
          </a>
        ))
      )}
    </section>
  );
}
