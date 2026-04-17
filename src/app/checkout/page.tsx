"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useLang } from "@/components/LanguageProvider";
import {
  ArrowLeft,
  Copy,
  Check,
  Building2,
  Wallet,
  Smartphone,
  Coins,
  Send,
  ExternalLink,
} from "lucide-react";

const PLANS: Record<string, { name: string; nameEn: string; priceIDR: string; priceUSD: string }> = {
  single: { name: "Bot Scalping / Swing", nameEn: "Scalping / Swing Bot", priceIDR: "Rp 249.000", priceUSD: "$19" },
  dual: { name: "Scalping + Swing", nameEn: "Scalping + Swing", priceIDR: "Rp 449.000", priceUSD: "$35" },
  indicator: { name: "Indikator TradingView", nameEn: "TradingView Indicator", priceIDR: "Rp 199.000", priceUSD: "$15" },
};

const METHODS = [
  { id: "bca", label: "BCA Transfer", icon: Building2, currency: "idr" },
  { id: "dana", label: "Dana", icon: Wallet, currency: "idr" },
  { id: "gopay", label: "GoPay", icon: Smartphone, currency: "idr" },
  { id: "usdt", label: "USDT", icon: Coins, currency: "usd" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="ml-2 rounded-md border border-[var(--color-border)] p-1.5 text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
    >
      {copied ? <Check size={12} className="text-[var(--color-success)]" /> : <Copy size={12} />}
    </button>
  );
}

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const { locale } = useLang();
  const [plan, setPlan] = useState<string>("");
  const [method, setMethod] = useState("bca");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login";
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const p = params.get("plan");
    if (p && PLANS[p]) setPlan(p);
  }, [user, loading]);

  const selectedPlan = plan ? PLANS[plan] : null;
  const selectedMethod = METHODS.find((m) => m.id === method)!;
  const isUSDT = method === "usdt";

  const handleCreateOrder = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          method,
          currency: isUSDT ? "usd" : "idr",
        }),
      });
      const data = await res.json();
      if (data.order) setOrderId(data.order.id);
    } catch {
      alert("Error creating order");
    }
    setCreating(false);
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="pointer-events-none absolute inset-0 gradient-hero" />

      <div className="relative mx-auto max-w-lg px-4 py-12">
        <a
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent-light)]"
        >
          <ArrowLeft size={14} />
          {locale === "id" ? "Kembali ke Dashboard" : "Back to Dashboard"}
        </a>

        <h1 className="text-2xl font-bold mb-6">
          {locale === "id" ? "Checkout" : "Checkout"}
        </h1>

        {/* Step 1: Pilih Paket */}
        {!plan && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <h2 className="font-semibold mb-4">
              {locale === "id" ? "Pilih Paket" : "Choose Plan"}
            </h2>
            <div className="space-y-3">
              {Object.entries(PLANS).map(([key, p]) => (
                <button
                  key={key}
                  onClick={() => setPlan(key)}
                  disabled={key === "indicator"}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    key === "indicator"
                      ? "border-[var(--color-border)] opacity-50 cursor-not-allowed"
                      : "border-[var(--color-border)] hover:border-[var(--color-accent)] card-glow"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {locale === "id" ? p.name : p.nameEn}
                    </span>
                    <span className="text-[var(--color-accent)] font-bold">
                      {p.priceIDR}
                    </span>
                  </div>
                  {key === "indicator" && (
                    <span className="text-xs text-purple-400 mt-1 block">Coming Soon</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Pilih Metode + Detail */}
        {plan && selectedPlan && (
          <div className="space-y-4">
            {/* Order Summary */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {locale === "id" ? "Paket" : "Plan"}
                  </p>
                  <p className="font-semibold">
                    {locale === "id" ? selectedPlan.name : selectedPlan.nameEn}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--color-text-muted)]">/bulan</p>
                  <p className="text-xl font-bold text-[var(--color-accent)]">
                    {isUSDT ? selectedPlan.priceUSD : selectedPlan.priceIDR}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setPlan(""); setOrderId(null); }}
                className="mt-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
              >
                {locale === "id" ? "Ganti paket" : "Change plan"}
              </button>
            </div>

            {/* Payment Method */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
              <p className="text-sm font-semibold mb-3">
                {locale === "id" ? "Metode Pembayaran" : "Payment Method"}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setMethod(m.id); setOrderId(null); }}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-xs transition ${
                      method === m.id
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                        : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]"
                    }`}
                  >
                    <m.icon size={18} />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Transfer Details */}
            {!orderId ? (
              <button
                onClick={handleCreateOrder}
                disabled={creating}
                className="w-full rounded-xl bg-[var(--color-accent)] py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-light)] glow-blue disabled:opacity-50"
              >
                {creating
                  ? "Creating order..."
                  : locale === "id" ? "Lanjut Bayar" : "Continue to Pay"}
              </button>
            ) : (
              <div className="rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-bg-card)] p-5 space-y-4">
                {/* Order ID */}
                <div className="flex items-center justify-between rounded-lg bg-[var(--color-bg-primary)] p-3">
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">Order ID</p>
                    <p className="font-mono text-sm font-bold">{orderId}</p>
                  </div>
                  <CopyButton text={orderId} />
                </div>

                {/* Payment Info */}
                {method === "bca" && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Transfer BCA</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[var(--color-text-muted)]">Nomor Rekening</p>
                        <p className="font-mono font-bold">{process.env.NEXT_PUBLIC_BCA_NUMBER}</p>
                      </div>
                      <CopyButton text={process.env.NEXT_PUBLIC_BCA_NUMBER || ""} />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">Atas Nama</p>
                      <p className="font-medium">{process.env.NEXT_PUBLIC_BCA_NAME}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[var(--color-text-muted)]">Nominal</p>
                        <p className="text-lg font-bold text-[var(--color-accent)]">{selectedPlan.priceIDR}</p>
                      </div>
                      <CopyButton text={String(selectedPlan.priceIDR.replace(/[^\d]/g, ""))} />
                    </div>
                  </div>
                )}

                {method === "dana" && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Transfer Dana</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[var(--color-text-muted)]">Nomor Dana</p>
                        <p className="font-mono font-bold">{process.env.NEXT_PUBLIC_DANA_NUMBER}</p>
                      </div>
                      <CopyButton text={process.env.NEXT_PUBLIC_DANA_NUMBER || ""} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[var(--color-text-muted)]">Nominal</p>
                        <p className="text-lg font-bold text-[var(--color-accent)]">{selectedPlan.priceIDR}</p>
                      </div>
                      <CopyButton text={String(selectedPlan.priceIDR.replace(/[^\d]/g, ""))} />
                    </div>
                  </div>
                )}

                {method === "gopay" && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Transfer GoPay</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[var(--color-text-muted)]">Nomor GoPay</p>
                        <p className="font-mono font-bold">{process.env.NEXT_PUBLIC_GOPAY_NUMBER}</p>
                      </div>
                      <CopyButton text={process.env.NEXT_PUBLIC_GOPAY_NUMBER || ""} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[var(--color-text-muted)]">Nominal</p>
                        <p className="text-lg font-bold text-[var(--color-accent)]">{selectedPlan.priceIDR}</p>
                      </div>
                      <CopyButton text={String(selectedPlan.priceIDR.replace(/[^\d]/g, ""))} />
                    </div>
                  </div>
                )}

                {method === "usdt" && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Transfer USDT</p>
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">Network</p>
                      <p className="font-medium text-yellow-400">{process.env.NEXT_PUBLIC_USDT_NETWORK}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-[var(--color-text-muted)]">Wallet Address</p>
                        <p className="font-mono text-xs font-bold break-all">{process.env.NEXT_PUBLIC_USDT_ADDRESS}</p>
                      </div>
                      <CopyButton text={process.env.NEXT_PUBLIC_USDT_ADDRESS || ""} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[var(--color-text-muted)]">Amount</p>
                        <p className="text-lg font-bold text-[var(--color-accent)]">{selectedPlan.priceUSD}</p>
                      </div>
                      <CopyButton text={selectedPlan.priceUSD.replace("$", "")} />
                    </div>
                  </div>
                )}

                {/* Warning */}
                <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3">
                  <p className="text-xs text-yellow-400">
                    {locale === "id"
                      ? "Transfer TEPAT sesuai nominal. Setelah transfer, klik tombol di bawah untuk konfirmasi."
                      : "Transfer the EXACT amount. After transfer, click button below to confirm."}
                  </p>
                </div>

                {/* Confirm Button → Telegram */}
                <a
                  href={`https://t.me/CryptoVisionIDbot?start=paid_${orderId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-success)] py-3.5 text-sm font-semibold text-white transition hover:bg-green-600 active:scale-[0.98]"
                >
                  <Send size={16} />
                  {locale === "id" ? "Sudah Bayar — Konfirmasi via Telegram" : "Already Paid — Confirm via Telegram"}
                  <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
