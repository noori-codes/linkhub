"use client";

import Image from "next/image";
import { forwardRef } from "react";

import { uiBtnIcon } from "@/lib/ui";

type Props = {
  onClick: () => void;
  label?: string;
};

export const DialogCloseButton = forwardRef<HTMLButtonElement, Props>(
  function DialogCloseButton({ onClick, label = "Close" }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-label={label}
        title={label}
        className={uiBtnIcon}
      >
        <Image src="/close.svg" alt="" width={16} height={16} />
      </button>
    );
  },
);
