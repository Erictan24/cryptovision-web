import { NextResponse } from "next/server";

// 2026-05-07: switch dari CoinGecko News (sekarang PRO-only $129/mo)
// ke CryptoCompare News API (free 250k calls/month dengan key gratis).
// API doc: https://min-api.cryptocompare.com/documentation?key=News
// UI struktur output GAK berubah — `items` schema sama persis.

export const dynamic = "force-dynamic";
export const revalidate = 600; // 10 menit cache

type NewsItem = {
  id: string;
  title: string;
  body: string;
  image: string;
  url: string;
  source: string;
  source_img: string;
  published_at: number;
  categories: string[];
};

type CryptoCompareNews = {
  id: string;
  guid?: string;
  published_on: number;
  imageurl?: string;
  title: string;
  url: string;
  source?: string;
  body?: string;
  tags?: string;
  categories?: string;
  lang?: string;
  source_info?: {
    name?: string;
    img?: string;
    lang?: string;
  };
};

type CryptoCompareResponse = {
  Type: number;
  Message?: string;
  Data?: CryptoCompareNews[];
  Response?: string;
};

export async function GET() {
  const apiKey = process.env.CRYPTOCOMPARE_API_KEY || "";

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "CRYPTOCOMPARE_API_KEY not configured",
        hint: "Sign up gratis di https://min-api.cryptocompare.com/ lalu set CRYPTOCOMPARE_API_KEY di Vercel env",
      },
      { status: 500 }
    );
  }

  try {
    const url = "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&excludeCategories=Sponsored";
    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Authorization": `Apikey ${apiKey}`,
      },
      next: { revalidate: 600 },
    });

    if (!r.ok) {
      return NextResponse.json(
        { ok: false, error: `fetch_failed_${r.status}` },
        { status: 502 }
      );
    }

    const data = (await r.json()) as CryptoCompareResponse;

    if (data.Response === "Error") {
      return NextResponse.json(
        { ok: false, error: data.Message || "api_error" },
        { status: 502 }
      );
    }

    const raw: CryptoCompareNews[] = Array.isArray(data.Data) ? data.Data : [];

    const items: NewsItem[] = raw.slice(0, 24).map((n) => ({
      id: String(n.id),
      title: n.title || "",
      body: (n.body || "").slice(0, 280),
      image: n.imageurl || "",
      url: n.url,
      source: n.source_info?.name || n.source || "Unknown",
      source_img: n.source_info?.img || "",
      published_at: n.published_on || Math.floor(Date.now() / 1000),
      categories: (n.categories || "").split("|").filter(Boolean),
    }));

    return NextResponse.json({
      ok: true,
      items,
      fetched_at: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
