import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 60; // 1 menit cache

type MarketSnapshot = {
  btc_price: number;
  btc_change_24h: number;
  btc_dominance: number;
  usdt_dominance: number;
  total_market_cap: number;
  total3_market_cap: number;   // alts excl BTC + ETH
  total3_change_24h: number;
  fetched_at: string;
};

async function fetchCoinGeckoGlobal() {
  const r = await fetch("https://api.coingecko.com/api/v3/global", {
    headers: { "User-Agent": "Mozilla/5.0" },
    next: { revalidate: 60 },
  });
  if (!r.ok) return null;
  return r.json();
}

async function fetchCoinGeckoPrices() {
  const r = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true&include_market_cap=true",
    {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 60 },
    }
  );
  if (!r.ok) return null;
  return r.json();
}

export async function GET() {
  try {
    const [global, prices] = await Promise.all([
      fetchCoinGeckoGlobal(),
      fetchCoinGeckoPrices(),
    ]);

    if (!global || !prices) {
      return NextResponse.json({ ok: false, error: "fetch_failed" }, { status: 502 });
    }

    const data = global.data;
    const btc_price       = prices.bitcoin?.usd || 0;
    const btc_change_24h  = prices.bitcoin?.usd_24h_change || 0;
    const btc_mc          = prices.bitcoin?.usd_market_cap || 0;
    const eth_mc          = prices.ethereum?.usd_market_cap || 0;
    const total_market_cap = data.total_market_cap?.usd || 0;
    const btc_dominance   = data.market_cap_percentage?.btc || 0;
    const usdt_dominance  = data.market_cap_percentage?.usdt || 0;

    // TOTAL3 = total market cap - BTC - ETH (alts only)
    const total3_market_cap = total_market_cap - btc_mc - eth_mc;

    // Approximate TOTAL3 24h change from market_cap_change_percentage_24h_usd weighted
    const total_change_24h = data.market_cap_change_percentage_24h_usd || 0;
    // Heuristic: if BTC dominance & ETH market share known, alts share = remaining
    const alts_share = total_market_cap > 0 ? total3_market_cap / total_market_cap : 0;
    const total3_change_24h = total_change_24h / Math.max(alts_share, 0.1);

    const snapshot: MarketSnapshot = {
      btc_price,
      btc_change_24h,
      btc_dominance,
      usdt_dominance,
      total_market_cap,
      total3_market_cap,
      total3_change_24h,
      fetched_at: new Date().toISOString(),
    };

    return NextResponse.json({ ok: true, data: snapshot });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
