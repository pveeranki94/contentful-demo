"use client";

import { useState } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/deals", label: "Deals" },
  { href: "/about", label: "About" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label="Toggle navigation"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-paper/85 text-ink shadow-[0_10px_24px_rgba(45,38,31,0.08)]"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="sr-only">Menu</span>
        <div className="space-y-1.5">
          <span className={cn("block h-px w-5 bg-current transition", open && "translate-y-2 rotate-45")} />
          <span className={cn("block h-px w-5 bg-current transition", open && "opacity-0")} />
          <span className={cn("block h-px w-5 bg-current transition", open && "-translate-y-2 -rotate-45")} />
        </div>
      </button>

      {open ? (
        <div className="absolute inset-x-4 top-24 z-50 rounded-[2rem] border border-border bg-paper/95 p-6 shadow-[0_24px_80px_rgba(35,32,28,0.16)] backdrop-blur">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl px-4 py-3 text-base text-ink transition hover:bg-sand"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
