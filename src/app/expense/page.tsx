import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { AdSenseScript } from "@/components/common/AdSenseScript";
import { YUTAI_LIST, isVerifiedYutai } from "@/lib/yutai-data";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_SLUGS,
  buildExpenseCategoryFacts,
  describePeakMonths,
  expenseToYutaiMatch,
  getYutaiForExpenseCategory,
} from "@/lib/matching";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "出費カテゴリから株主優待を探す",
  description: `外食・通信費・交通費など${EXPENSE_CATEGORIES.length}の出費カテゴリごとに、使える株主優待の銘柄数と権利確定月でカバーできる月数を一覧にしています。`,
  path: "/expense",
});

export default function ExpenseIndexPage() {
  const rows = EXPENSE_CATEGORIES.map((expense) => {
    const facts = buildExpenseCategoryFacts(expense, YUTAI_LIST);
    const stocks = getYutaiForExpenseCategory(expense, YUTAI_LIST, YUTAI_LIST.length);
    const invs = stocks.map((y) => y.approxInvestment);
    return {
      ...facts,
      minInv: invs.length > 0 ? Math.min(...invs) : 0,
      verified: stocks.filter(isVerifiedYutai).length,
      holding: stocks.filter((y) => y.holdingRequirement).length,
      peakText: describePeakMonths(facts),
      genres: expenseToYutaiMatch[expense].categories,
    };
  });

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
            外食・通信費・交通費など{EXPENSE_CATEGORIES.length}の出費カテゴリごとに、掲載銘柄数と、そのカテゴリの銘柄だけで権利確定月をカバーできる最大月数をまとめています(掲載データから算出)。
          </p>
        </header>
        <section className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <p>
            出費カテゴリは、家計の支出項目ごとに「その出費に充てられる株主優待」をまとめた分類です。各銘柄の業種ジャンルと生活タグのどちらかが
            カテゴリの定義に一致すると、そのカテゴリの銘柄になります(<Link href="/method#expense" className="text-primary underline">対応付けのルール</Link>)。
            1つの銘柄が複数のカテゴリに入ることがあります。
          </p>
          <p>
            カテゴリのページでは、権利確定月の分布、選び方のポイント、権利確定月を分散させた組み合わせの一例、カテゴリ内の全銘柄を確認できます。
          </p>
        </section>
        <ul className="space-y-2">
          {rows.map((f) => (
            <li key={f.expense}>
              <Link prefetch={false}
                href={`/expense/${EXPENSE_CATEGORY_SLUGS[f.expense]}`}
                className="block rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/50"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">{f.expense}</span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {f.stockCount}銘柄 / 最大{f.coverableMonthCount}ヶ月
                  </span>
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  対象の業種ジャンル: {f.genres.join("・")}。
                  {f.peakText ? `${f.peakText}。` : ""}
                  最も少ない必要投資額は{f.minInv.toLocaleString()}円、継続保有が条件の銘柄は{f.holding}銘柄、検証済みは{f.verified}銘柄。
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          権利確定月を分散させる考え方は<Link href="/guide/calendar" className="underline">年間優待カレンダーの組み立て方</Link>で説明しています。
        </p>
        <p className="text-xs text-muted-foreground">
          ※ 参考情報であり、投資勧誘ではありません。投資判断はご自身の責任でお願いします
          (<Link href="/terms" className="underline">利用規約</Link>)。
        </p>
      </div>
    </div>
  );
}
