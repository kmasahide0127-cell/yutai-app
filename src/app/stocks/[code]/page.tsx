import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { YUTAI_LIST } from "@/lib/yutai-data";
import { getMatchingExpenseCategoriesForYutai, getRelatedYutai, EXPENSE_CATEGORY_SLUGS } from "@/lib/matching";
import { AppHeader } from "@/components/AppHeader";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export async function generateStaticParams() {
  return YUTAI_LIST.map((yutai) => ({ code: yutai.code }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const yutai = YUTAI_LIST.find((y) => y.code === code);
  if (!yutai) return { title: "銘柄が見つかりません" };

  const rightsStr = yutai.rightsMonths.map((m) => `${m}月`).join("・");
  const brandStr = yutai.brands.slice(0, 3).join("・");
  const description =
    `${yutai.name}(${yutai.code})の株主優待。` +
    `${brandStr ? brandStr + "など。" : ""}` +
    `年間優待価値${yutai.annualValue.toLocaleString()}円相当、権利確定月: ${rightsStr}。` +
    `${yutai.dataQuality === "verified" ? "検証済み銘柄。" : ""}` +
    `${yutai.description.slice(0, 60)}`;

  return {
    title: `${yutai.name}(${yutai.code}) 株主優待 | 優待マッチ`,
    description,
    alternates: { canonical: `/stocks/${yutai.code}` },
    openGraph: {
      title: `${yutai.name}(${yutai.code}) - 株主優待情報 | 優待マッチ`,
      description,
      url: `${siteConfig.url}/stocks/${yutai.code}`,
      type: "article",
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: `${yutai.name} 株主優待` }],
    },
    twitter: {
      card: "summary",
      title: `${yutai.name}(${yutai.code}) 株主優待`,
      description,
    },
  };
}

function formatYen(amount: number): string {
  return `${amount.toLocaleString()}円`;
}
function formatMonths(months: number[]): string {
  if (!months || months.length === 0) return "未定";
  return months.map((m) => `${m}月`).join("・");
}

export default async function StockDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const yutai = YUTAI_LIST.find((y) => y.code === code);
  if (!yutai) notFound();
  if (yutai.annualValue <= 0) notFound();

  const matchingExpenseCategories = getMatchingExpenseCategoriesForYutai(yutai);
  const relatedYutai = getRelatedYutai(yutai, YUTAI_LIST);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${yutai.name}(${yutai.code}) の株主優待情報`,
    description: yutai.description,
    author: {
      "@type": "Organization",
      name: "優待マッチ",
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      name: "優待マッチ",
      url: siteConfig.url,
    },
    datePublished: yutai.lastVerified,
    dateModified: yutai.lastVerified,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/stocks/${yutai.code}`,
    },
    inLanguage: "ja-JP",
    about: {
      "@type": "Corporation",
      name: yutai.name,
      tickerSymbol: yutai.code,
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-2xl min-w-0 space-y-6 px-4 py-8">

        {/* パンくず */}
        <nav className="text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">トップ</Link>
          <span className="mx-2">›</span>
          <Link href="/stocks" className="hover:underline">銘柄一覧</Link>
          <span className="mx-2">›</span>
          <span>{yutai.name}</span>
        </nav>

        {/* 銘柄ヘッダー */}
        <header className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{yutai.name}</h1>
            <span className="text-sm text-muted-foreground tabular-nums">({yutai.code})</span>
            {yutai.dataQuality === "verified" ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium">
                ✓ 検証済み
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-medium">
                ⚠ 参考情報
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">株主優待の詳細情報と該当する出費カテゴリ</p>
        </header>

        {/* 数値サマリー */}
        <section className="rounded-xl border-2 border-primary bg-primary/5 p-5" aria-label="優待概要">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-muted-foreground mb-1">年間優待価値</p>
              <p className="text-lg font-bold tabular-nums">{formatYen(yutai.annualValue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">必要投資額（目安）</p>
              <p className="text-lg font-bold tabular-nums">{formatYen(yutai.approxInvestment)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">優待利回り</p>
              <p className="text-lg font-bold tabular-nums">{yutai.yieldPercent}%</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-primary/20 text-xs text-muted-foreground text-center">
            最低 {yutai.minShares}株 / 権利確定月: {formatMonths(yutai.rightsMonths)}
          </div>
        </section>

        {/* 優待内容 */}
        <section className="space-y-2" aria-labelledby="yutai-detail-heading">
          <h2 id="yutai-detail-heading" className="text-base font-bold">優待内容</h2>
          <p className="text-sm leading-relaxed">{yutai.description}</p>
          <div className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/40 space-y-1">
            <p>・優待内容は変更・廃止される場合があります。最新情報は各企業のIRページでご確認ください。</p>
            <p>・本ページの情報は投資勧誘ではありません。投資判断はご自身の責任でお願いします。</p>
          </div>
        </section>

        {/* 権利確定月 */}
        <section className="space-y-2" aria-labelledby="rights-months-heading">
          <h2 id="rights-months-heading" className="text-base font-bold">権利確定月</h2>
          <div className="flex flex-wrap gap-2">
            {yutai.rightsMonths.map((m) => (
              <span
                key={m}
                className="inline-flex items-center px-3 py-1.5 rounded-lg border border-border bg-card text-sm font-medium"
              >
                {m}月末
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            権利確定月の最終営業日時点で{yutai.minShares}株以上保有している場合に優待を受け取れます（参考情報）。
          </p>
        </section>

        {/* 関連ブランド */}
        {yutai.brands && yutai.brands.length > 0 && (
          <section className="space-y-2" aria-labelledby="brands-heading">
            <h2 id="brands-heading" className="text-base font-bold">関連ブランド・サービス</h2>
            <div className="flex flex-wrap gap-1.5">
              {yutai.brands.map((brand) => (
                <span key={brand} className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted text-xs">
                  {brand}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 対応出費カテゴリ */}
        {matchingExpenseCategories.length > 0 && (
          <section className="space-y-2" aria-labelledby="expense-cats-heading">
            <h2 id="expense-cats-heading" className="text-base font-bold">この優待で削減できる出費</h2>
            <div className="flex flex-wrap gap-2">
              {matchingExpenseCategories.map((expense) => {
                const slug = EXPENSE_CATEGORY_SLUGS[expense];
                return slug ? (
                  <Link
                    key={expense}
                    href={`/expense/${slug}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-xs font-medium hover:bg-primary/20 transition-colors"
                  >
                    {expense}
                  </Link>
                ) : (
                  <span key={expense} className="inline-flex items-center px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-xs font-medium">
                    {expense}
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="rounded-xl border-2 border-primary bg-primary text-primary-foreground p-5 text-center space-y-3">
          <h2 className="text-lg font-bold">あなたにこの優待は合う?</h2>
          <p className="text-sm opacity-90">生活スタイルから、あなたに本当に合う優待を診断します（無料・1分）</p>
          <Link href="/onboarding" className={buttonVariants({ size: "lg", variant: "secondary" })}>
            無料で診断する
          </Link>
        </section>

        {/* 関連銘柄 */}
        {relatedYutai.length > 0 && (
          <section className="space-y-3" aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-base font-bold">関連する優待銘柄</h2>
            <div className="space-y-2">
              {relatedYutai.map((related) => (
                <Link
                  key={related.id}
                  href={`/stocks/${related.code}`}
                  className="block rounded-lg border border-border bg-card p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{related.name}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        年間 {formatYen(related.annualValue)} / 権利確定: {formatMonths(related.rightsMonths)}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums shrink-0">{related.code}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 掲載データ情報 */}
        <section className="pt-4 border-t border-border text-xs text-muted-foreground space-y-1" aria-label="掲載データ情報">
          <p>※ 優待情報取得日: {yutai.lastVerified} /
            {yutai.dataQuality === "verified" ? " 検証済み銘柄" : " 参考情報（未検証）"}
          </p>
          <p>
            ※ 最新の優待内容は
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(yutai.name + " 株主優待 IR")}`}
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              企業IRページ等
            </a>
            で必ずご確認ください。
          </p>
          <p>※ 本サイトの情報は投資勧誘ではありません。投資判断はご自身の責任でお願いします。</p>
        </section>

        <Link href="/stocks" className="inline-flex text-sm text-primary hover:underline">
          ← 銘柄一覧に戻る
        </Link>
      </div>
    </div>
  );
}
