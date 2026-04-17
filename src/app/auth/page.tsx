"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Verifying login...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No login token found. Please try again from Telegram.");
      return;
    }

    // Verify token with API
    fetch(`/api/auth/token?token=${token}`)
      .then(async (res) => {
        if (res.ok) {
          setStatus("success");
          setMessage("Login successful! Redirecting...");
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1000);
        } else {
          const err = await res.json();
          setStatus("error");
          setMessage(err.error || "Login failed. Token may have expired.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Network error. Please try again.");
      });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="pointer-events-none absolute inset-0 gradient-hero" />

      <div className="relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-8 text-center max-w-sm w-full">
        <div className="mb-4 flex justify-center">
          {status === "loading" && (
            <Loader2
              size={40}
              className="animate-spin text-[var(--color-accent)]"
            />
          )}
          {status === "success" && (
            <CheckCircle size={40} className="text-[var(--color-success)]" />
          )}
          {status === "error" && (
            <XCircle size={40} className="text-[var(--color-danger)]" />
          )}
        </div>

        <p className="text-[var(--color-text-primary)] font-medium">
          {message}
        </p>

        {status === "error" && (
          <a
            href="/login"
            className="mt-4 inline-block rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-light)]"
          >
            Back to Login
          </a>
        )}
      </div>
    </div>
  );
}
