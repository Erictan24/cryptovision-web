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
  actual?: string;
};

export type ScenarioKey =
  | "inflation"
  | "fed_rate"
  | "fed_press"
  | "employment"
  | "unemployment"
  | "gdp"
  | "consumer"
  | "pmi"
  | "housing"
  | "durable"
  | "crypto_specific"
  | "trade_balance";

type NewsEvent = RawEvent & {
  isCritical: boolean;
  minutesUntil: number;
  hasReleased: boolean;
  scenario_key?: ScenarioKey;
};

// Klasifikasi event ke kategori scenario. Translation di-handle di component.
function getScenarioKey(title: string): ScenarioKey | undefined {
  const t = title.toLowerCase();
  if (/cpi|consumer price|pce|personal consumption|ppi|producer price/i.test(t)) return "inflation";
  if (/fed rate|interest rate|federal funds|fomc/i.test(t)) return "fed_rate";
  if (/fed press|press conference|powell|fed chair|fed statement/i.test(t)) return "fed_press";
  if (/unemployment|jobless/i.test(t)) return "unemployment";
  if (/nfp|non.?farm|payroll|adp|employment change/i.test(t)) return "employment";
  if (/gdp|gross domestic/i.test(t)) return "gdp";
  if (/retail sales|consumer sentiment|consumer confidence|michigan|uom/i.test(t)) return "consumer";
  if (/pmi|ism|manufacturing|services/i.test(t)) return "pmi";
  if (/building permits|housing starts|home sales/i.test(t)) return "housing";
  if (/durable goods|factory orders/i.test(t)) return "durable";
  if (/sec|bitcoin etf|crypto|stablecoin|cbdc/i.test(t)) return "crypto_specific";
  if (/trade balance/i.test(t)) return "trade_balance";
  return undefined;
}

// Crypto-specific — always include regardless of country/impact.
// Use word boundary match (SEC substring collides with "Sector" etc.)
const CRYPTO_KEYWORDS = ["SEC", "Bitcoin ETF", "Crypto", "Stablecoin", "CBDC"];

// US macro yang historically gerakkan crypto (include Medium impact ones too).
const US_MARKET_MOVERS = [
  "FOMC", "Federal Funds", "Fed Rate", "Fed Funds", "Interest Rate",
  "Fed Press", "Press Conference", "Fed Chair", "Fed Statement",
  "CPI", "Consumer Price", "Core CPI",
  "PCE", "Personal Consumption", "Core PCE",
  "PPI", "Producer Price",
  "NFP", "Non-Farm", "Nonfarm", "Payroll",
  "JOLTS", "Job Opening", "Job Openings",
  "Unemployment", "Initial Jobless", "Continuing Jobless",
  "GDP", "Gross Domestic",
  "Retail Sales",
  "ISM", "PMI", "Manufacturing PMI", "Services PMI",
  "Consumer Sentiment", "UoM", "Michigan",
  "Consumer Confidence",
  "Durable Goods", "Factory Orders",
  "Building Permits", "Housing Starts", "New Home Sales", "Existing Home Sales",
  "Trade Balance",
  "Powell",
  "Employment Cost", "Employment Change",
  "ADP",
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
  // Khusus US (USD) saja — sesuai permintaan user
  if (e.country !== "USD") return false;

  // 1. Crypto-specific keyword → always include
  if (matchesWordBoundary(e.title, CRYPTO_KEYWORDS)) return true;

  // 2. USD High impact → always include
  if (e.impact === "High") return true;

  // 3. USD Medium/Low impact + matches known US market-mover
  if (
    (e.impact === "Medium" || e.impact === "Low") &&
    matchesWordBoundary(e.title, US_MARKET_MOVERS)
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
  // Grace period: keep past events 12 jam agar user bisa baca hasilnya
  const graceMs = 12 * 60 * 60 * 1000;
  const oneWeekAhead = now + 7 * 24 * 60 * 60 * 1000;

  const seen = new Set<string>();
  const events: NewsEvent[] = [];

  for (const e of raw) {
    if (!e.date || !e.title) continue;
    const ts = new Date(e.date).getTime();
    if (Number.isNaN(ts)) continue;

    // Window: 12 jam lalu → 7 hari ke depan
    if (ts < now - graceMs) continue;
    if (ts > oneWeekAhead) continue;

    if (!isRelevantForCrypto(e)) continue;

    const key = `${e.date}|${e.title}|${e.country}`;
    if (seen.has(key)) continue;
    seen.add(key);

    events.push({
      ...e,
      isCritical: matchesWordBoundary(e.title, CRYPTO_KEYWORDS),
      minutesUntil: Math.round((ts - now) / 60000),
      hasReleased: ts <= now,
      scenario_key: getScenarioKey(e.title),
    });
  }

  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return NextResponse.json({
    events,
    updatedAt: new Date().toISOString(),
  });
}
