import { NextResponse } from "next/server";

// 2026-05-12: RSS aggregator (CoinTelegraph + Decrypt + CoinDesk).
// Replace CryptoCompare yang free tier expire May 21. RSS = gratis selamanya,
// no API key, no rate limit. Schema output `items` tidak berubah — UI compatible.

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

const SOURCES: { name: string; url: string; img: string }[] = [
  {
    name: "CoinTelegraph",
    url: "https://cointelegraph.com/rss",
    img: "https://s3.cointelegraph.com/storage/uploads/view/b9ea15d46738b4df64e6e100ab59b373.png",
  },
  {
    name: "Decrypt",
    url: "https://decrypt.co/feed",
    img: "https://decrypt.co/wp-content/themes/decrypt/assets/images/decrypt-icon-light.svg",
  },
  {
    name: "CoinDesk",
    url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
    img: "https://downloads.coindesk.com/arc/failsafe/feeds/coindesk-feed-logo.png",
  },
];

// Extract content inside <tag>...</tag> or <tag><![CDATA[...]]></tag>
function extractTag(xml: string, tag: string): string {
  // Try CDATA first
  const cdataRe = new RegExp(
    `<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`,
    "i"
  );
  const cdataMatch = xml.match(cdataRe);
  if (cdataMatch) return cdataMatch[1].trim();

  // Fallback: plain text
  const plainRe = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const plainMatch = xml.match(plainRe);
  if (plainMatch) return plainMatch[1].trim();

  return "";
}

// Extract attribute value from a self-closing or open tag, e.g. <media:content url="...">
function extractAttr(xml: string, tag: string, attr: string): string {
  const re = new RegExp(`<${tag}[^>]*\\b${attr}=["']([^"']+)["']`, "i");
  const m = xml.match(re);
  return m ? m[1] : "";
}

// Strip HTML tags + decode common entities
function stripHtml(s: string): string {
  return s
    .replace(/<img[^>]*>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    // Numeric entities: &#39; &#039; &#8217; etc
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCharCode(parseInt(dec, 10)))
    // Hex entities: &#xAB; etc
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\s+/g, " ")
    .trim();
}

// Try to find image URL — checks <media:content url> then first <img src> in description
function extractImage(itemXml: string, descHtml: string): string {
  const mediaUrl = extractAttr(itemXml, "media:content", "url");
  if (mediaUrl) return mediaUrl;
  const enclosureUrl = extractAttr(itemXml, "enclosure", "url");
  if (enclosureUrl) return enclosureUrl;
  const imgMatch = descHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
  return imgMatch ? imgMatch[1] : "";
}

function parseFeed(xml: string, src: { name: string; img: string }): NewsItem[] {
  const items: NewsItem[] = [];
  // Match all <item>...</item> blocks
  const itemRe = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  let idx = 0;
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1];
    const title = stripHtml(extractTag(block, "title"));
    const linkRaw = extractTag(block, "link");
    const link = linkRaw.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim();
    const pubDate = extractTag(block, "pubDate");
    const descHtml = extractTag(block, "description");
    const desc = stripHtml(descHtml).slice(0, 280);

    // Categories: collect up to 3
    const catRe = /<category\b[^>]*>(?:<!\[CDATA\[)?([^<\]]+?)(?:\]\]>)?<\/category>/gi;
    const cats: string[] = [];
    let cm: RegExpExecArray | null;
    while ((cm = catRe.exec(block)) !== null && cats.length < 3) {
      const c = cm[1].trim();
      if (c) cats.push(c);
    }

    const ts = pubDate ? Math.floor(new Date(pubDate).getTime() / 1000) : 0;
    if (!title || !link || !ts) {
      idx++;
      continue;
    }

    items.push({
      id: `${src.name.toLowerCase()}-${ts}-${idx}`,
      title,
      body: desc,
      image: extractImage(block, descHtml),
      url: link,
      source: src.name,
      source_img: src.img,
      published_at: ts,
      categories: cats,
    });
    idx++;
  }
  return items;
}

async function fetchSource(src: {
  name: string;
  url: string;
  img: string;
}): Promise<NewsItem[]> {
  try {
    const r = await fetch(src.url, {
      headers: { "User-Agent": "Mozilla/5.0 (CryptoVisionBot)" },
      next: { revalidate: 600 },
    });
    if (!r.ok) return [];
    const xml = await r.text();
    return parseFeed(xml, src);
  } catch {
    return [];
  }
}

export async function GET() {
  const all = await Promise.all(SOURCES.map(fetchSource));
  const merged = all.flat();

  // Sort by published_at desc
  merged.sort((a, b) => b.published_at - a.published_at);

  // Dedupe by URL (in case sources re-publish)
  const seen = new Set<string>();
  const unique: NewsItem[] = [];
  for (const it of merged) {
    if (seen.has(it.url)) continue;
    seen.add(it.url);
    unique.push(it);
    if (unique.length >= 24) break;
  }

  return NextResponse.json({
    ok: true,
    items: unique,
    fetched_at: new Date().toISOString(),
    sources: SOURCES.map((s) => s.name),
  });
}
