"use client";

import { Send } from "lucide-react";
import { useLang } from "./LanguageProvider";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-card)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-white font-bold text-sm">
                CV
              </div>
              <span className="text-lg font-bold">CryptoVision</span>
            </div>
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">
              {t.footer.tagline}
            </p>
            {/* Social */}
            <div className="mt-4 flex gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                <Send size={16} />
              </a>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-sm font-semibold">{t.footer.product}</h4>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-text-muted)]">
              <li>
                <a href="#features" className="transition hover:text-[var(--color-accent-light)]">
                  Bot Scalping
                </a>
              </li>
              <li>
                <a href="#features" className="transition hover:text-[var(--color-accent-light)]">
                  Bot Swing
                </a>
              </li>
              <li>
                <a href="#pricing" className="transition hover:text-[var(--color-accent-light)]">
                  {t.nav.pricing}
                </a>
              </li>
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="text-sm font-semibold">{t.footer.company}</h4>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-text-muted)]">
              <li>
                <a href="#" className="transition hover:text-[var(--color-accent-light)]">
                  {t.footer.about}
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-[var(--color-accent-light)]">
                  {t.footer.contact}
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-[var(--color-accent-light)]">
                  {t.footer.terms}
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-[var(--color-accent-light)]">
                  {t.footer.privacy}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-[var(--color-border)] pt-6">
          <p className="text-xs text-[var(--color-text-muted)]">
            {t.footer.disclaimer}
          </p>
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            &copy; {new Date().getFullYear()} CryptoVision. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
