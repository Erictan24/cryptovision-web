"use client";

import { useEffect, useState } from "react";
import { Newspaper, AlertTriangle, ChevronDown, TrendingUp, TrendingDown, Info } from "lucide-react";
import { useLang } from "./LanguageProvider";

type ScenarioKey =
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

type ScenarioText = { bullish: string; bearish: string; explainer: string };

const SCENARIO_TEXT: Record<ScenarioKey, { id: ScenarioText; en: ScenarioText }> = {
  inflation: {
    id: {
      bullish: "Inflasi LEBIH RENDAH dari forecast = Fed cenderung dovish (rate cut) → crypto naik",
      bearish: "Inflasi LEBIH TINGGI dari forecast = Fed cenderung hawkish (rate tinggi) → crypto turun",
      explainer: "Inflasi tinggi = Fed pertahankan rate tinggi = USD kuat = crypto melemah. Inflasi rendah = harapan rate cut = crypto naik.",
    },
    en: {
      bullish: "Inflation LOWER than forecast = Fed leans dovish (rate cut) → crypto up",
      bearish: "Inflation HIGHER than forecast = Fed leans hawkish (rates stay high) → crypto down",
      explainer: "High inflation = Fed keeps rates high = strong USD = crypto weakens. Low inflation = rate cut hopes = crypto rises.",
    },
  },
  fed_rate: {
    id: {
      bullish: "Rate CUT atau dovish statement = likuiditas naik → crypto pump",
      bearish: "Rate HIKE atau hawkish statement = likuiditas turun → crypto dump",
      explainer: "Suku bunga = pendingin/penghangat market. Rate cut = uang murah, asset risk-on (termasuk crypto) naik.",
    },
    en: {
      bullish: "Rate CUT or dovish statement = liquidity rises → crypto pumps",
      bearish: "Rate HIKE or hawkish statement = liquidity drops → crypto dumps",
      explainer: "Interest rates = market cooler/heater. Rate cut = cheap money, risk-on assets (incl. crypto) rise.",
    },
  },
  fed_press: {
    id: {
      bullish: "Powell sound dovish (sinyal rate cut, ekonomi melambat) → crypto naik",
      bearish: "Powell sound hawkish (komitmen lawan inflasi, rate stay high) → crypto turun",
      explainer: "Pidato Powell sering memberi clue arah Fed. Tone matters lebih dari kata-kata aktual.",
    },
    en: {
      bullish: "Powell sounds dovish (rate cut signal, slowing economy) → crypto up",
      bearish: "Powell sounds hawkish (commitment to fight inflation, rates stay high) → crypto down",
      explainer: "Powell's speech often signals Fed direction. Tone matters more than literal words.",
    },
  },
  employment: {
    id: {
      bullish: "NFP / Payroll LEBIH RENDAH dari forecast = ekonomi melambat → Fed cut → crypto naik",
      bearish: "NFP / Payroll LEBIH TINGGI dari forecast = ekonomi kuat → Fed hawkish → crypto turun",
      explainer: "Counterintuitive: data ekonomi 'jelek' kadang bullish untuk crypto karena Fed jadi dovish.",
    },
    en: {
      bullish: "NFP / Payroll LOWER than forecast = slowing economy → Fed cut → crypto up",
      bearish: "NFP / Payroll HIGHER than forecast = strong economy → Fed hawkish → crypto down",
      explainer: "Counterintuitive: 'bad' economic data is sometimes bullish for crypto because Fed turns dovish.",
    },
  },
  unemployment: {
    id: {
      bullish: "Unemployment NAIK / Jobless Claims TINGGI = ekonomi lemah → Fed cenderung cut → crypto naik",
      bearish: "Unemployment TURUN / Jobless Claims RENDAH = ekonomi kuat → Fed pertahankan rate → crypto turun",
      explainer: "Pasar tenaga kerja lemah = Fed punya alasan turunkan rate = bullish crypto.",
    },
    en: {
      bullish: "Unemployment UP / Jobless Claims HIGH = weak economy → Fed leans toward cut → crypto up",
      bearish: "Unemployment DOWN / Jobless Claims LOW = strong economy → Fed keeps rates → crypto down",
      explainer: "Weak labor market = Fed has reason to cut rates = bullish for crypto.",
    },
  },
  gdp: {
    id: {
      bullish: "GDP LEBIH RENDAH = ekonomi melambat → Fed cut → crypto naik",
      bearish: "GDP LEBIH TINGGI = overheat economy → Fed hawkish → crypto turun",
      explainer: "GDP tinggi = inflasi risk → Fed pertahankan rate. GDP rendah = recession risk → Fed cut.",
    },
    en: {
      bullish: "GDP LOWER = slowing economy → Fed cut → crypto up",
      bearish: "GDP HIGHER = overheating economy → Fed hawkish → crypto down",
      explainer: "High GDP = inflation risk → Fed holds rates. Low GDP = recession risk → Fed cut.",
    },
  },
  consumer: {
    id: {
      bullish: "Konsumen LEMAH / sentiment turun = Fed dovish bias → crypto naik",
      bearish: "Konsumen KUAT / spending tinggi = inflasi pressure → Fed hawkish → crypto turun",
      explainer: "Spending konsumen kuat = inflasi tetap tinggi = Fed hawkish.",
    },
    en: {
      bullish: "Consumer WEAK / sentiment falling = Fed dovish bias → crypto up",
      bearish: "Consumer STRONG / high spending = inflation pressure → Fed hawkish → crypto down",
      explainer: "Strong consumer spending = inflation stays high = Fed hawkish.",
    },
  },
  pmi: {
    id: {
      bullish: "PMI < 50 (kontraksi) atau di bawah forecast = ekonomi lemah → Fed cut → crypto naik",
      bearish: "PMI > 50 (ekspansi) atau di atas forecast = ekonomi kuat → Fed hawkish → crypto turun",
      explainer: "PMI 50 = neutral. <50 = sektor kontraksi. >50 = ekspansi.",
    },
    en: {
      bullish: "PMI < 50 (contraction) or below forecast = weak economy → Fed cut → crypto up",
      bearish: "PMI > 50 (expansion) or above forecast = strong economy → Fed hawkish → crypto down",
      explainer: "PMI 50 = neutral. <50 = sector contraction. >50 = expansion.",
    },
  },
  housing: {
    id: {
      bullish: "Housing data LEMAH = ekonomi melambat → Fed dovish → crypto naik",
      bearish: "Housing data KUAT = ekonomi kuat + suku bunga tahan tinggi → crypto turun",
      explainer: "Housing sektor sensitif suku bunga. Lemah = sinyal rate cut diperlukan.",
    },
    en: {
      bullish: "Housing data WEAK = slowing economy → Fed dovish → crypto up",
      bearish: "Housing data STRONG = strong economy + rates stay high → crypto down",
      explainer: "Housing is rate-sensitive. Weak = signal that rate cuts are needed.",
    },
  },
  durable: {
    id: {
      bullish: "Order TURUN = demand lemah → Fed cut → crypto naik",
      bearish: "Order NAIK = demand kuat → Fed hawkish → crypto turun",
      explainer: "Indikator awal aktivitas industri. Lemah = recession risk.",
    },
    en: {
      bullish: "Orders DOWN = weak demand → Fed cut → crypto up",
      bearish: "Orders UP = strong demand → Fed hawkish → crypto down",
      explainer: "Early indicator of industrial activity. Weak = recession risk.",
    },
  },
  crypto_specific: {
    id: {
      bullish: "Approval ETF, regulasi positif, atau adoption news → crypto naik",
      bearish: "Lawsuit SEC, ban, atau regulasi ketat → crypto turun",
      explainer: "Berita regulasi langsung pengaruh sentimen crypto market.",
    },
    en: {
      bullish: "ETF approval, positive regulation, or adoption news → crypto up",
      bearish: "SEC lawsuit, ban, or strict regulation → crypto down",
      explainer: "Regulatory news directly impacts crypto market sentiment.",
    },
  },
  trade_balance: {
    id: {
      bullish: "Defisit BESAR = USD melemah → crypto naik (denominated USD)",
      bearish: "Surplus BESAR = USD menguat → crypto turun",
      explainer: "USD strength inversely impacts crypto. Trade defisit = USD lemah.",
    },
    en: {
      bullish: "Large DEFICIT = USD weakens → crypto up (USD-denominated)",
      bearish: "Large SURPLUS = USD strengthens → crypto down",
      explainer: "USD strength inversely impacts crypto. Trade deficit = weak USD.",
    },
  },
};

type NewsEvent = {
  title: string;
  country: string;
  date: string;
  impact: "High" | "Medium" | "Low";
  forecast?: string;
  previous?: string;
  actual?: string;
  isCritical: boolean;
  minutesUntil: number;
  hasReleased: boolean;
  scenario_key?: ScenarioKey;
};

const COUNTRY_FLAG: Record<string, string> = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵",
  AUD: "🇦🇺", CAD: "🇨🇦", CHF: "🇨🇭", NZD: "🇳🇿", CNY: "🇨🇳",
};

function formatTime(iso: string, locale: "id" | "en"): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(locale === "id" ? "id-ID" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateHeader(iso: string, locale: "id" | "en"): string {
  const d = new Date(iso);
  return d.toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatCountdown(mins: number, locale: "id" | "en"): string {
  if (mins < 0) {
    const past = Math.abs(mins);
    if (past < 60) return locale === "id" ? `${past}m lalu` : `${past}m ago`;
    const h = Math.floor(past / 60);
    return locale === "id" ? `${h}j lalu` : `${h}h ago`;
  }
  if (mins < 60) return locale === "id" ? `${mins}m lagi` : `in ${mins}m`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  if (hours < 24) {
    return locale === "id" ? `${hours}j ${rem}m` : `${hours}h ${rem}m`;
  }
  const days = Math.floor(hours / 24);
  return locale === "id" ? `${days}h lagi` : `in ${days}d`;
}

// Compare actual vs forecast — return color hint
function compareActual(actual?: string, forecast?: string): "better" | "worse" | "neutral" {
  if (!actual || !forecast) return "neutral";
  const a = parseFloat(actual.replace(/[^0-9.\-]/g, ""));
  const f = parseFloat(forecast.replace(/[^0-9.\-]/g, ""));
  if (isNaN(a) || isNaN(f)) return "neutral";
  if (a > f) return "better"; // depends on event but generally higher
  if (a < f) return "worse";
  return "neutral";
}

/**
 * Tentukan dampak ke crypto berdasarkan tipe event + actual vs forecast.
 * - Higher actual umumnya = BEARISH crypto (kecuali Unemployment / Jobless Claims).
 * - Returns null untuk event yang tidak masuk kategori (avoid misleading label).
 */
function getCryptoImpact(
  eventTitle: string,
  comparison: "better" | "worse" | "neutral",
): { direction: "bullish" | "bearish"; label: { id: string; en: string } } | null {
  if (comparison === "neutral") return null;
  const t = eventTitle.toLowerCase();

  // Special case: higher = BULLISH crypto (Fed dovish karena ekonomi lemah)
  const dovishOnHigher = [
    "unemployment rate",
    "initial jobless",
    "continuing claims",
    "jobless claims",
  ];
  if (dovishOnHigher.some((k) => t.includes(k))) {
    if (comparison === "better") {
      return {
        direction: "bullish",
        label: {
          id: "BULLISH crypto — pengangguran naik → Fed cenderung pangkas suku bunga",
          en: "BULLISH crypto — joblessness up → Fed leans toward rate cut",
        },
      };
    }
    return {
      direction: "bearish",
      label: {
        id: "BEARISH crypto — tenaga kerja kuat → Fed pertahankan suku bunga tinggi",
        en: "BEARISH crypto — labor strong → Fed keeps rates high",
      },
    };
  }

  // Most cases: higher actual = BEARISH crypto (Fed hawkish)
  const hawkishOnHigher = [
    "cpi", "ppi", "pce", "inflation", "price index",
    "nfp", "non-farm", "non farm", "nonfarm", "payroll", "adp employ",
    "pmi", "ism", "manufacturing", "services index",
    "retail sales", "gdp", "consumer confidence",
    "fed funds", "interest rate decision", "rate decision", "fomc rate",
    "core ppi", "core cpi", "core pce",
  ];
  if (hawkishOnHigher.some((k) => t.includes(k))) {
    if (comparison === "better") {
      return {
        direction: "bearish",
        label: {
          id: "BEARISH crypto — data lebih kuat → Fed cenderung hawkish (rate tinggi)",
          en: "BEARISH crypto — data stronger → Fed leans hawkish (rates stay high)",
        },
      };
    }
    return {
      direction: "bullish",
      label: {
        id: "BULLISH crypto — data lebih lemah → Fed cenderung dovish (rate cut)",
        en: "BULLISH crypto — data weaker → Fed leans dovish (rate cut)",
      },
    };
  }

  return null;  // event tidak masuk kategori → tidak kasih label sembarang
}

function ImpactBars({ impact }: { impact: "High" | "Medium" | "Low" }) {
  const fillCount = impact === "High" ? 3 : impact === "Medium" ? 2 : 1;
  const color =
    impact === "High" ? "bg-[var(--color-danger)]" :
    impact === "Medium" ? "bg-[var(--color-warning,#f59e0b)]" :
    "bg-[var(--color-text-muted)]";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`h-3 w-1 rounded-sm ${i <= fillCount ? color : "bg-[var(--color-border)]"}`}
        />
      ))}
    </div>
  );
}

export default function NewsSection() {
  const { locale } = useLang();
  const [events, setEvents] = useState<NewsEvent[] | null>(null);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`/api/news?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []))
      .catch(() => setError(true));
  }, []);

  function toggleExpand(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // Group events by day
  const grouped: Record<string, NewsEvent[]> = {};
  events?.forEach((ev) => {
    const k = dayKey(ev.date);
    if (!grouped[k]) grouped[k] = [];
    grouped[k].push(ev);
  });
  const dayKeys = Object.keys(grouped);

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Newspaper size={18} className="text-[var(--color-accent)]" />
        <h2 className="text-lg font-bold">
          {locale === "id" ? "Kalender Ekonomi" : "Economic Calendar"}
        </h2>
        <span className="text-xs text-[var(--color-text-muted)]">
          {locale === "id" ? "— 7 hari ke depan, klik untuk skenario" : "— next 7 days, click for scenario"}
        </span>
      </div>

      {/* LEGEND — penjelasan UI elements */}
      <div className="mb-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
        <div className="mb-3 flex items-center gap-2">
          <Info size={14} className="text-[var(--color-accent)]" />
          <span className="text-xs font-bold text-[var(--color-text-secondary)]">
            {locale === "id" ? "Cara Membaca Kalender" : "How to Read"}
          </span>
        </div>

        <div className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
          {/* Impact bars legend */}
          <div>
            <div className="mb-1.5 text-[10px] font-bold uppercase text-[var(--color-text-muted)]">
              {locale === "id" ? "Tingkat Dampak" : "Impact Level"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ImpactBars impact="High" />
                <span className="text-[var(--color-danger)] font-semibold">High</span>
                <span className="text-[var(--color-text-muted)]">
                  {locale === "id" ? "— gerakkan market besar" : "— big market mover"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ImpactBars impact="Medium" />
                <span className="text-[var(--color-warning,#f59e0b)] font-semibold">Medium</span>
                <span className="text-[var(--color-text-muted)]">
                  {locale === "id" ? "— pengaruh sedang" : "— moderate effect"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ImpactBars impact="Low" />
                <span className="text-[var(--color-text-muted)] font-semibold">Low</span>
                <span className="text-[var(--color-text-muted)]">
                  {locale === "id" ? "— minor impact" : "— minor impact"}
                </span>
              </div>
            </div>
          </div>

          {/* Negara */}
          <div>
            <div className="mb-1.5 text-[10px] font-bold uppercase text-[var(--color-text-muted)]">
              {locale === "id" ? "Fokus Negara" : "Country Focus"}
            </div>
            <div className="space-y-1 text-[var(--color-text-secondary)]">
              <div>🇺🇸 <span className="text-[var(--color-text-muted)]">
                {locale === "id" ? "USD — paling pengaruh ke crypto" : "USD — biggest crypto impact"}
              </span></div>
              <div className="text-[10px] text-[var(--color-text-muted)]">
                {locale === "id"
                  ? "Khusus event US (Fed, CPI, NFP, dll) + crypto-specific news"
                  : "US events only (Fed, CPI, NFP, etc) + crypto-specific news"}
              </div>
            </div>
          </div>

          {/* Actual vs Forecast */}
          <div>
            <div className="mb-1.5 text-[10px] font-bold uppercase text-[var(--color-text-muted)]">
              {locale === "id" ? "Angka Data" : "Data Numbers"}
            </div>
            <div className="space-y-1 text-[var(--color-text-secondary)]">
              <div>
                <span className="font-bold text-[var(--color-text-secondary)]">Actual</span>
                <span className="text-[var(--color-text-muted)]">
                  {locale === "id" ? " — hasil aktual rilis" : " — actual released figure"}
                </span>
              </div>
              <div>
                <span className="font-bold text-[var(--color-text-secondary)]">Forecast</span>
                <span className="text-[var(--color-text-muted)]">
                  {locale === "id" ? " — prediksi analis" : " — analyst prediction"}
                </span>
              </div>
              <div>
                <span className="font-bold text-[var(--color-text-secondary)]">Prior</span>
                <span className="text-[var(--color-text-muted)]">
                  {locale === "id" ? " — data periode sebelumnya" : " — previous period data"}
                </span>
              </div>
              <div className="text-[10px]">
                <span className="text-[var(--color-success)]">
                  {locale === "id" ? "Hijau" : "Green"}
                </span>
                <span className="text-[var(--color-text-muted)]">
                  {locale === "id" ? " = lebih tinggi dari forecast " : " = higher than forecast "}
                </span>
                <span className="text-[var(--color-danger)]">
                  {locale === "id" ? "Merah" : "Red"}
                </span>
                <span className="text-[var(--color-text-muted)]">
                  {locale === "id" ? " = lebih rendah" : " = lower"}
                </span>
              </div>
            </div>
          </div>

          {/* Interaction */}
          <div>
            <div className="mb-1.5 text-[10px] font-bold uppercase text-[var(--color-text-muted)]">
              {locale === "id" ? "Interaksi" : "Interaction"}
            </div>
            <div className="space-y-1 text-[var(--color-text-secondary)]">
              <div className="flex items-center gap-1.5">
                <ChevronDown size={12} className="text-[var(--color-accent)]" />
                <span className="text-[var(--color-text-muted)]">
                  {locale === "id" ? "Klik row → skenario bull/bear" : "Click row → bull/bear scenario"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <AlertTriangle size={11} className="text-[var(--color-accent)]" />
                <span className="text-[var(--color-text-muted)]">
                  {locale === "id" ? "Tag CRYPTO = pengaruh langsung" : "CRYPTO tag = direct impact"}
                </span>
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)]">
                {locale === "id"
                  ? "Event yang sudah lewat tampil pudar (12 jam grace)"
                  : "Past events shown faded (12h grace period)"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden">
        {error && (
          <div className="p-5">
            <p className="text-sm text-[var(--color-text-muted)]">
              {locale === "id" ? "Gagal memuat kalender." : "Failed to load calendar."}
            </p>
          </div>
        )}

        {!error && events === null && (
          <div className="p-5">
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
              {locale === "id" ? "Memuat kalender..." : "Loading calendar..."}
            </div>
          </div>
        )}

        {!error && events !== null && events.length === 0 && (
          <div className="p-5">
            <p className="text-sm text-[var(--color-text-muted)]">
              {locale === "id" ? "Tidak ada event minggu ini." : "No events this week."}
            </p>
          </div>
        )}

        {dayKeys.map((dk) => {
          const dayEvents = grouped[dk];
          const dateStr = formatDateHeader(dayEvents[0].date, locale);
          return (
            <div key={dk}>
              {/* Day header */}
              <div className="bg-[var(--color-bg-primary)] px-4 py-2.5 border-b border-[var(--color-border)]">
                <h3 className="text-sm font-bold text-[var(--color-text-secondary)]">
                  {dateStr}
                </h3>
              </div>

              {/* Events */}
              {dayEvents.map((ev, i) => {
                const key = `${ev.date}-${ev.title}-${i}`;
                const isExpanded = expanded.has(key);
                const isPast = ev.hasReleased;
                const flag = COUNTRY_FLAG[ev.country] || "🌐";
                const cmp = compareActual(ev.actual, ev.forecast);
                const actualColor =
                  cmp === "better" ? "text-[var(--color-success)]" :
                  cmp === "worse" ? "text-[var(--color-danger)]" :
                  "text-[var(--color-text-secondary)]";
                const scenario = ev.scenario_key
                  ? SCENARIO_TEXT[ev.scenario_key]?.[locale]
                  : undefined;

                return (
                  <div
                    key={key}
                    className={`border-b border-[var(--color-border)] last:border-0 transition-colors ${
                      isPast ? "opacity-60" : ""
                    } ${scenario ? "cursor-pointer hover:bg-[var(--color-bg-primary)]/40" : ""}`}
                    onClick={() => scenario && toggleExpand(key)}
                  >
                    {/* Main row */}
                    <div className="grid grid-cols-12 items-center gap-2 px-4 py-3 text-sm">
                      {/* Time */}
                      <div className="col-span-2 sm:col-span-1 font-mono text-xs text-[var(--color-text-secondary)]">
                        {formatTime(ev.date, locale)}
                      </div>

                      {/* Flag + Impact */}
                      <div className="col-span-1 flex items-center gap-1">
                        <span className="text-lg">{flag}</span>
                      </div>

                      {/* Impact bars */}
                      <div className="col-span-1">
                        <ImpactBars impact={ev.impact} />
                      </div>

                      {/* Title + tags */}
                      <div className="col-span-8 sm:col-span-5 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-medium truncate">{ev.title}</span>
                          {ev.isCritical && (
                            <span className="flex items-center gap-0.5 rounded bg-[var(--color-accent)]/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-[var(--color-accent)]">
                              <AlertTriangle size={9} /> Crypto
                            </span>
                          )}
                          {!isPast && (
                            <span className="text-[10px] text-[var(--color-text-muted)]">
                              {formatCountdown(ev.minutesUntil, locale)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actual / Forecast / Prev */}
                      <div className="col-span-12 sm:col-span-4 mt-1 sm:mt-0 flex items-center justify-end gap-3 text-xs">
                        <div className="text-right">
                          <div className="text-[9px] text-[var(--color-text-muted)] uppercase">Actual</div>
                          <div className={`font-bold ${actualColor}`}>{ev.actual || "—"}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] text-[var(--color-text-muted)] uppercase">Forecast</div>
                          <div className="font-medium">{ev.forecast || "—"}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] text-[var(--color-text-muted)] uppercase">Prior</div>
                          <div className="text-[var(--color-text-muted)]">{ev.previous || "—"}</div>
                        </div>
                        {scenario && (
                          <ChevronDown
                            size={14}
                            className={`text-[var(--color-text-muted)] transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          />
                        )}
                      </div>
                    </div>

                    {/* Expanded scenario */}
                    {isExpanded && scenario && (
                      <div className="bg-[var(--color-bg-primary)]/40 border-t border-[var(--color-border)] px-4 py-4">
                        <div className="mb-3 flex items-start gap-2 text-xs text-[var(--color-text-secondary)]">
                          <Info size={14} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
                          <p>{scenario.explainer}</p>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div className="rounded-lg border border-[var(--color-success)]/30 bg-[var(--color-success)]/5 p-3">
                            <div className="mb-1 flex items-center gap-1.5">
                              <TrendingUp size={12} className="text-[var(--color-success)]" />
                              <span className="text-[10px] font-bold uppercase text-[var(--color-success)]">
                                {locale === "id" ? "Skenario Bullish" : "Bullish Scenario"}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--color-text-secondary)]">{scenario.bullish}</p>
                          </div>
                          <div className="rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-3">
                            <div className="mb-1 flex items-center gap-1.5">
                              <TrendingDown size={12} className="text-[var(--color-danger)]" />
                              <span className="text-[10px] font-bold uppercase text-[var(--color-danger)]">
                                {locale === "id" ? "Skenario Bearish" : "Bearish Scenario"}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--color-text-secondary)]">{scenario.bearish}</p>
                          </div>
                        </div>
                        {isPast && ev.actual && (() => {
                          const impact = getCryptoImpact(ev.title, cmp);
                          const impactBg = impact?.direction === "bullish"
                            ? "border-[var(--color-success)]/30 bg-[var(--color-success)]/5"
                            : impact?.direction === "bearish"
                              ? "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5"
                              : "";
                          const impactColor = impact?.direction === "bullish"
                            ? "text-[var(--color-success)]"
                            : "text-[var(--color-danger)]";
                          return (
                            <div className="mt-3 space-y-2">
                              <div className="rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] p-3">
                                <div className="mb-1 text-[10px] font-bold uppercase text-[var(--color-text-muted)]">
                                  {locale === "id" ? "Hasil Aktual" : "Actual Result"}
                                </div>
                                <div className="text-sm">
                                  <span className="text-[var(--color-text-muted)]">Actual: </span>
                                  <span className={`font-bold ${actualColor}`}>{ev.actual}</span>
                                  <span className="text-[var(--color-text-muted)]">
                                    {locale === "id" ? " vs Forecast " : " vs Forecast "}{ev.forecast || "—"}
                                  </span>
                                  {cmp !== "neutral" && (
                                    <div className="mt-1 text-xs text-[var(--color-text-secondary)]">
                                      {cmp === "better"
                                        ? (locale === "id" ? "→ Lebih tinggi dari ekspektasi" : "→ Higher than expected")
                                        : (locale === "id" ? "→ Lebih rendah dari ekspektasi" : "→ Lower than expected")}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {impact && (
                                <div className={`rounded-lg border p-3 ${impactBg}`}>
                                  <div className="flex items-start gap-2">
                                    {impact.direction === "bullish" ? (
                                      <TrendingUp size={14} className={`${impactColor} mt-0.5 shrink-0`} />
                                    ) : (
                                      <TrendingDown size={14} className={`${impactColor} mt-0.5 shrink-0`} />
                                    )}
                                    <div className="flex-1">
                                      <div className={`text-[10px] font-bold uppercase ${impactColor} mb-0.5`}>
                                        {locale === "id" ? "Dampak ke Crypto" : "Crypto Impact"}
                                      </div>
                                      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                                        {impact.label[locale]}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}
