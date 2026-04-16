"use client";

import { useState } from "react";
import { Menu, X, User } from "lucide-react";
import { useLang } from "./LanguageProvider";
import { useAuth } from "./AuthProvider";

export default function Navbar() {
  const { locale, t, toggle } = useLang();
  const { user, loading } = useAuth();
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
        <a href="/" className="flex items-center gap-2">
          <img src="/logo.jpg" alt="CryptoVision" className="h-8 w-8 rounded-lg object-cover" />
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

          {/* Auth button */}
          {!loading && user ? (
            <a
              href="/dashboard"
              className="hidden items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm transition hover:border-[var(--color-accent)] sm:flex"
            >
              {user.photo ? (
                <img src={user.photo} alt="" className="h-5 w-5 rounded-full" />
              ) : (
                <User size={14} className="text-[var(--color-accent)]" />
              )}
              <span className="text-[var(--color-text-secondary)]">{user.name}</span>
            </a>
          ) : (
            <a
              href="/login"
              className="hidden rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-light)] glow-blue sm:block"
            >
              {locale === "id" ? "Masuk" : "Login"}
            </a>
          )}

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
          {!loading && user ? (
            <a
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="mt-3 block rounded-lg border border-[var(--color-accent)] px-4 py-2 text-center text-sm font-semibold text-[var(--color-accent)]"
            >
              Dashboard
            </a>
          ) : (
            <a
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-3 block rounded-lg bg-[var(--color-accent)] px-4 py-2 text-center text-sm font-semibold text-white"
            >
              {locale === "id" ? "Masuk" : "Login"}
            </a>
          )}
        </div>
      )}
    </nav>
  );
}
