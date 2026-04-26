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

type NewsEvent = RawEvent & {
  isCritical: boolean;
  minutesUntil: number;
  hasReleased: boolean;
  scenario?: {
    bullish: string;
    bearish: string;
    explainer: string;
  };
};

// Skenario bullish/bearish per kategori event untuk crypto
function getScenario(title: string): NewsEvent["scenario"] | undefined {
  const t = title.toLowerCase();

  // Inflation events (CPI, PCE, PPI)
  if (/cpi|consumer price|pce|personal consumption|ppi|producer price/i.test(t)) {
    return {
      bullish: "Inflasi LEBIH RENDAH dari forecast = Fed cenderung dovish (rate cut) → crypto naik",
      bearish: "Inflasi LEBIH TINGGI dari forecast = Fed cenderung hawkish (rate tinggi) → crypto turun",
      explainer: "Inflasi tinggi = Fed pertahankan rate tinggi = USD kuat = crypto melemah. Inflasi rendah = harapan rate cut = crypto naik.",
    };
  }

  // Fed rate decisions
  if (/fed rate|interest rate|federal funds|fomc/i.test(t)) {
    return {
      bullish: "Rate CUT atau dovish statement = likuiditas naik → crypto pump",
      bearish: "Rate HIKE atau hawkish statement = likuiditas turun → crypto dump",
      explainer: "Suku bunga = pendingin/penghangat market. Rate cut = uang murah, asset risk-on (termasuk crypto) naik.",
    };
  }

  // Fed Press Conference / Powell
  if (/fed press|press conference|powell|fed chair|fed statement/i.test(t)) {
    return {
      bullish: "Powell sound dovish (sinyal rate cut, ekonomi melambat) → crypto naik",
      bearish: "Powell sound hawkish (komitmen lawan inflasi, rate stay high) → crypto turun",
      explainer: "Pidato Powell sering memberi clue arah Fed. Tone matters lebih dari kata-kata aktual.",
    };
  }

  // Employment (NFP, ADP, Unemployment)
  if (/nfp|non.?farm|payroll|adp|unemployment|jobless|employment change/i.test(t)) {
    if (/unemployment|jobless/i.test(t)) {
      return {
        bullish: "Unemployment NAIK / Jobless Claims TINGGI = ekonomi lemah → Fed cenderung cut → crypto naik",
        bearish: "Unemployment TURUN / Jobless Claims RENDAH = ekonomi kuat → Fed pertahankan rate → crypto turun",
        explainer: "Pasar tenaga kerja lemah = Fed punya alasan turunkan rate = bullish crypto.",
      };
    }
    return {
      bullish: "NFP / Payroll LEBIH RENDAH dari forecast = ekonomi melambat → Fed cut → crypto naik",
      bearish: "NFP / Payroll LEBIH TINGGI dari forecast = ekonomi kuat → Fed hawkish → crypto turun",
      explainer: "Counterintuitive: data ekonomi 'jelek' kadang bullish untuk crypto karena Fed jadi dovish.",
    };
  }

  // GDP
  if (/gdp|gross domestic/i.test(t)) {
    return {
      bullish: "GDP LEBIH RENDAH = ekonomi melambat → Fed cut → crypto naik",
      bearish: "GDP LEBIH TINGGI = overheat economy → Fed hawkish → crypto turun",
      explainer: "GDP tinggi = inflasi risk → Fed pertahankan rate. GDP rendah = recession risk → Fed cut.",
    };
  }

  // Retail Sales / Consumer
  if (/retail sales|consumer sentiment|consumer confidence|michigan|uom/i.test(t)) {
    return {
      bullish: "Konsumen LEMAH / sentiment turun = Fed dovish bias → crypto naik",
      bearish: "Konsumen KUAT / spending tinggi = inflasi pressure → Fed hawkish → crypto turun",
      explainer: "Spending konsumen kuat = inflasi tetap tinggi = Fed hawkish.",
    };
  }

  // PMI / ISM
  if (/pmi|ism|manufacturing|services/i.test(t)) {
    return {
      bullish: "PMI < 50 (kontraksi) atau di bawah forecast = ekonomi lemah → Fed cut → crypto naik",
      bearish: "PMI > 50 (ekspansi) atau di atas forecast = ekonomi kuat → Fed hawkish → crypto turun",
      explainer: "PMI 50 = neutral. <50 = sektor kontraksi. >50 = ekspansi.",
    };
  }

  // Housing
  if (/building permits|housing starts|home sales/i.test(t)) {
    return {
      bullish: "Housing data LEMAH = ekonomi melambat → Fed dovish → crypto naik",
      bearish: "Housing data KUAT = ekonomi kuat + suku bunga tahan tinggi → crypto turun",
      explainer: "Housing sektor sensitif suku bunga. Lemah = sinyal rate cut diperlukan.",
    };
  }

  // Durable Goods / Factory Orders
  if (/durable goods|factory orders/i.test(t)) {
    return {
      bullish: "Order TURUN = demand lemah → Fed cut → crypto naik",
      bearish: "Order NAIK = demand kuat → Fed hawkish → crypto turun",
      explainer: "Indikator awal aktivitas industri. Lemah = recession risk.",
    };
  }

  // Crypto-specific
  if (/sec|bitcoin etf|crypto|stablecoin|cbdc/i.test(t)) {
    return {
      bullish: "Approval ETF, regulasi positif, atau adoption news → crypto naik",
      bearish: "Lawsuit SEC, ban, atau regulasi ketat → crypto turun",
      explainer: "Berita regulasi langsung pengaruh sentimen crypto market.",
    };
  }

  // Trade Balance
  if (/trade balance/i.test(t)) {
    return {
      bullish: "Defisit BESAR = USD melemah → crypto naik (denominated USD)",
      bearish: "Surplus BESAR = USD menguat → crypto turun",
      explainer: "USD strength inversely impacts crypto. Trade defisit = USD lemah.",
    };
  }

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
      scenario: getScenario(e.title),
    });
  }

  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return NextResponse.json({
    events,
    updatedAt: new Date().toISOString(),
  });
}
