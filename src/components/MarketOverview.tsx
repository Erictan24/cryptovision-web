"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Activity, DollarSign, Layers, Flame } from "lucide-react";
import { useLang } from "./LanguageProvider";

type CoinRow = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume_24h: number;
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
  btc_sparkline: number[];
  eth_sparkline: number[];
  fear_greed: { value: number; label: string } | null;
  top10: CoinRow[];
  gainers: CoinRow[];
  losers: CoinRow[];
  top_volume: CoinRow[];
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

function Sparkline({ data, color, width = 110, height = 32 }: {
  data: number[]; color: string; width?: number; height?: number;
}) {
  if (!data || data.length < 2) return null;
  const step = Math.max(1, Math.floor(data.length / 30));
  const sampled = data.filter((_, i) => i % step === 0);
  const min = Math.min(...sampled);
  const max = Math.max(...sampled);
  const range = max - min || 1;
  const dx = width / (sampled.length - 1);
  const points = sampled.map((v, i) => ({
    x: i * dx,
    y: height - ((v - min) / range) * height * 0.85 - 2,
  }));
  let linePath = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const cur = points[i];
    const cpx = (prev.x + cur.x) / 2;
    linePath += ` Q ${cpx.toFixed(2)} ${prev.y.toFixed(2)} ${cur.x.toFixed(2)} ${cur.y.toFixed(2)}`;
  }
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${height} L 0 ${height} Z`;
  const gradId = `sparkgrad-${color.replace("#", "")}-${width}`;
  return (
    <svg width={width} height={height}>
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

// Half-circle gauge — CoinMarketCap style
function FearGreedGauge({ value, label }: { value: number; label: string }) {
  const cx = 110;
  const cy = 110;
  const r = 90;
  const startAngle = 180; // kiri
  const endAngle = 0;     // kanan

  // Posisi needle (0 = -180°, 100 = 0°)
  const needleAngle = startAngle - (value / 100) * 180;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleX = cx + Math.cos(needleRad) * (r - 10);
  const needleY = cy - Math.sin(needleRad) * (r - 10);

  // 5 segment arc (Extreme Fear → Extreme Greed)
  const segments = [
    { from: 0,  to: 20, color: "#dc2626" },  // Extreme Fear
    { from: 20, to: 40, color: "#ea580c" },  // Fear
    { from: 40, to: 60, color: "#eab308" },  // Neutral
    { from: 60, to: 80, color: "#84cc16" },  // Greed
    { from: 80, to: 100, color: "#16a34a" }, // Extreme Greed
  ];

  function arcPath(fromPct: number, toPct: number): string {
    const a1 = startAngle - (fromPct / 100) * 180;
    const a2 = startAngle - (toPct / 100) * 180;
    const x1 = cx + Math.cos((a1 * Math.PI) / 180) * r;
    const y1 = cy - Math.sin((a1 * Math.PI) / 180) * r;
    const x2 = cx + Math.cos((a2 * Math.PI) / 180) * r;
    const y2 = cy - Math.sin((a2 * Math.PI) / 180) * r;
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  }

  const valueColor =
    value <= 20 ? "#dc2626" :
    value <= 40 ? "#ea580c" :
    value <= 60 ? "#eab308" :
    value <= 80 ? "#84cc16" : "#16a34a";

  return (
    <div className="flex flex-col items-center">
      <svg width="220" height="140" viewBox="0 0 220 140">
        {segments.map((s) => (
          <path
            key={s.from}
            d={arcPath(s.from, s.to)}
            fill="none"
            stroke={s.color}
            strokeWidth="14"
            strokeLinecap="butt"
          />
        ))}
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke="#f8fafc"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="6" fill="#f8fafc" />
        {/* Value text */}
        <text
          x={cx}
          y={cy - 25}
          textAnchor="middle"
          fontSize="36"
          fontWeight="bold"
          fill={valueColor}
        >
          {value}
        </text>
      </svg>
      <div className="-mt-2 text-sm font-semibold" style={{ color: valueColor }}>
        {label}
      </div>
      <div className="mt-1 flex w-full justify-between px-2 text-[9px] text-[var(--color-text-muted)]">
        <span>Extreme Fear</span>
        <span>Neutral</span>
        <span>Extreme Greed</span>
      </div>
    </div>
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
      sparkline: data.btc_sparkline,
      sparkColor: data.btc_change_24h >= 0 ? "#10b981" : "#ef4444",
    },
    {
      icon: Activity,
      label: "BTC.D",
      value: `${data.btc_dominance.toFixed(2)}%`,
      change: 0,
      desc: locale === "id" ? "Bitcoin Dominance" : "BTC Dominance",
      hideChange: true,
      sparkline: data.btc_sparkline,
      sparkColor: "#f7931a",
    },
    {
      icon: Layers,
      label: "USDT.D",
      value: `${data.usdt_dominance.toFixed(2)}%`,
      change: 0,
      desc: locale === "id" ? "Naik = market takut" : "Up = market fearful",
      hideChange: true,
      sparkline: data.btc_sparkline.map(p => 1 / (p / 1000)), // inverse-ish proxy
      sparkColor: "#26a17b",
    },
    {
      icon: TrendingUp,
      label: "TOTAL3",
      value: fmtUsd(data.total3_market_cap),
      change: data.total3_change_24h,
      desc: locale === "id" ? "Altcoin Market Cap" : "Altcoin Market Cap",
      sparkline: data.eth_sparkline,
      sparkColor: data.total3_change_24h >= 0 ? "#10b981" : "#ef4444",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Activity size={18} className="text-[var(--color-accent)]" />
        <h2 className="text-lg font-bold">
          {locale === "id" ? "Market Snapshot" : "Market Snapshot"}
        </h2>
        <span className="text-xs text-[var(--color-text-muted)]">
          {locale === "id" ? "— update tiap 1 menit" : "— refresh every 1 min"}
        </span>
      </div>

      {/* Row 1: Macro cards dengan sparkline */}
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
              <div className="mt-2 flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xl font-bold truncate">{c.value}</p>
                  <p className="mt-1 text-[11px] text-[var(--color-text-muted)] truncate">{c.desc}</p>
                </div>
                <div className="shrink-0 -mr-1">
                  <Sparkline data={c.sparkline} color={c.sparkColor} width={90} height={36} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 2: Fear & Greed gauge + Top Gainers + Top Losers + Top Volume */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-glow rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 sm:col-span-2 lg:col-span-1">
          <div className="mb-3 flex items-center gap-2">
            <Activity size={16} className="text-[var(--color-accent)]" />
            <h3 className="text-sm font-bold">
              {locale === "id" ? "Fear & Greed Index" : "Fear & Greed Index"}
            </h3>
          </div>
          {data.fear_greed ? (
            <FearGreedGauge value={data.fear_greed.value} label={data.fear_greed.label} />
          ) : (
            <p className="text-xs text-[var(--color-text-muted)]">N/A</p>
          )}
        </div>

        <div className="card-glow rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-[var(--color-success)]" />
            <h3 className="text-sm font-bold">
              {locale === "id" ? "Top Gainers 24h" : "Top Gainers 24h"}
            </h3>
          </div>
          <ul className="space-y-2.5">
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

        <div className="card-glow rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
          <div className="mb-3 flex items-center gap-2">
            <TrendingDown size={16} className="text-[var(--color-danger)]" />
            <h3 className="text-sm font-bold">
              {locale === "id" ? "Top Losers 24h" : "Top Losers 24h"}
            </h3>
          </div>
          <ul className="space-y-2.5">
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

        <div className="card-glow rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
          <div className="mb-3 flex items-center gap-2">
            <Flame size={16} className="text-[var(--color-accent)]" />
            <h3 className="text-sm font-bold">
              {locale === "id" ? "Top Volume 24h" : "Top Volume 24h"}
            </h3>
          </div>
          <ul className="space-y-2.5">
            {data.top_volume.map((c) => {
              const isUp = c.price_change_pct_24h >= 0;
              return (
                <li key={c.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={c.image} alt={c.symbol} className="h-4 w-4 rounded-full" />
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{c.symbol}</div>
                      <div className="text-[10px] text-[var(--color-text-muted)] truncate">
                        {fmtUsd(c.total_volume_24h)}
                      </div>
                    </div>
                  </div>
                  <span className={`font-bold ${isUp ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
                    {fmtPct(c.price_change_pct_24h)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Row 3: Top 10 by Market Cap — column spacing fixed */}
      <div className="card-glow rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
        <div className="mb-3 flex items-center gap-2">
          <Layers size={16} className="text-[var(--color-accent)]" />
          <h3 className="text-sm font-bold">
            {locale === "id" ? "Top 10 Coin (Market Cap)" : "Top 10 Coins (Market Cap)"}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: 720 }}>
            <thead className="text-[var(--color-text-muted)]">
              <tr className="border-b border-[var(--color-border)]">
                <th className="py-2 pr-2 text-left w-10">#</th>
                <th className="py-2 pr-4 text-left">Coin</th>
                <th className="py-2 px-4 text-right">Price</th>
                <th className="py-2 px-4 text-right">24h</th>
                <th className="py-2 px-4 text-right">Market Cap</th>
                <th className="py-2 pl-6 text-right">7d</th>
              </tr>
            </thead>
            <tbody>
              {data.top10.map((c, i) => {
                const isUp = c.price_change_pct_24h >= 0;
                const sparkColor = isUp ? "#10b981" : "#ef4444";
                return (
                  <tr key={c.id} className="border-b border-[var(--color-border)]/40 last:border-0">
                    <td className="py-3 pr-2 text-[var(--color-text-muted)]">{i + 1}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <img src={c.image} alt={c.symbol} className="h-5 w-5 rounded-full" />
                        <div>
                          <div className="font-semibold">{c.symbol}</div>
                          <div className="text-[10px] text-[var(--color-text-muted)]">{c.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">{fmtUsd(c.current_price)}</td>
                    <td className={`py-3 px-4 text-right font-bold ${isUp ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
                      {fmtPct(c.price_change_pct_24h)}
                    </td>
                    <td className="py-3 px-4 text-right text-[var(--color-text-muted)]">
                      {fmtUsd(c.market_cap)}
                    </td>
                    <td className="py-3 pl-6 text-right">
                      <div className="flex justify-end">
                        <Sparkline data={c.sparkline_7d} color={sparkColor} />
                      </div>
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
