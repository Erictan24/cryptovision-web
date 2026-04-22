import { NextResponse } from "next/server";

export const revalidate = 1800; // 30 min server cache

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

const CRITICAL_KEYWORDS = [
  "FOMC", "Federal Funds", "Fed Rate", "Interest Rate",
  "CPI", "Consumer Price", "Inflation",
  "NFP", "Non-Farm", "Nonfarm", "Employment",
  "GDP", "Gross Domestic",
  "PPI", "Producer Price",
  "PCE", "Personal Consumption",
  "JOLTS", "Job Opening",
  "Retail Sales",
  "Powell", "Fed Chair", "Fed Speech",
  "Treasury", "Debt",
  "Bitcoin ETF", "Crypto", "SEC",
];

const FF_URLS = [
  "https://nfs.faireconomy.media/ff_calendar_thisweek.json",
  "https://nfs.faireconomy.media/ff_calendar_nextweek.json",
];

async function fetchCalendar(): Promise<RawEvent[]> {
  const all: RawEvent[] = [];
  for (const url of FF_URLS) {
    try {
      const resp = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 1800 },
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

  const seen = new Set<string>();
  const events: NewsEvent[] = [];

  for (const e of raw) {
    if (!e.date || !e.title) continue;
    const ts = new Date(e.date).getTime();
    if (Number.isNaN(ts)) continue;

    // Skip past events (older than 1h ago)
    if (ts < now - 60 * 60 * 1000) continue;

    // Only High + Medium (skip Low noise)
    if (e.impact !== "High" && e.impact !== "Medium") continue;

    const isCritical = CRITICAL_KEYWORDS.some((kw) =>
      e.title.toLowerCase().includes(kw.toLowerCase()),
    );

    // For Medium impact, only keep if USD/EUR or matches critical keyword
    if (e.impact === "Medium" && !isCritical && e.country !== "USD" && e.country !== "EUR") {
      continue;
    }

    const key = `${e.date}|${e.title}|${e.country}`;
    if (seen.has(key)) continue;
    seen.add(key);

    events.push({
      ...e,
      isCritical,
      minutesUntil: Math.round((ts - now) / 60000),
    });
  }

  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return NextResponse.json({
    events: events.slice(0, 20),
    updatedAt: new Date().toISOString(),
  });
}
