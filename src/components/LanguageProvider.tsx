"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { Locale, Messages } from "@/lib/i18n";
import { getMessages } from "@/lib/i18n";

type LangContext = {
  locale: Locale;
  t: Messages;
  toggle: () => void;
};

const Ctx = createContext<LangContext | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("id");
  const toggle = useCallback(
    () => setLocale((l) => (l === "id" ? "en" : "id")),
    [],
  );
  const t = getMessages(locale);

  return <Ctx value={{ locale, t, toggle }}>{children}</Ctx>;
}

export function useLang() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang must be inside LanguageProvider");
  return ctx;
}
