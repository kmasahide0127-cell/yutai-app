import { Suspense } from "react";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { AppHeader } from "@/components/AppHeader";
import { AdSenseScript } from "@/components/common/AdSenseScript";
import { StocksListFromQuery, StocksListView } from "@/components/stocks/StocksListView";

export const metadata: Metadata = buildPageMetadata({
  title: "株主優待 全銘柄一覧",
  description:
    "優待マッチが収録している全銘柄の一覧。生活費削減に使える株主優待を全件閲覧できます。カテゴリで絞り込んで探すこともできます。",
  path: "/stocks",
});

// ページは静的に生成し、?expense= / ?month= / ?category= の絞り込みはブラウザで行う
// (クエリの組み合わせごとにサーバーでページを作らず、Vercel の Fast Origin Transfer を抑えるため)。
// 静的 HTML(Suspense の fallback)には絞り込みなしの全件一覧が入り、検索エンジンにもそれが読まれる。
export default function StocksListPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <AdSenseScript />
      <Suspense fallback={<StocksListView query={{ category: null, expense: null, month: null }} />}>
        <StocksListFromQuery />
      </Suspense>
    </div>
  );
}
