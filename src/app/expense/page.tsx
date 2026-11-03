import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { AdSenseScript } from "@/components/common/AdSenseScript";
import { YUTAI_LIST } from "@/lib/yutai-data";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_SLUGS,
  buildExpenseCategoryFacts,
} from "@/lib/matching";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "出費カテゴリから株主優待を探す",
  description: `外食・通信費・交通費など${EXPENSE_CATEGORIES.length}の出費カテゴリごとに、使える株主優待の銘柄数と権利確定月でカバーできる月数を一覧にしています。`,
  path: "/expense",
});

export default function ExpenseIndexPage() {
  const rows = EXPENSE_CATEGORIES.map((expense) => buildExpenseCategoryFacts(expense, YUTAI_LIST));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <AdSenseScript />
      <div className="mx-auto max-w-2xl min-w-0 space-y-6 px-4 py-8">
        <nav className="text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">トップ</Link>
          <span className="mx-2">›</span>
          <span>出費カテゴリ</span>
        </nav>
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">出費カテゴリから探す</h1>
          <p className="text-sm text-muted-foreground">
            カテゴリごとの掲載銘柄数と、そのカテゴリの銘柄だけで権利確定月をカバーできる最大月数です(掲載データから算出)。
          </p>
        </header>
        <ul className="space-y-2">
          {rows.map((f) => (
            <li key={f.expense}>
              <Link
                href={`/expense/${EXPENSE_CATEGORY_SLUGS[f.expense]}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/50"
              >
                <span className="text-sm font-medium">{f.expense}</span>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {f.stockCount}銘柄 / 最大{f.coverableMonthCount}ヶ月
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          ※ 参考情報であり、投資勧誘ではありません。投資判断はご自身の責任でお願いします
          (<Link href="/terms" className="underline">利用規約</Link>)。
        </p>
      </div>
    </div>
  );
}
