"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Activity, DollarSign, Layers, Gauge } from "lucide-react";
import { useLang } from "./LanguageProvider";

type CoinRow = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_pct_24h: number;
  sparkline_7d: number[];
};

type Snapshot = {
  btc_price: number;
  btc_change_24h: number;
  btc_dominance: number;
  usdt_dominance: number;
  total3_market_cap: number;
  total3_change_24h: number;
  fear_greed: { value: number; label: string } | null;
  top10: CoinRow[];
  gainers: CoinRow[];
  losers: CoinRow[];
  fetched_at: string;
};

function fmtUsd(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1)    return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  return `$${n.toFixed(6)}`;
}

function fmtPct(n: number): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

function fearGreedColor(v: number): string {
  if (v <= 25) return "text-[var(--color-danger)]";
  if (v <= 45) return "text-[var(--color-warning,#f59e0b)]";
  if (v <= 55) return "text-[var(--color-text-muted)]";
  if (v <= 75) return "text-[var(--color-success)]";
  return "text-[var(--color-success)]";
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  // Downsample untuk smoother — ambil tiap N point biar tidak terlalu padat
  const step = Math.max(1, Math.floor(data.length / 30));
  const sampled = data.filter((_, i) => i % step === 0);

  const min = Math.min(...sampled);
  const max = Math.max(...sampled);
  const range = max - min || 1;
  const w = 110;
  const h = 32;
  const dx = w / (sampled.length - 1);

  const points = sampled.map((v, i) => ({
    x: i * dx,
    y: h - ((v - min) / range) * h * 0.85 - 2,
  }));

  // Smooth path pakai cubic bezier
  let linePath = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const cur = points[i];
    const cpx = (prev.x + cur.x) / 2;
    linePath += ` Q ${cpx.toFixed(2)} ${prev.y.toFixed(2)} ${cur.x.toFixed(2)} ${cur.y.toFixed(2)}`;
  }
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${h} L 0 ${h} Z`;

  const gradId = `sparkgrad-${color.replace("#", "")}`;
  return (
    <svg width={w} height={h}>
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function MarketOverview() {
  const { locale } = useLang();
  const [data, setData] = useState<Snapshot | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = () =>
      fetch(`/api/market?t=${Date.now()}`, { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          if (d.ok) setData(d.data);
          else setError(true);
        })
        .catch(() => setError(true));
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
        <p className="text-sm text-[var(--color-text-muted)]">
          {locale === "id" ? "Gagal memuat data market." : "Failed to load market data."}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
          {locale === "id" ? "Memuat data market..." : "Loading market data..."}
        </div>
      </div>
    );
  }

  const macroCards = [
    {
      icon: DollarSign,
      label: "BTC",
      value: fmtUsd(data.btc_price),
      change: data.btc_change_24h,
      desc: "Bitcoin Spot",
    },
    {
      icon: Activity,
      label: "BTC.D",
      value: `${data.btc_dominance.toFixed(2)}%`,
      change: 0,
      desc: locale === "id" ? "Bitcoin Dominance" : "BTC Dominance",
      hideChange: true,
    },
    {
      icon: Layers,
      label: "USDT.D",
      value: `${data.usdt_dominance.toFixed(2)}%`,
      change: 0,
      desc: locale === "id" ? "Naik = market takut" : "Up = market fearful",
      hideChange: true,
    },
    {
      icon: TrendingUp,
      label: "TOTAL3",
      value: fmtUsd(data.total3_market_cap),
      change: data.total3_change_24h,
      desc: locale === "id" ? "Altcoin Market Cap" : "Altcoin Market Cap",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center gap-2">
        <Activity size={18} className="text-[var(--color-accent)]" />
        <h2 className="text-lg font-bold">
          {locale === "id" ? "Market Snapshot" : "Market Snapshot"}
        </h2>
        <span className="text-xs text-[var(--color-text-muted)]">
          {locale === "id" ? "— update tiap 1 menit" : "— refresh every 1 min"}
        </span>
      </div>

      {/* Row 1: Macro indicators */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {macroCards.map((c) => {
          const isUp = c.change >= 0;
          return (
            <div
              key={c.label}
              className="card-glow rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <c.icon size={16} className="text-[var(--color-accent)]" />
                  <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                    {c.label}
                  </span>
                </div>
                {!c.hideChange && (
                  <span
                    className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isUp
                        ? "bg-[var(--color-success)]/15 text-[var(--color-success)]"
                        : "bg-[var(--color-danger)]/15 text-[var(--color-danger)]"
                    }`}
                  >
                    {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {fmtPct(c.change)}
                  </span>
                )}
              </div>
              <p className="mt-2 text-xl font-bold">{c.value}</p>
              <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">{c.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Row 2: Fear & Greed + Top Gainers + Top Losers */}
      <div className="grid gap-3 lg:grid-cols-3">
        {/* Fear & Greed */}
        <div className="card-glow rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
          <div className="mb-3 flex items-center gap-2">
            <Gauge size={16} className="text-[var(--color-accent)]" />
            <h3 className="text-sm font-bold">
              {locale === "id" ? "Fear & Greed Index" : "Fear & Greed Index"}
            </h3>
          </div>
          {data.fear_greed ? (
            <div className="flex flex-col items-center justify-center py-4">
              <div className={`text-5xl font-bold ${fearGreedColor(data.fear_greed.value)}`}>
                {data.fear_greed.value}
              </div>
              <div className={`mt-1 text-sm font-semibold ${fearGreedColor(data.fear_greed.value)}`}>
                {data.fear_greed.label}
              </div>
              <div className="mt-2 text-[10px] text-[var(--color-text-muted)]">
                0 = Extreme Fear &nbsp;|&nbsp; 100 = Extreme Greed
              </div>
            </div>
          ) : (
            <p className="text-xs text-[var(--color-text-muted)]">N/A</p>
          )}
        </div>

        {/* Top Gainers */}
        <div className="card-glow rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-[var(--color-success)]" />
            <h3 className="text-sm font-bold">
              {locale === "id" ? "Top Gainers 24h" : "Top Gainers 24h"}
            </h3>
          </div>
          <ul className="space-y-2">
            {data.gainers.map((c) => (
              <li key={c.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <img src={c.image} alt={c.symbol} className="h-4 w-4 rounded-full" />
                  <span className="font-semibold truncate">{c.symbol}</span>
                </div>
                <span className="font-bold text-[var(--color-success)]">
                  {fmtPct(c.price_change_pct_24h)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Top Losers */}
        <div className="card-glow rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
          <div className="mb-3 flex items-center gap-2">
            <TrendingDown size={16} className="text-[var(--color-danger)]" />
            <h3 className="text-sm font-bold">
              {locale === "id" ? "Top Losers 24h" : "Top Losers 24h"}
            </h3>
          </div>
          <ul className="space-y-2">
            {data.losers.map((c) => (
              <li key={c.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <img src={c.image} alt={c.symbol} className="h-4 w-4 rounded-full" />
                  <span className="font-semibold truncate">{c.symbol}</span>
                </div>
                <span className="font-bold text-[var(--color-danger)]">
                  {fmtPct(c.price_change_pct_24h)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Row 3: Top 10 by Market Cap */}
      <div className="card-glow rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
        <div className="mb-3 flex items-center gap-2">
          <Layers size={16} className="text-[var(--color-accent)]" />
          <h3 className="text-sm font-bold">
            {locale === "id" ? "Top 10 Coin (Market Cap)" : "Top 10 Coins (Market Cap)"}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[var(--color-text-muted)]">
              <tr className="border-b border-[var(--color-border)]">
                <th className="py-2 text-left">#</th>
                <th className="py-2 text-left">Coin</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">24h</th>
                <th className="py-2 text-right hidden sm:table-cell">Market Cap</th>
                <th className="py-2 text-right hidden md:table-cell">7d</th>
              </tr>
            </thead>
            <tbody>
              {data.top10.map((c, i) => {
                const isUp = c.price_change_pct_24h >= 0;
                const sparkColor = isUp ? "#10b981" : "#ef4444";
                return (
                  <tr key={c.id} className="border-b border-[var(--color-border)]/40 last:border-0">
                    <td className="py-2 text-[var(--color-text-muted)]">{i + 1}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <img src={c.image} alt={c.symbol} className="h-5 w-5 rounded-full" />
                        <div>
                          <div className="font-semibold">{c.symbol}</div>
                          <div className="text-[10px] text-[var(--color-text-muted)]">{c.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 text-right font-medium">{fmtUsd(c.current_price)}</td>
                    <td className={`py-2 text-right font-bold ${isUp ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
                      {fmtPct(c.price_change_pct_24h)}
                    </td>
                    <td className="py-2 text-right text-[var(--color-text-muted)] hidden sm:table-cell">
                      {fmtUsd(c.market_cap)}
                    </td>
                    <td className="py-2 text-right hidden md:table-cell">
                      <Sparkline data={c.sparkline_7d} color={sparkColor} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
