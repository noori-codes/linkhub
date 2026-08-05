"use client";

import { useState, type InputHTMLAttributes } from "react";

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden
      >
        <path d="M2.06 12.32c.2-.52 1.78-4.32 9.94-4.32s9.74 3.8 9.94 4.32a1 1 0 0 1 0 .76c-.2.52-1.78 4.32-9.94 4.32S2.26 13.6 2.06 13.08a1 1 0 0 1 0-.76Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c8.16 0 9.74 3.8 9.94 4.32a1 1 0 0 1 0 .76 12.8 12.8 0 0 1-1.94 2.94" />
      <path d="M6.61 6.61A13.5 13.5 0 0 0 2.06 11.68a1 1 0 0 0 0 .76c.2.52 1.78 4.32 9.94 4.32a10.4 10.4 0 0 0 3.1-.46" />
      <path d="m2 2 20 20" />
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    </svg>
  );
}

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  /** Extra classes on the outer border wrapper */
  wrapperClassName?: string;
};

/** Password field with show / hide eye toggle. */
export function PasswordInput({
  className = "",
  wrapperClassName = "",
  disabled,
  ...props
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={`flex overflow-hidden border border-border bg-bg focus-within:border-brand ${
        wrapperClassName.includes("rounded") ? "" : "rounded-xl"
      } ${disabled ? "opacity-60" : ""} ${wrapperClassName}`}
    >
      <input
        {...props}
        disabled={disabled}
        type={visible ? "text" : "password"}
        className={`min-w-0 flex-1 border-0 bg-transparent px-3.5 py-2.5 text-sm text-text outline-none ${className}`}
      />
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        onClick={() => setVisible((v) => !v)}
        className="flex shrink-0 items-center px-3 text-text-muted hover:text-text disabled:pointer-events-none"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
      >
        <EyeIcon open={visible} />
      </button>
    </div>
  );
}
