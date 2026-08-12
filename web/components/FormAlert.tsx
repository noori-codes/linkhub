import type { ReactNode } from "react";

type FormAlertProps = {
  variant: "error" | "success";
  title?: string;
  children: ReactNode;
};

const styles = {
  error: {
    wrap: "border-danger/25 bg-danger/[0.06]",
    icon: "text-danger",
    title: "text-danger",
    body: "text-text",
  },
  success: {
    wrap: "border-success/25 bg-success/[0.06]",
    icon: "text-success",
    title: "text-success",
    body: "text-text",
  },
} as const;

function AlertIcon({ variant }: { variant: "error" | "success" }) {
  if (variant === "success") {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="size-5 shrink-0"
        aria-hidden
      >
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M6.5 10.2 8.8 12.5 13.5 7.8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-5 shrink-0" aria-hidden>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 6.5v4.25M10 13.5h.01"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FormAlert({ variant, title, children }: FormAlertProps) {
  const s = styles[variant];

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`flex gap-3 rounded-xl border px-3.5 py-3 ${s.wrap}`}
    >
      <span className={`mt-0.5 ${s.icon}`}>
        <AlertIcon variant={variant} />
      </span>
      <div className="min-w-0">
        {title ? (
          <p className={`text-sm font-semibold ${s.title}`}>{title}</p>
        ) : null}
        <p
          className={`text-sm leading-relaxed ${title ? "mt-0.5" : ""} ${s.body}`}
        >
          {children}
        </p>
      </div>
    </div>
  );
}
