import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 60; // 1 menit cache

type CoinRow = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume_24h: number;
  price_change_24h: number;
  price_change_pct_24h: number;
  sparkline_7d: number[];
};

type MarketSnapshot = {
  btc_price: number;
  btc_change_24h: number;
  btc_dominance: number;
  usdt_dominance: number;
  total_market_cap: number;
  total3_market_cap: number;
  total3_change_24h: number;
  btc_sparkline: number[];     // 7d BTC price
  eth_sparkline: number[];     // 7d ETH price (proxy untuk TOTAL3 trend)
  fear_greed: { value: number; label: string } | null;
  top10: CoinRow[];
  gainers: CoinRow[];
  losers: CoinRow[];
  btc_dominance_trend: number[];
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

async function fetchTopCoins(perPage = 250): Promise<CoinRow[]> {
  const r = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=1&sparkline=true&price_change_percentage=24h`,
    {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 60 },
    }
  );
  if (!r.ok) return [];
  const data = await r.json();
  if (!Array.isArray(data)) return [];
  return data.map((c) => ({
    id: c.id,
    symbol: (c.symbol || "").toUpperCase(),
    name: c.name,
    image: c.image,
    current_price: c.current_price || 0,
    market_cap: c.market_cap || 0,
    total_volume_24h: c.total_volume || 0,
    price_change_24h: c.price_change_24h || 0,
    price_change_pct_24h: c.price_change_percentage_24h || 0,
    sparkline_7d: c.sparkline_in_7d?.price?.slice(-50) || [],
  }));
}

// Stablecoins di-exclude dari volume ranking — bukan target trader
const STABLECOIN_IDS = new Set([
  "tether", "usd-coin", "dai", "first-digital-usd", "true-usd",
  "paxos-standard", "frax", "usdd", "ethena-usde", "paypal-usd",
  "binance-usd",
]);

async function fetchFearGreed() {
  try {
    const r = await fetch("https://api.alternative.me/fng/?limit=1", {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 600 }, // F&G update jarang, cache 10 menit
    });
    if (!r.ok) return null;
    const data = await r.json();
    const item = data?.data?.[0];
    if (!item) return null;
    return {
      value: parseInt(item.value, 10),
      label: item.value_classification,
    };
  } catch {
    return null;
  }
}

async function fetchBtcDominanceTrend(): Promise<number[]> {
  try {
    // CoinGecko free tier: max 30 hari history
    const r = await fetch(
      "https://api.coingecko.com/api/v3/global/market_cap_chart?days=30",
      {
        headers: { "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 1800 },
      }
    );
    if (!r.ok) return [];
    const data = await r.json();
    // CoinGecko returns market_cap_chart, kita perlu compute btc_dominance per titik
    // Kalau API tidak return per-coin breakdown, fallback ke kosong
    const totals = data?.market_cap_chart?.market_cap || [];
    if (!Array.isArray(totals)) return [];
    return totals.slice(-30).map((p: [number, number]) => p[1]);
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const [global, prices, topCoins, fearGreed, btcDominanceTrend] = await Promise.all([
      fetchCoinGeckoGlobal(),
      fetchCoinGeckoPrices(),
      fetchTopCoins(250),
      fetchFearGreed(),
      fetchBtcDominanceTrend(),
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

    const total3_market_cap = total_market_cap - btc_mc - eth_mc;
    const total_change_24h = data.market_cap_change_percentage_24h_usd || 0;
    const alts_share = total_market_cap > 0 ? total3_market_cap / total_market_cap : 0;
    const total3_change_24h = total_change_24h / Math.max(alts_share, 0.1);

    // Universe minus stablecoin (semua ranking di-derive dari sini)
    const movableCoins = topCoins.filter((c) => !STABLECOIN_IDS.has(c.id));

    const sortedByVolume = [...movableCoins].sort(
      (a, b) => b.total_volume_24h - a.total_volume_24h
    );

    // Top 10 by 24h volume (table utama)
    const top10 = sortedByVolume.slice(0, 10);

    // Gainers/Losers — dari universe top 250, exclude stablecoin
    const sortedByGain = [...movableCoins].sort(
      (a, b) => b.price_change_pct_24h - a.price_change_pct_24h
    );
    const gainers = sortedByGain.slice(0, 5);
    const losers = sortedByGain.slice(-5).reverse();

    // Sparkline untuk macro cards
    const btcCoin = topCoins.find((c) => c.id === "bitcoin");
    const ethCoin = topCoins.find((c) => c.id === "ethereum");
    const btc_sparkline = btcCoin?.sparkline_7d || [];
    const eth_sparkline = ethCoin?.sparkline_7d || [];

    const snapshot: MarketSnapshot = {
      btc_price,
      btc_change_24h,
      btc_dominance,
      usdt_dominance,
      total_market_cap,
      total3_market_cap,
      total3_change_24h,
      btc_sparkline,
      eth_sparkline,
      fear_greed: fearGreed,
      top10,
      gainers,
      losers,
      btc_dominance_trend: btcDominanceTrend,
      fetched_at: new Date().toISOString(),
    };

    return NextResponse.json({ ok: true, data: snapshot });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
