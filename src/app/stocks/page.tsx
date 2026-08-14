import type { Metadata } from "next";
import Link from "next/link";
import { YUTAI_LIST } from "@/lib/yutai-data";
import {
  countYutaiByCategory,
  filterYutaiByStockListFilter,
  GIFT_CARD_FILTER_KEY,
  type StockListFilter,
} from "@/lib/matching";
import { AppHeader } from "@/components/AppHeader";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "全銘柄一覧 - 優待アプリ",
  description: "優待アプリで提供している全銘柄の一覧。生活費削減に使える株主優待を全件閲覧できます。カテゴリで絞り込んで探すこともできます。",
  alternates: { canonical: "/stocks" },
};

function formatYen(amount: number): string {
  return `${amount.toLocaleString()}円`;
}

type SearchParams = Promise<{ category?: string }>;

export default async function StocksListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category } = await searchParams;
  const activeFilter: StockListFilter | null = category ?? null;

  const validYutai = YUTAI_LIST.filter((y) => y.annualValue > 0).sort(
    (a, b) => b.annualValue - a.annualValue
  );

  const categoryCounts = countYutaiByCategory(validYutai);
  const giftCardCount = filterYutaiByStockListFilter(validYutai, GIFT_CARD_FILTER_KEY).length;

  const displayedYutai = filterYutaiByStockListFilter(validYutai, activeFilter);

  const chipClass = (isActive: boolean) =>
    cn(
      "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
      isActive
        ? "border-primary bg-primary/10 text-primary"
        : "border-border text-muted-foreground hover:bg-muted/50"
    );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <div className="mx-auto max-w-2xl min-w-0 space-y-6 px-4 py-8">
        <nav className="text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">トップ</Link>
          <span className="mx-2">›</span>
          <span>銘柄一覧</span>
        </nav>
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">株主優待 全銘柄一覧</h1>
          <p className="text-sm text-muted-foreground">
            {activeFilter
              ? `${displayedYutai.length}銘柄(絞り込み中・全${validYutai.length}銘柄中)`
              : `${validYutai.length}銘柄(年間優待価値の高い順)`}
          </p>
        </header>

        <section className="text-sm leading-relaxed text-muted-foreground space-y-3 p-4 rounded-xl border border-border bg-card">
          <p>
            本ページでは、優待マッチが収録する株主優待銘柄の一覧を掲載しています。
            年間の優待価値が高い順に並べており、各銘柄の詳細ページでは優待内容・必要投資額・
            優待利回り・権利確定月などを確認できます。
          </p>
          <p>
            銘柄ごとの詳細ページでは、その優待がどの出費カテゴリ(外食・通信費・交通費など)に
            対応するかも表示しています。あなたの生活費に合わせた優待選びの参考にご活用ください。
          </p>
          <p className="text-xs">
            ※ 本サービスは情報提供のみを目的としており、投資助言・投資勧誘にはあたりません。
            優待情報は変更・廃止される場合があります。最新情報は各企業のIRページでご確認ください。
            投資判断はご自身の責任でお願いします。
          </p>
        </section>

        <p className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/50">
          💡 各銘柄をタップすると詳細ページが開きます。あなたに合う優待は<Link href="/onboarding" className="underline font-medium">診断</Link>で見つかります。
        </p>

        {/* ── カテゴリ絞り込み(「お酒だけ」「クオカードだけ」等、ジャンルを絞って探したい人向け) ── */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">ジャンルで絞り込む</p>
          <div className="flex flex-wrap gap-1.5">
            <Link href="/stocks" className={chipClass(activeFilter === null)}>
              すべて({validYutai.length})
            </Link>
            <Link
              href={`/stocks?category=${GIFT_CARD_FILTER_KEY}`}
              className={chipClass(activeFilter === GIFT_CARD_FILTER_KEY)}
            >
              🎫 クオカード等の金券({giftCardCount})
            </Link>
            {categoryCounts.map(({ category: c, count }) => (
              <Link
                key={c}
                href={`/stocks?category=${encodeURIComponent(c)}`}
                className={chipClass(activeFilter === c)}
              >
                {c}({count})
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {displayedYutai.length === 0 && (
            <p className="rounded-lg border border-border bg-card p-4 text-center text-sm text-muted-foreground">
              このジャンルに該当する銘柄は現状ありません
            </p>
          )}
          {displayedYutai.map((yutai) => (
            <Link key={yutai.id} href={`/stocks/${yutai.code}`} className="block rounded-lg border border-border bg-card p-3 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{yutai.name}</p>
                    <span className="text-xs text-muted-foreground tabular-nums shrink-0">({yutai.code})</span>
                  </div>
                  <p className="text-xs text-muted-foreground tabular-nums mt-0.5">年間 {formatYen(yutai.annualValue)} / 利回り {yutai.yieldPercent}%</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
