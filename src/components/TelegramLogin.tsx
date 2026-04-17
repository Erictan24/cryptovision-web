"use client";

import { useEffect } from "react";
import { Send } from "lucide-react";

const BOT_USERNAME = "CryptoVisionIDbot";
const BOT_ID = "8493902849";

export default function TelegramLogin() {
  // Handle callback from Telegram OAuth redirect
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes("tgAuthResult=")) return;

    // Parse Telegram auth result from URL fragment
    const encoded = hash.split("tgAuthResult=")[1];
    if (!encoded) return;

    try {
      // Decode base64 → JSON
      const json = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
      const user = JSON.parse(json);

      // Send to our API for verification
      fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      }).then(async (res) => {
        if (res.ok) {
          window.location.href = "/dashboard";
        } else {
          const err = await res.json();
          alert(err.error || "Login failed");
        }
      });
    } catch {
      // Not a valid auth result, ignore
    }
  }, []);

  // Build Telegram OAuth URL (redirect method — more reliable than widget)
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const redirectUrl = `${origin}/login`;
  const telegramUrl =
    `https://oauth.telegram.org/auth?bot_id=${BOT_ID}` +
    `&origin=${encodeURIComponent(origin)}` +
    `&embed=1&request_access=write` +
    `&return_to=${encodeURIComponent(redirectUrl)}`;

  return (
    <div className="flex flex-col gap-3">
      {/* Primary: Telegram OAuth redirect button */}
      <a
        href={telegramUrl}
        className="flex items-center justify-center gap-2 rounded-xl bg-[#2AABEE] px-6 py-3 text-white font-semibold transition hover:bg-[#229ED9] active:scale-[0.98]"
      >
        <Send size={18} />
        Login with Telegram
      </a>

      {/* Alternative: Direct bot link (manual flow) */}
      <a
        href={`https://t.me/${BOT_USERNAME}?start=login`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-6 py-3 text-sm text-[var(--color-text-secondary)] transition hover:border-[#2AABEE] hover:text-[#2AABEE]"
      >
        <Send size={16} />
        Open in Telegram App
      </a>
    </div>
  );
}
