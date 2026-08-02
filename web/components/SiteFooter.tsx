import Image from "next/image";
import Link from "next/link";

/** Closes marketing pages so they feel finished. */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-bg-elevated px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Image
            src="/linkhub-mark.png"
            alt=""
            width={22}
            height={22}
            unoptimized
          />
          <div>
            <p className="text-sm font-medium text-text">LinkHub</p>
            <p className="mt-1 max-w-xs text-sm text-text-muted">
              Your bio and links on one public page.
            </p>
          </div>
        </div>

        <nav
          className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-muted"
          aria-label="Legal"
        >
          <Link href="/privacy" className="hover:text-text">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-text">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
