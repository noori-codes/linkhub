import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold text-text">Profile not found</h1>
      <p className="mt-3 max-w-sm text-sm text-text-muted">
        This profile is missing, still a draft, or the username is wrong.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-text-inverse hover:bg-brand-hover"
      >
        Back home
      </Link>
    </main>
  );
}
