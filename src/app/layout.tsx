import type { Metadata } from "next";
import { LanguageProvider } from "@/components/LanguageProvider";
import { AuthProvider } from "@/components/AuthProvider";
import ContactFloat from "@/components/ContactFloat";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cryptovision-web.vercel.app";
const SITE_NAME = "CryptoVision";
const SITE_DESCRIPTION =
  "Bot trading crypto futures otomatis 24/7. Sinyal swing & scalp, dashboard real-time, transparansi performa lengkap.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Bot Trading Crypto Otomatis`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "bot trading crypto",
    "sinyal trading otomatis",
    "bot crypto Indonesia",
    "trading futures otomatis",
    "sinyal cryptocurrency",
    "swing trading bot",
    "scalp trading",
    "auto trade crypto",
    "trading bot Indonesia",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { email: false, telephone: false, address: false },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Bot Trading Crypto Otomatis`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.jpg",
        width: 640,
        height: 640,
        alt: `${SITE_NAME} — Crypto Signal & Education`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Bot Trading Crypto Otomatis`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/og-image.jpg",
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
