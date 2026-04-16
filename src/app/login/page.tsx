"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useLang } from "@/components/LanguageProvider";
import TelegramLogin from "@/components/TelegramLogin";
import { ArrowLeft, Shield } from "lucide-react";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const { locale } = useLang();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      window.location.href = "/dashboard";
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="pointer-events-none absolute inset-0 gradient-hero" />

      <div className="relative w-full max-w-sm">
        {/* Back link */}
        <a
          href="/"
          className="mb-8 inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] transition hover:text-[var(--color-accent-light)]"
        >
          <ArrowLeft size={14} />
          {locale === "id" ? "Kembali" : "Back"}
        </a>

        {/* Card */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-8">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <img src="/logo.jpg" alt="CryptoVision" className="h-12 w-12 rounded-xl object-cover" />
            <h1 className="text-xl font-bold">
              {locale === "id" ? "Masuk ke CryptoVision" : "Login to CryptoVision"}
            </h1>
            <p className="text-center text-sm text-[var(--color-text-muted)]">
              {locale === "id"
                ? "Login dengan akun Telegram kamu"
                : "Login with your Telegram account"}
            </p>
          </div>

          {/* Telegram Login */}
          <TelegramLogin />

          {/* Security note */}
          <div className="mt-6 flex items-start gap-2 rounded-lg bg-[var(--color-bg-primary)] p-3">
            <Shield size={14} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
            <p className="text-xs text-[var(--color-text-muted)]">
              {locale === "id"
                ? "Kami tidak menyimpan password. Login aman via Telegram OAuth."
                : "We don't store passwords. Secure login via Telegram OAuth."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
