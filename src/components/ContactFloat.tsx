"use client";

import { useState } from "react";
import { MessageCircle, X, Send, Instagram, Music2, Bot, MessageSquare } from "lucide-react";
import { useLang } from "./LanguageProvider";

type ContactItem = {
  icon: typeof MessageCircle;
  label: string;
  href: string;
  bgClass: string;
};

export default function ContactFloat() {
  const { locale } = useLang();
  const [open, setOpen] = useState(false);

  const items: ContactItem[] = [
    {
      icon: Bot,
      label: locale === "id" ? "Bot Telegram" : "Telegram Bot",
      href: "https://t.me/CryptoVisionID_bot",
      bgClass: "bg-[#0088cc]",
    },
    {
      icon: Send,
      label: locale === "id" ? "Channel Telegram" : "Telegram Channel",
      href: "https://t.me/CryptoVisionID",
      bgClass: "bg-[#229ED9]",
    },
    {
      icon: Instagram,
      label: "Instagram",
      href: "https://www.instagram.com/cryptovisionid",
      bgClass: "bg-gradient-to-br from-[#feda75] via-[#fa7e1e] via-[#d62976] to-[#962fbf]",
    },
    {
      icon: Music2,
      label: "TikTok",
      href: "https://www.tiktok.com/@cryptovisionid",
      bgClass: "bg-black border border-white/20",
    },
    {
      icon: MessageSquare,
      label: locale === "id" ? "Chat Admin" : "Chat Admin",
      href: "https://t.me/Erictan24",
      bgClass: "bg-[var(--color-accent)]",
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Expandable items */}
      {open && (
        <div className="flex flex-col items-end gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {items.map((item, i) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="hidden sm:inline rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                {item.label}
              </span>
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110 ${item.bgClass}`}
                title={item.label}
              >
                <item.icon size={20} />
              </span>
            </a>
          ))}
        </div>
      )}

      {/* Main toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)] text-white shadow-2xl transition-all hover:scale-110 hover:bg-[var(--color-accent-light)]"
        aria-label={open ? "Close contact" : "Open contact"}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}
