import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 2; // 2 detik cache — match Bitunix WS update rate

type BitunixTicker = {
  symbol: string;
  markPrice: string;
  lastPrice: string;
  open: string;
  high: string;
  low: string;
};

/** GET — fetch all Bitunix futures tickers, return symbol→price map.
 *  Position dashboard pakai ini (bukan Binance) supaya match dengan
 *  exchange yang bot trading di sana. */
export async function GET() {
  try {
    const r = await fetch(
      "https://fapi.bitunix.com/api/v1/futures/market/tickers",
      {
        headers: { "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 2 },
      }
    );
    if (!r.ok) {
      return NextResponse.json({ ok: false, error: "fetch_failed" }, { status: 502 });
    }
    const data = await r.json();
    const raw: BitunixTicker[] = Array.isArray(data?.data) ? data.data : [];

    // Build map: SYMBOL_BASE → { mark_price, last_price, change_pct_24h }
    const prices: Record<string, { price: number; change24h: number }> = {};
    for (const t of raw) {
      const sym = t.symbol.replace(/USDT$/, "");
      const mark = parseFloat(t.markPrice);
      const open = parseFloat(t.open);
      if (!isFinite(mark)) continue;
      const change24h = isFinite(open) && open > 0 ? ((mark - open) / open) * 100 : 0;
      prices[sym] = { price: mark, change24h };
    }

    return NextResponse.json({
      ok: true,
      prices,
      fetched_at: new Date().toISOString(),
      count: Object.keys(prices).length,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
