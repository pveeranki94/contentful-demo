import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[2.2rem] border border-border bg-paper/92 p-10 shadow-[0_24px_80px_rgba(55,44,34,0.1)]">
        <p className="text-xs uppercase tracking-[0.24em] text-ink/58">404</p>
        <h1 className="mt-4 font-serif text-5xl text-ink">This ritual could not be found.</h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-ink/82">
          The page may have moved, or the entry may still be in draft. Return to the
          storefront and explore the live campaign edit instead.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
