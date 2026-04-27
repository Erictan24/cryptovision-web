"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";

type Term = {
  term: string;
  short: { id: string; en: string };
  full: { id: string; en: string };
  example?: { id: string; en: string };
};

const TERMS: Term[] = [
  {
    term: "Entry",
    short: { id: "Harga masuk posisi", en: "Position entry price" },
    full: {
      id: "Harga di mana kamu beli (LONG) atau jual (SHORT). Bot pasang LIMIT order di harga ini supaya tidak kena slippage.",
      en: "Price where you buy (LONG) or sell (SHORT). Bot places LIMIT order here to avoid slippage.",
    },
  },
  {
    term: "SL (Stop Loss)",
    short: { id: "Batas kerugian maksimal", en: "Maximum loss cutoff" },
    full: {
      id: "Harga di mana posisi otomatis ditutup jika rugi. Risk management — proteksi modal kalau analisa salah.",
      en: "Price where position auto-closes if losing. Risk management — protects capital when analysis is wrong.",
    },
    example: {
      id: "LONG BTC entry $100k, SL $98k = max rugi $2k per BTC kalau salah arah.",
      en: "LONG BTC entry $100k, SL $98k = max loss $2k per BTC if wrong direction.",
    },
  },
  {
    term: "TP1 (Take Profit 1)",
    short: { id: "Target profit pertama (50% posisi)", en: "First profit target (50% position)" },
    full: {
      id: "50% qty di-close di harga TP1 untuk kunci profit. Sisa 50% dibiarkan jalan ke TP2 dengan SL geser ke BEP.",
      en: "50% qty closes at TP1 to lock profit. Remaining 50% rides to TP2 with SL moved to BEP.",
    },
  },
  {
    term: "TP2 (Take Profit 2)",
    short: { id: "Target profit kedua (sisa 50%)", en: "Second profit target (remaining 50%)" },
    full: {
      id: "Target final untuk sisa posisi setelah TP1. Biasanya 1.5–2x risk distance — return optimal kalau setup kuat.",
      en: "Final target for remaining position after TP1. Usually 1.5–2x risk distance — optimal return on strong setups.",
    },
  },
  {
    term: "BEP (Break Even Point)",
    short: { id: "SL pindah ke harga entry — risiko nol", en: "SL moves to entry price — zero risk" },
    full: {
      id: "Setelah TP1 kena, SL otomatis digeser ke harga entry. Worst case posisi closed di profit 0 — tidak rugi sama sekali.",
      en: "After TP1 hits, SL auto-moves to entry price. Worst case position closes at zero profit — no loss at all.",
    },
  },
  {
    term: "RR (Risk:Reward Ratio)",
    short: { id: "Rasio reward vs risiko", en: "Reward vs risk ratio" },
    full: {
      id: "Misal RR 1:2 artinya untuk risiko $1, target reward $2. Bot setup minimum RR 1.2 untuk TP1, 2.0 untuk TP2.",
      en: "RR 1:2 means for $1 risk, target $2 reward. Bot setups minimum RR 1.2 for TP1, 2.0 for TP2.",
    },
  },
  {
    term: "EV (Expected Value)",
    short: { id: "Profit rata-rata per trade dalam unit R", en: "Avg profit per trade in R units" },
    full: {
      id: "Sum semua pnl_r / total trade. EV +0.5R artinya rata-rata setiap trade hasilkan setengah dari risk yang diambil. Positif = profitable jangka panjang.",
      en: "Sum of all pnl_r / total trades. EV +0.5R means each trade averages half the risk taken. Positive = profitable long-term.",
    },
  },
  {
    term: "WR (Win Rate)",
    short: { id: "Persentase trade yang profit", en: "Percent of profitable trades" },
    full: {
      id: "Wins / total trade × 100%. WR tinggi tanpa EV positif = small wins, big losses (bad). Yang penting EV positif, WR sedang OK.",
      en: "Wins / total trades × 100%. High WR without positive EV = small wins, big losses (bad). Positive EV matters more than high WR alone.",
    },
  },
  {
    term: "LONG / SHORT",
    short: { id: "Arah posisi (naik/turun)", en: "Position direction (up/down)" },
    full: {
      id: "LONG = beli berharap harga naik (profit kalau naik). SHORT = jual berharap harga turun (profit kalau turun). Futures bisa keduanya.",
      en: "LONG = buy expecting price up (profit if up). SHORT = sell expecting price down (profit if down). Futures support both.",
    },
  },
  {
    term: "Leverage",
    short: { id: "Pengganda modal — bot pakai 10x", en: "Capital multiplier — bot uses 10x" },
    full: {
      id: "Leverage 10x = $100 modal kontrol $1000 posisi. Profit/rugi juga 10x. Bot pakai 10x karena risk tetap dikalkulasi flat $ per trade, bukan % balance.",
      en: "10x leverage = $100 capital controls $1000 position. Profit/loss also 10x. Bot uses 10x because risk is calculated flat $ per trade, not % of balance.",
    },
  },
  {
    term: "Trailing SL",
    short: { id: "SL otomatis geser saat harga jalan profit", en: "SL auto-moves as price moves into profit" },
    full: {
      id: "3 stage: TP1 hit → BEP, +1.5R → +0.5R lock, +2.0R → +1.0R lock. Setelah +3R, runner trail tracking ekstrem ± 0.5R untuk maximize big winners.",
      en: "3 stages: TP1 hit → BEP, +1.5R → +0.5R lock, +2.0R → +1.0R lock. After +3R, runner trail tracks extreme ± 0.5R to maximize big winners.",
    },
  },
  {
    term: "Quality (IDEAL/GOOD/MODERATE/WAIT)",
    short: { id: "Confidence level signal", en: "Signal confidence level" },
    full: {
      id: "Hasil scoring 30+ faktor (BOS, Fib, candle, volume, ADX, dll). IDEAL & GOOD = high-conviction trade. MODERATE = ok tapi risk sizing dikecilkan. WAIT = setup ada tapi belum confirm.",
      en: "Result of 30+ factor scoring (BOS, Fib, candle, volume, ADX, etc). IDEAL & GOOD = high-conviction. MODERATE = ok but smaller risk size. WAIT = setup forming but not confirmed.",
    },
  },
  {
    term: "Swing vs Scalp",
    short: { id: "Strategi durasi panjang vs cepat", en: "Long-duration vs fast-duration strategy" },
    full: {
      id: "Swing = TF 1H+4H, hold beberapa jam–hari, target 1.5–3R. Scalp = TF 5m–15m, hold menit–jam, target 1–2R, frekuensi tinggi.",
      en: "Swing = 1H+4H timeframes, hold hours–days, target 1.5–3R. Scalp = 5m–15m, hold minutes–hours, target 1–2R, high frequency.",
    },
  },
  {
    term: "Liquidation",
    short: { id: "Posisi dipaksa close oleh exchange", en: "Position force-closed by exchange" },
    full: {
      id: "Kalau leverage terlalu tinggi tanpa SL dan harga gerak melawan, exchange auto-close = kehilangan margin. Bot SELALU pasang SL untuk hindari ini.",
      en: "If leverage too high without SL and price moves against you, exchange auto-closes = lose margin. Bot ALWAYS sets SL to prevent this.",
    },
  },
  {
    term: "FOMO / FUD",
    short: { id: "Emosi market — Fear of Missing Out / Fear, Uncertainty, Doubt", en: "Market emotions" },
    full: {
      id: "FOMO = beli karena takut ketinggalan rally (top buy biasanya). FUD = jual panik karena berita negatif (bottom sell). Bot tidak punya emosi, eksekusi by rule.",
      en: "FOMO = buy fearing you'll miss the rally (usually buying tops). FUD = panic sell on negative news (selling bottoms). Bot has no emotions, executes by rule.",
    },
  },
];

export default function GlossaryPage() {
  const { locale } = useLang();

  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)] py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] transition hover:text-[var(--color-accent-light)]"
        >
          <ArrowLeft size={14} /> {locale === "id" ? "Kembali ke Beranda" : "Back to Home"}
        </Link>

        <div className="mb-2 flex items-center gap-2">
          <BookOpen size={26} className="text-[var(--color-accent)]" />
          <h1 className="text-3xl font-bold">
            {locale === "id" ? "Glossary Trading" : "Trading Glossary"}
          </h1>
        </div>
        <p className="mb-8 text-sm text-[var(--color-text-muted)]">
          {locale === "id"
            ? "Penjelasan istilah-istilah yang sering muncul di signal & dashboard."
            : "Explanation of terms commonly used in signals & dashboard."}
        </p>

        <div className="grid gap-4">
          {TERMS.map((t) => (
            <div
              key={t.term}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 transition hover:border-[var(--color-accent)]/40"
            >
              <h3 className="text-lg font-bold text-[var(--color-accent-light)]">{t.term}</h3>
              <p className="mt-1 text-sm font-medium text-[var(--color-text-secondary)]">
                {t.short[locale]}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {t.full[locale]}
              </p>
              {t.example && (
                <div className="mt-3 rounded-lg border-l-2 border-[var(--color-accent)] bg-[var(--color-bg-primary)]/50 px-3 py-2">
                  <span className="text-[10px] font-bold uppercase text-[var(--color-accent)]">
                    {locale === "id" ? "Contoh" : "Example"}
                  </span>
                  <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                    {t.example[locale]}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
