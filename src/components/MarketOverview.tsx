"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Activity, DollarSign, Layers } from "lucide-react";
import { useLang } from "./LanguageProvider";

type Snapshot = {
  btc_price: number;
  btc_change_24h: number;
  btc_dominance: number;
  usdt_dominance: number;
  total3_market_cap: number;
  total3_change_24h: number;
  fetched_at: string;
};

function fmtUsd(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  return `$${n.toFixed(2)}`;
}

function fmtPct(n: number): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
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
    const id = setInterval(load, 60_000); // refresh tiap 1 menit
    return () => clearInterval(id);
  }, []);

  const cards = data
    ? [
        {
          icon: DollarSign,
          label: "BTC",
          value: fmtUsd(data.btc_price),
          change: data.btc_change_24h,
          desc: locale === "id" ? "Bitcoin Spot" : "Bitcoin Spot",
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
          desc:
            locale === "id"
              ? "USDT Dominance — naik = market takut"
              : "USDT Dominance — up = market fearful",
          hideChange: true,
        },
        {
          icon: TrendingUp,
          label: "TOTAL3",
          value: fmtUsd(data.total3_market_cap),
          change: data.total3_change_24h,
          desc: locale === "id" ? "Altcoin Market Cap" : "Altcoin Market Cap",
        },
      ]
    : [];

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Activity size={18} className="text-[var(--color-accent)]" />
        <h2 className="text-lg font-bold">
          {locale === "id" ? "Market Snapshot" : "Market Snapshot"}
        </h2>
        <span className="text-xs text-[var(--color-text-muted)]">
          {locale === "id"
            ? "— BTC, dominance, altcoin"
            : "— BTC, dominance, altcoin"}
        </span>
      </div>

      {error && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
          <p className="text-sm text-[var(--color-text-muted)]">
            {locale === "id" ? "Gagal memuat data market." : "Failed to load market data."}
          </p>
        </div>
      )}

      {!error && !data && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
            {locale === "id" ? "Memuat data market..." : "Loading market data..."}
          </div>
        </div>
      )}

      {!error && data && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => {
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
      )}
    </section>
  );
}
