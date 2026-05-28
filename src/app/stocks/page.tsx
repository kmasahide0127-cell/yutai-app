import type { Metadata } from "next";
import Link from "next/link";
import { YUTAI_LIST } from "@/lib/yutai-data";
import { AppHeader } from "@/components/AppHeader";

export const metadata: Metadata = {
  title: "全銘柄一覧 - 優待アプリ",
  description: "優待アプリで提供している全銘柄の一覧。生活費削減に使える株主優待を全件閲覧できます。",
  alternates: { canonical: "/stocks" },
};

function formatYen(amount: number): string {
  return `${amount.toLocaleString()}円`;
}

export default function StocksListPage() {
  const validYutai = YUTAI_LIST.filter((y) => y.annualValue > 0).sort(
    (a, b) => b.annualValue - a.annualValue
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
          <h1 className="text-2xl font-bold">全銘柄一覧</h1>
          <p className="text-sm text-muted-foreground">{validYutai.length}銘柄(年間優待価値の高い順)</p>
        </header>
        <p className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/50">
          💡 各銘柄をタップすると詳細ページが開きます。あなたに合う優待は<Link href="/onboarding" className="underline font-medium">診断</Link>で見つかります。
        </p>
        <div className="space-y-2">
          {validYutai.map((yutai) => (
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
