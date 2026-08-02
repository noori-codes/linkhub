type Props = {
  isDraft: boolean;
  hasLinks: boolean;
  username: string;
};

// Soft checklist for brand-new accounts — answers “what do I do next?”
export function FirstRunGuide({ isDraft, hasLinks, username }: Props) {
  // Once published and they already have links, the funnel is done
  if (!isDraft && hasLinks) {
    return null;
  }

  return (
    <section
      className="rounded-md border border-brand/40 bg-brand-muted px-4 py-4"
      aria-label="Getting started"
    >
      <p className="text-sm font-medium text-text">Getting started</p>
      <ol className="mt-3 flex flex-col gap-2 text-sm text-text-muted">
        <li className={hasLinks ? "text-text" : undefined}>
          <span className="text-brand">1.</span>{" "}
          {hasLinks
            ? "You’ve added a link — add more anytime below."
            : "Add your first link in the main column."}
        </li>
        <li>
          <span className="text-brand">2.</span>{" "}
          {isDraft
            ? "When you’re ready, hit Publish in this sidebar so /u/" +
              username +
              " goes live."
            : "Your page is live at /u/" + username + "."}
        </li>
      </ol>
    </section>
  );
}
