"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import { useLang } from "./LanguageProvider";

const AUTO_REPLIES: Record<string, { id: string; en: string }> = {
  harga: { id: "Kami punya paket mulai dari FREE. Cek halaman pricing untuk detail lengkap!", en: "We have plans starting from FREE. Check our pricing page for details!" },
  price: { id: "Kami punya paket mulai dari FREE. Cek halaman pricing untuk detail lengkap!", en: "We have plans starting from FREE. Check our pricing page for details!" },
  bayar: { id: "Kami terima BCA, Dana, GoPay, dan USDT (BEP20). Pilih metode saat checkout.", en: "We accept BCA, Dana, GoPay, and USDT (BEP20). Choose at checkout." },
  pay: { id: "Kami terima BCA, Dana, GoPay, dan USDT (BEP20). Pilih metode saat checkout.", en: "We accept BCA, Dana, GoPay, and USDT (BEP20). Choose at checkout." },
  aman: { id: "Bot hanya pakai API key untuk trading. Bot TIDAK bisa withdraw dana kamu. Dana tetap di exchange kamu.", en: "The bot only uses API keys for trading. It CANNOT withdraw your funds. Your money stays in your exchange." },
  safe: { id: "Bot hanya pakai API key untuk trading. Bot TIDAK bisa withdraw dana kamu. Dana tetap di exchange kamu.", en: "The bot only uses API keys for trading. It CANNOT withdraw your funds. Your money stays in your exchange." },
  modal: { id: "Minimal $50, rekomendasikan $100-$300 untuk hasil optimal. Risk per trade bisa diatur.", en: "Minimum $50, we recommend $100-$300 for optimal results. Risk per trade is adjustable." },
  capital: { id: "Minimal $50, rekomendasikan $100-$300 untuk hasil optimal. Risk per trade bisa diatur.", en: "Minimum $50, we recommend $100-$300 for optimal results. Risk per trade is adjustable." },
  exchange: { id: "Kami support Bitunix, MEXC, dan BingX untuk futures trading.", en: "We support Bitunix, MEXC, and BingX for futures trading." },
  profit: { id: "Bot kami punya WR 73% (scalping + swing combined). Backtest menunjukkan profit konsisten.", en: "Our bot has 73% WR (scalping + swing combined). Backtests show consistent profits." },
  winrate: { id: "Bot kami punya WR 73% (scalping + swing combined). Backtest menunjukkan profit konsisten.", en: "Our bot has 73% WR (scalping + swing combined). Backtests show consistent profits." },
};

type Message = { text: string; from: "user" | "bot"; time: string };

export default function ChatWidget() {
  const { locale } = useLang();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: locale === "id"
        ? "Halo! Ada yang bisa dibantu tentang CryptoVision? Ketik pertanyaan atau hubungi admin langsung."
        : "Hi! Need help with CryptoVision? Type your question or contact admin directly.",
      from: "bot",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = { text: input, from: "user", time: now };
    setMessages((m) => [...m, userMsg]);

    // Auto reply
    const lower = input.toLowerCase();
    let reply = locale === "id"
      ? "Terima kasih! Untuk pertanyaan lebih lanjut, hubungi admin di Telegram."
      : "Thanks! For further questions, contact admin on Telegram.";

    for (const [key, val] of Object.entries(AUTO_REPLIES)) {
      if (lower.includes(key)) {
        reply = locale === "id" ? val.id : val.en;
        break;
      }
    }

    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { text: reply, from: "bot", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
      ]);
    }, 800);

    setInput("");
  };

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)] text-white shadow-lg transition-all hover:scale-110"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{ boxShadow: "0 0 25px rgba(59,155,217,0.4)" }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-22 right-5 z-50 w-80 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[var(--color-accent)] p-4">
              <div className="flex items-center gap-3">
                <img src="/logo.jpg" alt="" className="h-10 w-10 rounded-full object-cover border-2 border-white/30" />
                <div>
                  <p className="font-semibold text-white text-sm">CryptoVision</p>
                  <p className="text-xs text-white/70 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
                    {locale === "id" ? "Online" : "Online"}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-64 overflow-y-auto p-3 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                      m.from === "user"
                        ? "bg-[var(--color-accent)] text-white rounded-br-sm"
                        : "bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                    <p className={`mt-1 text-[9px] ${m.from === "user" ? "text-white/50" : "text-[var(--color-text-muted)]"}`}>
                      {m.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Admin button */}
            <div className="px-3 pb-2">
              <a
                href="https://t.me/CryptoVisionID"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-lg border border-[var(--color-border)] py-1.5 text-center text-xs text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                {locale === "id" ? "Chat Admin Langsung" : "Chat Live Admin"} →
              </a>
            </div>

            {/* Input */}
            <div className="border-t border-[var(--color-border)] p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={locale === "id" ? "Ketik pesan..." : "Type a message..."}
                  className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white transition hover:bg-[var(--color-accent-light)]"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
