type Props = {
  hasAvatar: boolean;
  hasLinks: boolean;
  isPublished: boolean;
  username: string;
};

type Step = {
  id: string;
  done: boolean;
  label: string;
  hint: string;
};

// Derived from live profile/links — no extra API. Answers “what do I do next?”
export function FirstRunGuide({
  hasAvatar,
  hasLinks,
  isPublished,
  username,
}: Props) {
  const steps: Step[] = [
    {
      id: "avatar",
      done: hasAvatar,
      label: "Add an avatar",
      hint: "Open Profile and upload a photo.",
    },
    {
      id: "link",
      done: hasLinks,
      label: "Add your first link",
      hint: "Open Links and add one.",
    },
    {
      id: "publish",
      done: isPublished,
      label: "Publish your page",
      hint: `Open Settings and publish so /u/${username} goes live.`,
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;

  // All three done — checklist can disappear
  if (doneCount === steps.length) {
    return null;
  }

  return (
    <section
      className="rounded-xl border border-brand/40 bg-brand-muted px-4 py-4"
      aria-label="Getting started"
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-text">Getting started</p>
        <p className="text-xs text-text-muted">
          {doneCount}/{steps.length}
        </p>
      </div>

      <ol className="mt-3 flex flex-col gap-2.5">
        {steps.map((step, index) => (
          <li key={step.id} className="flex gap-2.5 text-sm">
            <span
              className={
                step.done
                  ? "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-brand text-xs font-medium text-text-inverse"
                  : "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-border text-xs text-text-muted"
              }
              aria-hidden
            >
              {step.done ? "✓" : index + 1}
            </span>
            <div className="min-w-0">
              <p className={step.done ? "text-text" : "font-medium text-text"}>
                {step.label}
              </p>
              {!step.done ? (
                <p className="mt-0.5 text-xs text-text-muted">{step.hint}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
