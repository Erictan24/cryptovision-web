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
  comment?: string;   // deskripsi event dari TradingView
};

// Raw response dari TradingView calendar API
type TVEvent = {
  id: string;
  title: string;
  country: string;          // "US", "EU", "GB", "JP", dll
  indicator?: string;
  comment?: string;
  period?: string;
  source?: string;
  source_url?: string;
  date: string;             // ISO timestamp
  importance: -1 | 0 | 1;   // -1=Low, 0=Medium, 1=High
  actual?: number | null;
  previous?: number | null;
  forecast?: number | null;
  actualRaw?: number | null;
  previousRaw?: number | null;
  forecastRaw?: number | null;
  currency?: string;
};

// Map country code TradingView → format yang ada (3-letter currency)
const TV_COUNTRY_MAP: Record<string, string> = {
  "US": "USD", "EU": "EUR", "GB": "GBP", "JP": "JPY",
  "CA": "CAD", "AU": "AUD", "NZ": "NZD", "CH": "CHF",
  "CN": "CNY", "DE": "EUR", "FR": "EUR", "IT": "EUR",
  "ES": "EUR",
};

// Map TradingView importance → impact label
function mapImportance(imp: -1 | 0 | 1): "High" | "Medium" | "Low" {
  if (imp === 1) return "High";
  if (imp === 0) return "Medium";
  return "Low";
}

// Format numeric value dari TV → string yang display-friendly
// e.g. 1.538 → "1.538M" untuk Building Permits, atau langsung jadi "%.2f"
function formatTVValue(v: number | null | undefined): string | undefined {
  if (v === null || v === undefined) return undefined;
  // TV return raw number (e.g. 0.5 = 0.5%, 298500000 = 298.5M).
  // Tampilkan as-is — UI akan handle format.
  return String(v);
}

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

// Sources:
// - PRIMARY: TradingView calendar (include actual values, free, no auth)
// - FALLBACK: Forex Factory (kalau TV down, source data sebelumnya)
const TV_API = "https://economic-calendar.tradingview.com/events";
const TV_COUNTRIES = "US,EU,GB,JP,CA,AU";

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

/**
 * PRIMARY: Fetch dari TradingView calendar API.
 * Include actual + forecast + previous + importance + comment.
 * No auth, no rate limit visible. Origin header diperlukan.
 */
async function fetchFromTradingView(): Promise<RawEvent[]> {
  const now = Date.now();
  const fromTs = now - 12 * 60 * 60 * 1000;          // 12 jam lalu
  const toTs   = now + 7 * 24 * 60 * 60 * 1000;       // 7 hari ke depan
  const fromIso = new Date(fromTs).toISOString();
  const toIso   = new Date(toTs).toISOString();

  const url = `${TV_API}?from=${fromIso}&to=${toIso}&countries=${TV_COUNTRIES}`;

  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Origin": "https://www.tradingview.com",
      },
      next: { revalidate: 300 },
    });
    if (!resp.ok) return [];
    const json = await resp.json() as { result?: TVEvent[] };
    const events = json.result || [];

    return events.map((tv): RawEvent => {
      const country = TV_COUNTRY_MAP[tv.country] || tv.country;
      return {
        title    : tv.indicator || tv.title,
        country  : country,
        date     : tv.date,
        impact   : mapImportance(tv.importance),
        actual   : formatTVValue(tv.actual),
        forecast : formatTVValue(tv.forecast),
        previous : formatTVValue(tv.previous),
        comment  : tv.comment,
      };
    });
  } catch {
    return [];
  }
}

/**
 * FALLBACK: Fetch dari Forex Factory (data tanpa actual values).
 * Dipakai kalau TradingView API down/error.
 */
async function fetchFromForexFactory(): Promise<RawEvent[]> {
  const all: RawEvent[] = [];
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

async function fetchCalendar(): Promise<RawEvent[]> {
  // Try TradingView first (has actual values)
  const tv = await fetchFromTradingView();
  if (tv.length > 0) return tv;
  // Fallback ke Forex Factory kalau TV gagal
  return await fetchFromForexFactory();
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
