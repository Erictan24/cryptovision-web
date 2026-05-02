/**
 * JSON-LD structured data untuk rich snippet di Google search results.
 * Schema.org Organization + WebSite + SoftwareApplication.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cryptovision-web.vercel.app";

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "CryptoVision",
  url: SITE_URL,
  logo: `${SITE_URL}/og-image.jpg`,
  sameAs: [
    "https://t.me/CryptoVisionID",
    "https://www.instagram.com/cryptovisionid",
    "https://www.tiktok.com/@cryptovisionid",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "ericisak453@gmail.com",
    contactType: "customer support",
    availableLanguage: ["Indonesian", "English"],
  },
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "CryptoVision",
  url: SITE_URL,
  description:
    "Bot trading crypto futures otomatis 24/7. Sinyal swing & scalp, dashboard real-time, transparansi performa lengkap.",
  inLanguage: "id-ID",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const softwareLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "CryptoVision Bot",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web, Telegram",
  description:
    "Bot trading crypto otomatis dengan sinyal swing dan scalp. Eksekusi 24/7 di akun exchange pengguna, dashboard real-time, riwayat performa transparan.",
  offers: {
    "@type": "Offer",
    priceCurrency: "IDR",
    availability: "https://schema.org/InStock",
  },
};

export default function StructuredData() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareLd) }}
      />
    </>
  );
}
