import Link from "next/link";

import { AudienceSelector } from "@/components/ui/audience-selector";
import { MobileNav } from "@/components/layout/mobile-nav";
import type { AudienceSegment, SiteSettingsModel } from "@/types/domain";

interface HeaderProps {
  siteSettings: SiteSettingsModel;
  audienceSegment: AudienceSegment;
}

const navItems = [
  { href: "/", label: "Home" },
  { href: "/deals", label: "Deals" },
  { href: "/about", label: "About" },
];

export function Header({ siteSettings, audienceSegment }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-paper/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="min-w-0">
          <span className="block font-serif text-2xl tracking-[0.16em] text-ink uppercase">
            {siteSettings.siteName}
          </span>
          <span className="hidden text-xs uppercase tracking-[0.24em] text-ink/58 sm:block">
            Quiet rituals for luminous days
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-ink/88 transition hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <AudienceSelector currentSegment={audienceSegment} />
          </div>
          <MobileNav />
        </div>
      </div>
      <div className="border-t border-border/70 px-4 py-3 sm:hidden">
        <AudienceSelector currentSegment={audienceSegment} />
      </div>
    </header>
  );
}
