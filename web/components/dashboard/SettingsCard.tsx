import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  /** Optional status on the right of the title (e.g. Live / Draft) */
  badge?: ReactNode;
};

/** Standard settings panel — title, short help, content. Used across Settings. */
export function SettingsCard({ title, description, children, badge }: Props) {
  return (
    <section className="rounded-lg border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-text">{title}</h2>
          {description ? (
            <p className="mt-1 text-xs leading-relaxed text-text-muted">
              {description}
            </p>
          ) : null}
        </div>
        {badge ? <div className="shrink-0">{badge}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
