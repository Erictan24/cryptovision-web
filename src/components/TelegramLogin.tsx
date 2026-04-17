"use client";

import { Send } from "lucide-react";
import { useLang } from "./LanguageProvider";

const BOT_USERNAME = "CryptoVisionIDbot";

export default function TelegramLogin() {
  const { locale } = useLang();

  return (
    <div className="flex flex-col gap-3">
      {/* Primary: Open Telegram bot → bot sends login link */}
      <a
        href={`https://t.me/${BOT_USERNAME}?start=weblogin`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-xl bg-[#2AABEE] px-6 py-3.5 text-white font-semibold transition hover:bg-[#229ED9] active:scale-[0.98]"
      >
        <Send size={18} />
        {locale === "id" ? "Login via Telegram" : "Login with Telegram"}
      </a>

      <p className="text-center text-xs text-[var(--color-text-muted)]">
        {locale === "id"
          ? "Klik tombol di atas → buka Telegram → bot kirim link login"
          : "Click button above → open Telegram → bot sends login link"}
      </p>
    </div>
  );
}
