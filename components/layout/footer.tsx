import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/80 bg-[linear-gradient(180deg,rgba(244,239,233,0.45),rgba(231,223,214,0.72))]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.25fr_1fr_1fr] lg:px-8">
        <div>
          <p className="font-serif text-3xl text-ink">Serein House</p>
          <p className="mt-4 max-w-md text-sm leading-7 text-ink/82">
            A fictional premium wellness and home brand built to demonstrate
            campaign merchandising, Contentful preview, and Vercel-ready deployment.
          </p>
        </div>
        <div>
          <h2 className="text-xs uppercase tracking-[0.24em] text-ink/58">Explore</h2>
          <div className="mt-5 flex flex-col gap-3 text-sm text-ink/86">
            <Link href="/">Home</Link>
            <Link href="/deals">Deals</Link>
            <Link href="/about">About</Link>
          </div>
        </div>
        <div>
          <h2 className="text-xs uppercase tracking-[0.24em] text-ink/58">Demo Focus</h2>
          <div className="mt-5 flex flex-col gap-3 text-sm text-ink/86">
            <p>Campaign lifecycle</p>
            <p>Preview and live preview</p>
            <p>Personalization and analytics</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
