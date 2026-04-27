import { NextResponse } from "next/server";

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
  published_at: number; // unix seconds
  categories: string[];
};

type CoinGeckoNews = {
  id: number;
  title: string;
  description: string;
  url: string;
  author?: string;
  news_site?: string;
  thumb_2x?: string;
  created_at?: number;
  crawled_at?: number;
};

export async function GET() {
  try {
    const r = await fetch(
      "https://api.coingecko.com/api/v3/news?page=1",
      {
        headers: { "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 600 },
      }
    );
    if (!r.ok) {
      return NextResponse.json({ ok: false, error: "fetch_failed" }, { status: 502 });
    }
    const data = await r.json();
    const raw: CoinGeckoNews[] = Array.isArray(data?.data) ? data.data : [];

    const items: NewsItem[] = raw.slice(0, 24).map((n) => ({
      id: String(n.id),
      title: n.title || "",
      body: (n.description || "").slice(0, 280),
      image: n.thumb_2x || "",
      url: n.url,
      source: n.news_site || n.author || "Unknown",
      source_img: "",
      published_at: n.created_at || n.crawled_at || Math.floor(Date.now() / 1000),
      categories: [],
    }));

    return NextResponse.json({
      ok: true,
      items,
      fetched_at: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
