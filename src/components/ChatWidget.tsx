"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import { useLang } from "./LanguageProvider";

// Smart reply categories — multiple keywords per topic
const REPLY_RULES: Array<{ keywords: string[]; id: string; en: string }> = [
  // Pricing
  { keywords: ["harga", "price", "biaya", "cost", "berapa", "how much", "tarif", "paket", "plan"],
    id: "Kami punya 4 paket:\n• FREE — signal delay, 5 coin\n• 1 Bulan — Rp 449k ($35)\n• 3 Bulan — Rp 999k ($79), hemat 26%\n• 1 Tahun — Rp 2.999k ($239), hemat 44%\n• Lifetime — Rp 4.999k ($399)\n\nCek detail di halaman Harga!",
    en: "We have 4 plans:\n• FREE — delayed signals, 5 coins\n• 1 Month — $35\n• 3 Months — $79 (save 26%)\n• 1 Year — $239 (save 44%)\n• Lifetime — $399\n\nCheck the Pricing page for details!" },
  // Payment
  { keywords: ["bayar", "pay", "payment", "transfer", "bca", "dana", "gopay", "usdt", "pembayaran"],
    id: "Metode pembayaran yang tersedia:\n• BCA Transfer\n• Dana\n• GoPay\n• USDT (BEP20)\n\nPilih saat checkout, transfer manual lalu konfirmasi via Telegram.",
    en: "Available payment methods:\n• BCA Transfer\n• Dana\n• GoPay\n• USDT (BEP20)\n\nChoose at checkout, transfer manually then confirm via Telegram." },
  // Safety
  { keywords: ["aman", "safe", "security", "keamanan", "hack", "scam", "tipu", "trust", "percaya", "withdraw"],
    id: "Keamanan dana kamu adalah prioritas kami:\n• Bot hanya pakai API key untuk trading\n• Bot TIDAK BISA withdraw/transfer dana\n• Dana tetap 100% di exchange kamu\n• API key hanya izin trading, bukan withdraw\n• Kamu bisa cabut akses kapan saja",
    en: "Your fund safety is our priority:\n• Bot only uses API keys for trading\n• Bot CANNOT withdraw/transfer funds\n• Funds stay 100% in your exchange\n• API keys are trade-only, no withdraw\n• You can revoke access anytime" },
  // Capital
  { keywords: ["modal", "capital", "minimum", "mulai", "start", "uang", "money", "invest", "deposit"],
    id: "Modal minimum:\n• Mulai dari $50 sudah bisa\n• Rekomendasi: $100-$300 untuk hasil optimal\n• Risk per trade bisa diatur (0.5-5% modal)\n• Default: $1 per trade (sangat konservatif)\n\nSemakin besar modal, semakin besar potensi profit.",
    en: "Minimum capital:\n• Start from $50\n• Recommended: $100-$300 for optimal results\n• Risk per trade adjustable (0.5-5%)\n• Default: $1 per trade (very conservative)\n\nBigger capital = bigger profit potential." },
  // Exchange
  { keywords: ["exchange", "bitunix", "mexc", "bingx", "binance", "bybit"],
    id: "Bot trading di Futures market exchange yang kamu pilih. Saat ini support sejumlah exchange utama, dengan rencana ekspansi multi-exchange.\n\nKamu perlu buat akun exchange dan generate API key (trading-only, NO withdrawal).",
    en: "Bot trades on Futures market via your chosen exchange. Currently supports several major exchanges, with multi-exchange expansion planned.\n\nYou need to create an exchange account and generate API key (trading-only, NO withdrawal)." },
  // Performance / Track Record
  { keywords: ["profit", "winrate", "win rate", "wr", "untung", "hasil", "performance", "return", "roi"],
    id: "Lihat track record live bot kami secara transparan di:\n\n• Halaman /proof — statistik agregat performa\n• Dashboard /statistik — breakdown per strategi/kualitas/arah\n• Riwayat /riwayat — setiap trade dengan entry, exit, PnL\n\nTransparansi penuh — angka apa adanya, tanpa cherry-pick.",
    en: "View our bot's live track record transparently at:\n\n• /proof — aggregate performance stats\n• /dashboard/statistics — breakdown per strategy/quality/direction\n• /dashboard/history — every trade with entry, exit, PnL\n\nFull transparency — no cherry-picking." },
  // How it works
  { keywords: ["cara", "how", "gimana", "bagaimana", "kerja", "work", "pakai", "use", "setup", "mulai"],
    id: "Cara kerja CryptoVision:\n1. Daftar & pilih paket\n2. Connect exchange via API key\n3. Bot otomatis analisa market 24/7\n4. Bot entry saat ada peluang\n5. Trailing stop otomatis lock profit\n\nKamu tinggal duduk santai!",
    en: "How CryptoVision works:\n1. Sign up & choose a plan\n2. Connect exchange via API key\n3. Bot analyzes market 24/7 automatically\n4. Bot enters when opportunity arises\n5. Auto trailing stop locks profit\n\nJust sit back and relax!" },
  // Scalping vs Swing
  { keywords: ["scalping", "scalp", "swing", "beda", "difference", "timeframe", "strategi", "strategy"],
    id: "Perbedaan Scalping vs Swing:\n\n• Scalping: timeframe 15m, profit kecil tapi sering, ~2 trade/hari\n• Swing: timeframe 1H+4H, profit besar per trade, ~1.7 trade/hari\n\nDengan paket kami kamu dapat DUA-DUANYA, jadi peluang lebih banyak!",
    en: "Scalping vs Swing difference:\n\n• Scalping: 15m timeframe, small frequent profits, ~2 trades/day\n• Swing: 1H+4H timeframe, bigger profits per trade, ~1.7 trades/day\n\nWith our plan you get BOTH, so more opportunities!" },
  // Risk
  { keywords: ["risiko", "risk", "rugi", "loss", "bahaya", "danger", "sl", "stop loss"],
    id: "Manajemen risiko kami:\n• Risk per trade bisa diatur ($1-$50)\n• Stop Loss otomatis di setiap trade\n• Trailing stop lock profit bertahap\n• Max 5 posisi bersamaan\n• Daily loss limit untuk proteksi\n• Circuit breaker: stop setelah 2 SL beruntun",
    en: "Our risk management:\n• Risk per trade adjustable ($1-$50)\n• Automatic Stop Loss on every trade\n• Trailing stop locks profit gradually\n• Max 5 simultaneous positions\n• Daily loss limit for protection\n• Circuit breaker: stops after 2 consecutive SL" },
  // Refund
  { keywords: ["refund", "batal", "cancel", "kembalikan", "return", "garansi", "guarantee"],
    id: "Kebijakan kami:\n• Tidak ada refund setelah subscription aktif\n• Kamu bisa cancel kapan saja (tidak auto-renew)\n• Paket Free tersedia untuk coba dulu\n• Kami rekomendasikan coba Free dulu sebelum upgrade",
    en: "Our policy:\n• No refund after subscription is active\n• You can cancel anytime (no auto-renew)\n• Free plan available to try first\n• We recommend trying Free before upgrading" },
  // Login
  { keywords: ["login", "masuk", "daftar", "register", "sign up", "akun", "account"],
    id: "Cara login/daftar:\n1. Klik 'Masuk' di navbar\n2. Klik 'Login via Telegram'\n3. Buka Telegram, bot kirim link login\n4. Klik link → otomatis masuk dashboard\n\nTidak perlu password! Login aman via Telegram.",
    en: "How to login/register:\n1. Click 'Login' in navbar\n2. Click 'Login via Telegram'\n3. Open Telegram, bot sends login link\n4. Click link → auto login to dashboard\n\nNo password needed! Secure login via Telegram." },
  // Contact
  { keywords: ["kontak", "contact", "hubungi", "admin", "cs", "customer", "support", "bantuan", "help"],
    id: "Hubungi kami:\n• Telegram: @CryptoVisionID\n• Instagram: @cryptovisionid\n• TikTok: @cryptovisionid\n\nAtau klik 'Chat Admin Langsung' di bawah untuk bicara dengan tim kami!",
    en: "Contact us:\n• Telegram: @CryptoVisionID\n• Instagram: @cryptovisionid\n• TikTok: @cryptovisionid\n\nOr click 'Chat Live Admin' below to talk to our team!" },
  // Greeting
  { keywords: ["halo", "hello", "hi", "hey", "hai", "p", "selamat"],
    id: "Halo! Selamat datang di CryptoVision. Ada yang bisa saya bantu? Tanya apa saja tentang bot trading kami!",
    en: "Hello! Welcome to CryptoVision. How can I help you? Ask anything about our trading bot!" },
  // Thanks
  { keywords: ["terima kasih", "thanks", "thank", "makasih", "thx"],
    id: "Sama-sama! Kalau ada pertanyaan lain, jangan sungkan tanya ya. Atau langsung chat admin di Telegram!",
    en: "You're welcome! If you have more questions, feel free to ask. Or chat admin directly on Telegram!" },
];

function findReply(input: string, locale: string): string {
  const lower = input.toLowerCase();
  for (const rule of REPLY_RULES) {
    if (rule.keywords.some(k => lower.includes(k))) {
      return locale === "id" ? rule.id : rule.en;
    }
  }
  // Default fallback
  return locale === "id"
    ? "Maaf, saya belum bisa menjawab pertanyaan itu. Coba tanyakan tentang:\n• Harga & paket\n• Cara kerja bot\n• Keamanan dana\n• Modal minimum\n• Exchange yang didukung\n\nAtau klik 'Chat Admin Langsung' untuk bicara dengan tim kami!"
    : "Sorry, I can't answer that yet. Try asking about:\n• Pricing & plans\n• How the bot works\n• Fund safety\n• Minimum capital\n• Supported exchanges\n\nOr click 'Chat Live Admin' to talk to our team!";
}

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

    // Smart reply
    const reply = findReply(input, locale);

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
