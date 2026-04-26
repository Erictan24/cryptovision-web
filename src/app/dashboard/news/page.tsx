"use client";

import MarketOverview from "@/components/MarketOverview";
import NewsSection from "@/components/NewsSection";

export default function NewsPage() {
  return (
    <div className="space-y-8">
      <MarketOverview />
      <NewsSection />
    </div>
  );
}
