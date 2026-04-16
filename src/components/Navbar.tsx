"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLang } from "./LanguageProvider";

export default function Navbar() {
  const { locale, t, toggle } = useLang();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#features", label: t.nav.features },
    { href: "#pricing", label: t.nav.pricing },
    { href: "#faq", label: t.nav.faq },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-white font-bold text-sm">
            CV
          </div>
          <span className="text-lg font-bold text-[var(--color-text-primary)] glow-text">
            CryptoVision
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-[var(--color-text-secondary)] transition hover:text-[var(--color-accent-light)]"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Lang toggle */}
          <button
            onClick={toggle}
            className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent-light)]"
          >
            {locale === "id" ? "EN" : "ID"}
          </button>

          {/* CTA */}
          <a
            href="#pricing"
            className="hidden rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-light)] glow-blue sm:block"
          >
            {t.nav.cta}
          </a>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="text-[var(--color-text-secondary)] md:hidden"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-4 md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-[var(--color-text-secondary)] transition hover:text-[var(--color-accent-light)]"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#pricing"
            onClick={() => setOpen(false)}
            className="mt-3 block rounded-lg bg-[var(--color-accent)] px-4 py-2 text-center text-sm font-semibold text-white"
          >
            {t.nav.cta}
          </a>
        </div>
      )}
    </nav>
  );
}
