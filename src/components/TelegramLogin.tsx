"use client";

import { useEffect, useRef } from "react";
import { Send } from "lucide-react";

type TelegramLoginData = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

export default function TelegramLogin() {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Define global callback
    (window as unknown as Record<string, unknown>).onTelegramAuth = async (
      user: TelegramLoginData,
    ) => {
      try {
        const res = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        });

        if (res.ok) {
          window.location.href = "/dashboard";
        } else {
          const err = await res.json();
          alert(err.error || "Login failed");
        }
      } catch {
        alert("Network error");
      }
    };

    // Load Telegram widget script
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute(
      "data-telegram-login",
      process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "CryptoVisionID",
    );
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");

    containerRef.current?.appendChild(script);
  }, []);

  return (
    <div>
      {/* Telegram widget renders here */}
      <div ref={containerRef} className="flex justify-center" />

      {/* Fallback visual button (hidden when widget loads) */}
      <noscript>
        <div className="flex items-center justify-center gap-2 rounded-xl bg-[#2AABEE] px-6 py-3 text-white font-semibold">
          <Send size={18} />
          Login with Telegram
        </div>
      </noscript>
    </div>
  );
}
