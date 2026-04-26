import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 600; // 10 menit cache (news update jarang)

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

type CryptoCompareItem = {
  id: string;
  title: string;
  body: string;
  imageurl: string;
  url: string;
  published_on: number;
  categories: string;
  source: string;
  source_info?: { name?: string; img?: string };
};

export async function GET() {
  try {
    const r = await fetch(
      "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest",
      {
        headers: { "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 600 },
      }
    );
    if (!r.ok) {
      return NextResponse.json({ ok: false, error: "fetch_failed" }, { status: 502 });
    }
    const data = await r.json();
    const raw: CryptoCompareItem[] = Array.isArray(data?.Data) ? data.Data : [];

    const items: NewsItem[] = raw.slice(0, 24).map((n) => ({
      id: n.id,
      title: n.title,
      body: (n.body || "").slice(0, 280),
      image: n.imageurl || "",
      url: n.url,
      source: n.source_info?.name || n.source || "Unknown",
      source_img: n.source_info?.img || "",
      published_at: n.published_on,
      categories: (n.categories || "").split("|").filter(Boolean).slice(0, 3),
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
