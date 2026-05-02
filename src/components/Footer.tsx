"use client";

import { Send } from "lucide-react";
import { useLang } from "./LanguageProvider";

// SVG icons for socials (inline to avoid deps)
const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

const SOCIALS = [
  { icon: TelegramIcon, href: "https://t.me/CryptoVisionID", label: "Telegram" },
  { icon: InstagramIcon, href: "https://www.instagram.com/cryptovisionid", label: "Instagram" },
  { icon: TikTokIcon, href: "https://www.tiktok.com/@cryptovisionid", label: "TikTok" },
];

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-card)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <img src="/logo.jpg" alt="CryptoVision" className="h-8 w-8 rounded-lg object-cover" />
              <span className="text-lg font-bold">CryptoVision</span>
            </div>
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">
              {t.footer.tagline}
            </p>
            {/* Social */}
            <div className="mt-4 flex gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] transition-all duration-300 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:scale-110 hover:shadow-[0_0_15px_rgba(59,155,217,0.3)]"
                >
                  <s.icon />
                </a>
              ))}
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
                <a href="https://t.me/CryptoVisionID" target="_blank" rel="noopener noreferrer" className="transition hover:text-[var(--color-accent-light)]">
                  {t.footer.contact}
                </a>
              </li>
              <li>
                <a href="/terms" className="transition hover:text-[var(--color-accent-light)]">
                  {t.footer.terms}
                </a>
              </li>
              <li>
                <a href="/privacy" className="transition hover:text-[var(--color-accent-light)]">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/disclaimer" className="transition hover:text-[var(--color-accent-light)]">
                  Risk Disclaimer
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
