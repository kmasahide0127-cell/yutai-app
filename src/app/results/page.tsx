import { Suspense } from "react";
import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";
import { AdSenseScript } from "@/components/common/AdSenseScript";
import { ResultsFromQuery } from "@/components/results/ResultsFromQuery";
import { siteConfig } from "@/config/site";

// OG 画像はビルド時に生成した1枚(/api/og)を使う。ページを静的生成するため、
// 診断条件(クエリ)ごとに異なる画像 URL をメタデータへ入れることはできない。
const OG_IMAGE_URL = `${siteConfig.url}/api/og`;

export const metadata: Metadata = {
  title: "あなたにマッチする優待",
  description:
    "毎月の出費から、削減できる株主優待を提案。あなたのライフスタイルにぴったりの優待が見つかります。",
  alternates: { canonical: "/results" },
  robots: { index: false, follow: true },
  // 他ページ(buildPageMetadata)と同じく url 等を明示しないと、トップの og:url が継承される
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: siteConfig.name,
    url: `${siteConfig.url}/results`,
    title: "私の年間優待カレンダー | 優待マッチ",
    description: "毎月の出費から、削減できる株主優待を提案。",
    images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: "私の年間優待カレンダー" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "私の年間優待カレンダー | 優待マッチ",
    description: "毎月の出費から、削減できる株主優待を提案。",
    images: [OG_IMAGE_URL],
  },
};

// ページは静的に生成し、診断条件(クエリ)によるマッチングはブラウザで計算する
export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <AdSenseScript />
      <div className="mx-auto max-w-2xl min-w-0 space-y-6 px-4 py-8">
        <header>
          <h1 className="text-2xl font-bold">あなたの生活にマッチした優待</h1>
        </header>

        {/* 結果はクエリを読んでから描画する(静的 HTML には見出しまでを入れる) */}
        <Suspense fallback={null}>
          <ResultsFromQuery />
        </Suspense>
      </div>
    </div>
  );
}
