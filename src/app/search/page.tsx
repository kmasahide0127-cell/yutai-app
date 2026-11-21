import { Suspense } from "react";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { AppHeader } from "@/components/AppHeader";
import { SearchGuide } from "@/components/search/SearchGuide";
import { SearchFromQuery, SearchView } from "@/components/search/SearchView";

// /search?q=… も canonical は /search に向ける(検索語ごとのページを別URLとして扱わせない)
export const metadata: Metadata = buildPageMetadata({
  title: "商品名から株主優待を逆引き検索",
  description:
    "ReFa・SIXPAD・ARグラスなど、欲しい商品やブランド名から該当する株主優待銘柄を逆引きします。非上場ブランドの場合は、その商品を買える小売の優待も参考として表示します。",
  path: "/search",
});

// ページは静的に生成し、?q= の検索はブラウザで行う
// (検索語ごとにサーバーでページを作らず、Vercel の Fast Origin Transfer を抑えるため)。
// 静的 HTML(Suspense の fallback)には検索前の画面が入る。
export default function SearchPage() {
  const guide = <SearchGuide />;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <Suspense fallback={<SearchView rawQuery="" guide={guide} />}>
        <SearchFromQuery guide={guide} />
      </Suspense>
    </div>
  );
}
