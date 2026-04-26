import { NextResponse } from "next/server";

// Force dynamic — supaya selalu re-evaluate route, jangan static cache.
// revalidate dikecilkan ke 5 menit agar news update lebih cepat.
export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 min server cache

type RawEvent = {
  title: string;
  country: string;
  date: string;
  impact: "High" | "Medium" | "Low";
  forecast?: string;
  previous?: string;
};

type NewsEvent = RawEvent & {
  isCritical: boolean;
  minutesUntil: number;
};

// Crypto-specific — always include regardless of country/impact.
// Use word boundary match (SEC substring collides with "Sector" etc.)
const CRYPTO_KEYWORDS = ["SEC", "Bitcoin ETF", "Crypto", "Stablecoin", "CBDC"];

// US macro yang historically gerakkan crypto (include Medium impact ones too).
const US_MARKET_MOVERS = [
  "FOMC", "Federal Funds", "Fed Rate", "Fed Funds", "Interest Rate",
  "CPI", "Consumer Price",
  "PCE", "Personal Consumption",
  "PPI", "Producer Price",
  "NFP", "Non-Farm", "Nonfarm",
  "JOLTS", "Job Opening",
  "Unemployment",
  "GDP", "Gross Domestic",
  "Retail Sales",
  "ISM", "PMI",
  "Consumer Sentiment", "UoM", "Michigan",
  "Consumer Confidence",
  "Durable Goods",
  "Powell", "Fed Chair",
  "Employment Cost", "Employment Change",
];

// Central bank rate decisions dari mata uang mayor (pengaruh DXY → crypto).
const MAJOR_RATE_DECISION = [
  "ECB Rate", "Main Refinancing", "Deposit Facility",
  "Official Bank Rate", "BOE Rate", "Bank Rate",
  "BOJ Policy Rate", "Monetary Policy Statement",
  "BOC Rate", "Overnight Rate",
  "RBA Cash Rate", "Cash Rate",
];

const FF_URLS = [
  "https://nfs.faireconomy.media/ff_calendar_thisweek.json",
  "https://nfs.faireconomy.media/ff_calendar_nextweek.json",
];

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Match dengan word boundary — hindari false positive seperti "SEC" = "sector".
function matchesWordBoundary(title: string, keywords: string[]): boolean {
  for (const kw of keywords) {
    const re = new RegExp(`\\b${escapeRegex(kw)}\\b`, "i");
    if (re.test(title)) return true;
  }
  return false;
}

function isRelevantForCrypto(e: RawEvent): boolean {
  // 1. Crypto-specific keyword → always include
  if (matchesWordBoundary(e.title, CRYPTO_KEYWORDS)) return true;

  // 2. USD High impact → always include
  if (e.country === "USD" && e.impact === "High") return true;

  // 3. USD Medium impact + matches known US market-mover
  if (
    e.country === "USD" &&
    e.impact === "Medium" &&
    matchesWordBoundary(e.title, US_MARKET_MOVERS)
  ) {
    return true;
  }

  // 4. Major non-USD central bank rate decision (High only)
  if (
    e.impact === "High" &&
    ["EUR", "GBP", "JPY", "CAD", "AUD"].includes(e.country) &&
    matchesWordBoundary(e.title, MAJOR_RATE_DECISION)
  ) {
    return true;
  }

  return false;
}

async function fetchCalendar(): Promise<RawEvent[]> {
  const all: RawEvent[] = [];
  // Cache-bust query param agar Forex Factory CDN tidak return data lama
  const cacheBust = `?t=${Math.floor(Date.now() / (5 * 60 * 1000))}`;
  for (const url of FF_URLS) {
    try {
      const resp = await fetch(url + cacheBust, {
        headers: { "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 300 },
      });
      if (resp.ok) {
        const data = (await resp.json()) as RawEvent[];
        if (Array.isArray(data)) all.push(...data);
      }
    } catch {
      // ignore, try next
    }
  }
  return all;
}

export async function GET() {
  const raw = await fetchCalendar();
  const now = Date.now();
  const oneWeekAhead = now + 7 * 24 * 60 * 60 * 1000;

  const seen = new Set<string>();
  const events: NewsEvent[] = [];

  for (const e of raw) {
    if (!e.date || !e.title) continue;
    const ts = new Date(e.date).getTime();
    if (Number.isNaN(ts)) continue;

    // Window: dari sekarang sampai 7 hari ke depan
    // Past events otomatis hilang, future event > 7 hari di-skip
    if (ts < now) continue;
    if (ts > oneWeekAhead) continue;

    if (!isRelevantForCrypto(e)) continue;

    const key = `${e.date}|${e.title}|${e.country}`;
    if (seen.has(key)) continue;
    seen.add(key);

    events.push({
      ...e,
      isCritical: matchesWordBoundary(e.title, CRYPTO_KEYWORDS),
      minutesUntil: Math.round((ts - now) / 60000),
    });
  }

  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return NextResponse.json({
    events,  // tampilkan semua dalam window 7 hari
    updatedAt: new Date().toISOString(),
  });
}
