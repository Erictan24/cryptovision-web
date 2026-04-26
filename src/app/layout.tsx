import type { Metadata } from "next";
import { LanguageProvider } from "@/components/LanguageProvider";
import { AuthProvider } from "@/components/AuthProvider";
import ContactFloat from "@/components/ContactFloat";
import "./globals.css";

export const metadata: Metadata = {
  title: "CryptoVision — Auto Trading Bot Crypto",
  description:
    "Bot scalping & swing trading crypto otomatis 24/7. Win rate 60%+. Mulai dari gratis.",
  keywords: ["crypto", "trading bot", "scalping", "swing trading", "bitcoin", "auto trade"],
  openGraph: {
    title: "CryptoVision — Auto Trading Bot Crypto",
    description: "Bot scalping & swing trading crypto otomatis 24/7. Win rate 60%+.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <LanguageProvider>
          <AuthProvider>
            {children}
            <ContactFloat />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
