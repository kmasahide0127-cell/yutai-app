import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { YUTAI_LIST, DATA_LAST_UPDATED, isAnnualizedYutai, isVerifiedYutai } from "@/lib/yutai-data";
import {
  EXPENSE_CATEGORY_SLUGS,
  buildExpenseCategoryFacts,
  describePeakMonths,
  getExpenseCategoryBySlug,
  getYutaiForExpenseCategory,
} from "@/lib/matching";
import { formatOneTimeBenefits } from "@/lib/product-search";
import { AppHeader } from "@/components/AppHeader";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import AdUnit from "@/components/common/AdUnit";
import AffiliateBanner from "@/components/AffiliateBanner";
import { serializeJsonLd } from "@/lib/utils";

export async function generateStaticParams() {
  return Object.values(EXPENSE_CATEGORY_SLUGS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const expense = getExpenseCategoryBySlug(slug);
  if (!expense) return { title: "カテゴリが見つかりません" };

  const facts = buildExpenseCategoryFacts(expense, YUTAI_LIST);
  const peak = describePeakMonths(facts);
  const description =
    `${expense}に使える株主優待${facts.stockCount}銘柄の一覧。` +
    `${peak ? `権利確定月は${peak}。` : ""}` +
    `このカテゴリだけで最大${facts.coverableMonthCount}ヶ月をカバー。`;

  return {
    title: `${expense}に使える株主優待`,
    description,
    alternates: { canonical: `/expense/${slug}` },
    openGraph: {
      title: `${expense}に使える株主優待`,
      description,
      url: `${siteConfig.url}/expense/${slug}`,
      type: "article",
    },
    twitter: { card: "summary", title: `${expense}に使える株主優待`, description },
  };
}

function formatYen(amount: number): string {
  return `${amount.toLocaleString()}円`;
}
function formatJapaneseDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${y}年${Number(m)}月${Number(d)}日`;
}
function formatMonths(months: number[]): string {
  if (!months || months.length === 0) return "未定";
  return months.map((m) => `${m}月`).join("・");
}

export default async function ExpenseCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const expense = getExpenseCategoryBySlug(slug);
  if (!expense) notFound();

  // 全銘柄取得（上限を YUTAI_LIST.length に設定）
  const allYutai = getYutaiForExpenseCategory(expense, YUTAI_LIST, YUTAI_LIST.length);
  const topYutai = allYutai.slice(0, 5);
  const facts = buildExpenseCategoryFacts(expense, YUTAI_LIST);
  const peakText = describePeakMonths(facts);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${expense}に使える株主優待`,
    description: `${expense}の出費を削減できる株主優待の一覧。${allYutai.length}銘柄掲載。`,
    inLanguage: "ja-JP",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <div className="mx-auto max-w-2xl min-w-0 space-y-8 px-4 py-8">

        {/* パンくず */}
        <nav className="text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">トップ</Link>
          <span className="mx-2">›</span>
          <span>{expense}の優待</span>
        </nav>

        {/* ヘッダー */}
        <header className="space-y-2">
          <h1 className="text-2xl font-bold">{expense}に使える株主優待</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {expense}に活用できる優待銘柄を年間優待価値の高い順に掲載しています（{allYutai.length}銘柄）。
          </p>
        </header>

        {/* 権利確定月の分布(掲載データから自動算出。数値はハードコードしない) */}
        {facts.stockCount > 0 && (
          <section className="space-y-3 text-sm leading-relaxed" aria-labelledby="facts-heading">
            <h2 id="facts-heading" className="font-bold text-base text-foreground">権利確定月の分布</h2>
            <ul className="space-y-1.5 text-muted-foreground">
              {peakText && <li>・{peakText}</li>}
              <li>
                ・このカテゴリの銘柄だけで権利確定月をカバーできるのは最大
                <strong className="text-foreground">{facts.coverableMonthCount}ヶ月</strong>
              </li>
            </ul>
            <div className="grid grid-cols-6 gap-1.5" role="list" aria-label="月別の権利確定銘柄数">
              {facts.monthCounts.map((count, i) => (
                <div
                  key={i}
                  role="listitem"
                  className={
                    count > 0
                      ? "rounded-md border border-primary/30 bg-primary/10 py-1.5 text-center"
                      : "rounded-md border border-dashed border-border py-1.5 text-center text-muted-foreground"
                  }
                >
                  <p className="text-[10px]">{i + 1}月</p>
                  <p className="text-sm font-bold tabular-nums">{count}</p>
                </div>
              ))}
            </div>
            {facts.emptyMonths.length > 0 && (
              <div className="rounded-lg bg-muted/50 p-4 space-y-1.5">
                <p className="font-medium text-xs text-muted-foreground">
                  該当銘柄がない月と、その月をカバーできる他の出費カテゴリ
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {facts.emptyMonths.map(({ month, alternatives }) => (
                    <li key={month}>
                      <span className="font-medium text-foreground">{month}月</span>:{" "}
                      {alternatives.length > 0
                        ? alternatives.map((alt, idx) => (
                            <span key={alt.expense}>
                              {idx > 0 && "、"}
                              <Link href={`/expense/${EXPENSE_CATEGORY_SLUGS[alt.expense]}`} className="underline">
                                {alt.expense}
                              </Link>
                              ({alt.count}銘柄)
                            </span>
                          ))
                        : "他カテゴリにも該当銘柄なし"}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              当サイト掲載の優待実施中銘柄から算出しています(複数月に権利確定する銘柄は各月で数えています)。
            </p>
          </section>
        )}

        {/* 代表的な優待銘柄 */}
        {topYutai.length > 0 && (
          <section className="space-y-3" aria-labelledby="top-stocks-heading">
            <h2 id="top-stocks-heading" className="font-bold text-base text-foreground">
              代表的な優待銘柄（上位{topYutai.length}銘柄）
            </h2>
            <div className="space-y-2">
              {topYutai.map((yutai, idx) => (
                <Link
                  key={yutai.id}
                  href={`/stocks/${yutai.code}`}
                  className="block rounded-xl border border-border bg-card p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">{yutai.name}</p>
                        <span className="text-xs text-muted-foreground tabular-nums">({yutai.code})</span>
                        {isVerifiedYutai(yutai) && (
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded-md">
                            ✓ 検証済み
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isAnnualizedYutai(yutai)
                          ? `年間 ${formatYen(yutai.annualValue)}`
                          : formatOneTimeBenefits(yutai)}{" "}
                        / 権利確定: {formatMonths(yutai.rightsMonths)}
                      </p>
                      {yutai.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{yutai.description}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="rounded-xl border-2 border-primary bg-primary text-primary-foreground p-5 text-center space-y-3">
          <h2 className="text-lg font-bold">あなたにぴったりの優待を診断</h2>
          <p className="text-sm opacity-90">
            {expense}を含む、あなたの生活全体から最適な優待を無料で診断します（1分）
          </p>
          <Link href="/onboarding" className={buttonVariants({ size: "lg", variant: "secondary" })}>
            無料で診断する
          </Link>
        </section>

        <AdUnit format="horizontal" className="my-2" />

        {/* 全銘柄一覧 */}
        {allYutai.length > 0 ? (
          <section className="space-y-3" aria-labelledby="all-stocks-heading">
            <h2 id="all-stocks-heading" className="font-bold text-base text-foreground">
              {expense}の全優待銘柄一覧（{allYutai.length}銘柄）
            </h2>
            <div className="space-y-1.5">
              {allYutai.map((yutai) => (
                <Link
                  key={yutai.id}
                  href={`/stocks/${yutai.code}`}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors min-w-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-medium truncate">{yutai.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatMonths(yutai.rightsMonths)}確定 ·{" "}
                      {isAnnualizedYutai(yutai) ? `年${formatYen(yutai.annualValue)}` : formatOneTimeBenefits(yutai)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isVerifiedYutai(yutai) ? (
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded-md hidden sm:inline">
                        ✓ 検証済み
                      </span>
                    ) : (
                      <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded-md hidden sm:inline">
                        ⚠ 参考
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground tabular-nums">{yutai.code}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <section className="rounded-lg border border-border bg-muted/30 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              現在、{expense}に該当する優待銘柄は準備中です。
              <Link href="/onboarding" className="underline font-medium">診断</Link>で他のカテゴリも試してみてください。
            </p>
          </section>
        )}

        {/* アフィリエイトバナー */}
        <section className="space-y-2" aria-label="証券口座のご案内">
          <h2 className="font-bold text-base text-foreground">証券口座をお持ちでない方へ</h2>
          <AffiliateBanner />
        </section>

        {/* 他カテゴリ */}
        <section className="space-y-3 pt-4 border-t border-border">
          <h2 className="font-bold text-base text-foreground">他の出費カテゴリも見る</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(EXPENSE_CATEGORY_SLUGS)
              .filter(([cat]) => cat !== expense)
              .map(([cat, s]) => (
                <Link
                  key={s}
                  href={`/expense/${s}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg border border-border bg-card text-xs hover:bg-muted/50 transition-colors"
                >
                  {cat}
                </Link>
              ))}
          </div>
        </section>

        {/* 免責 */}
        <section className="pt-4 border-t border-border text-xs text-muted-foreground space-y-1">
          <p>※ 優待情報は{formatJapaneseDate(DATA_LAST_UPDATED)}時点のものです。最新情報は各企業のIRページでご確認ください。</p>
          <p>※ 本サイトの情報は投資勧誘ではありません。投資判断はご自身の責任でお願いします。</p>
        </section>
      </div>
    </div>
  );
}
