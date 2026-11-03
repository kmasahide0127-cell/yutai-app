import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { YUTAI_LIST, hasActiveYutai, isAnnualizedYutai } from "@/lib/yutai-data";
import {
  describeCalendarPosition,
  getMatchingExpenseCategoriesForYutai,
  getRelatedYutai,
  EXPENSE_CATEGORY_SLUGS,
} from "@/lib/matching";
import {
  estimateFirstReceipt,
  formatOneTimeBenefits,
  getAbolishedNotice,
  getHoldingRequirementNotice,
  isAbolished,
} from "@/lib/product-search";
import { AppHeader } from "@/components/AppHeader";
import { FirstReceiptNote } from "@/components/search/StockResultCard";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import AdUnit from "@/components/common/AdUnit";
import AffiliateBanner from "@/components/AffiliateBanner";
import { serializeJsonLd } from "@/lib/utils";

export async function generateStaticParams() {
  return YUTAI_LIST.filter((y) => hasActiveYutai(y) || isAbolished(y)).map((yutai) => ({
    code: yutai.code,
  }));
}

// 「初回受取見込み」は今日の日付に依存する(権利付最終日を過ぎると1サイクル先にずれる)。
// 週次のデータ更新ビルドだけに任せると最大1週間ずれるため、12時間ごとに再生成する。
export const revalidate = 43200;

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
  const abolished = isAbolished(yutai);
  const oneTimeText = formatOneTimeBenefits(yutai);
  const valueText = isAnnualizedYutai(yutai)
    ? `年間優待価値${yutai.annualValue.toLocaleString()}円相当`
    : oneTimeText ?? "";
  const description = abolished
    ? `${yutai.name}(${yutai.code}): ${getAbolishedNotice(yutai)}。` +
      `${brandStr ? brandStr + "など。" : ""}${yutai.description.slice(0, 80)}`
    : `${yutai.name}(${yutai.code})の株主優待。` +
      `${brandStr ? brandStr + "など。" : ""}` +
      `${valueText}、権利確定月: ${rightsStr}。` +
      `${yutai.dataQuality === "verified" ? "検証済み銘柄。" : ""}` +
      `${yutai.description.slice(0, 60)}`;

  return {
    title: abolished
      ? `${yutai.name}(${yutai.code}) 株主優待【廃止済み】`
      : `${yutai.name}(${yutai.code}) 株主優待`,
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
  // 廃止銘柄は「2023年2月権利分をもって廃止」という事実を返す必要があるため、
  // 優待価値0でも 404 にしない。単に優待を実施していない銘柄のみ 404 とする。
  const abolished = isAbolished(yutai);
  const delisted = abolished && yutai.abolishedKind === "delisted";
  if (!hasActiveYutai(yutai) && !abolished) notFound();
  const annualized = isAnnualizedYutai(yutai);
  const oneTimeText = formatOneTimeBenefits(yutai);
  const holdingNotice = getHoldingRequirementNotice(yutai);
  // PR は検証済みの実施中銘柄だけに出す(参考情報・廃止銘柄のページで口座開設を促さない)
  const showPr = !abolished && yutai.dataQuality === "verified";

  const abolishedNotice = getAbolishedNotice(yutai);
  const firstReceipt = estimateFirstReceipt(yutai);
  const matchingExpenseCategories = getMatchingExpenseCategoriesForYutai(yutai);
  const relatedYutai = getRelatedYutai(yutai, YUTAI_LIST);
  const calendarPosition = abolished ? null : describeCalendarPosition(yutai, YUTAI_LIST);

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
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
            {abolished && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium">
                {delisted ? "上場廃止" : "優待廃止"}
              </span>
            )}
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
          <p className="text-sm text-muted-foreground">
            {abolished
              ? delisted
                ? "上場廃止となった銘柄です。過去の優待内容を記録として掲載しています。"
                : "株主優待制度は廃止されています。過去の制度内容を記録として掲載しています。"
              : "株主優待の詳細情報と該当する出費カテゴリ"}
          </p>
        </header>

        {/* 廃止済み銘柄: 非表示にせず「いつの権利分で終わったか」を明示する */}
        {abolished && (
          <section
            className="rounded-xl border border-dashed border-border bg-muted/40 p-4 space-y-1"
            aria-label="株主優待の廃止について"
          >
            <p className="text-sm font-bold">{abolishedNotice}</p>
            {yutai.abolishedNote && (
              <p className="text-sm text-muted-foreground">{yutai.abolishedNote}</p>
            )}
            {!delisted && (
              <p className="text-xs text-muted-foreground pt-1">
                現在この銘柄で優待を受け取ることはできません。制度が再開される場合もあるため、
                最新情報は企業のIRページでご確認ください。
              </p>
            )}
          </section>
        )}

        {/* 数値サマリー(廃止銘柄では「年間0円」の表示が誤解を招くため出さない) */}
        {!abolished && (
          <section className="rounded-xl border-2 border-primary bg-primary/5 p-5" aria-label="優待概要">
            {annualized ? (
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
            ) : (
              // 単発優待: 毎年もらえないため年換算・利回りを出さない
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">優待(単発・毎年ではありません)</p>
                  <p className="text-sm font-bold">{oneTimeText}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">必要投資額（目安）</p>
                  <p className="text-lg font-bold tabular-nums">{formatYen(yutai.approxInvestment)}</p>
                </div>
                <p className="col-span-2 text-xs text-muted-foreground">
                  継続保有の到達時に1回ずつ受け取る優待のため、年間優待価値・優待利回りは算出していません。
                </p>
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-primary/20 text-xs text-muted-foreground text-center space-y-0.5">
              <p>
                最低 {yutai.minShares}株 / 権利確定月: {formatMonths(yutai.rightsMonths)}
                {yutai.holdingRequirement ? ` / ${yutai.holdingRequirement}の継続保有が条件` : ""}
              </p>
              {/* 必要投資額・利回りの株価基準日。記録がない場合は日付を作らず「未記録」と出す */}
              <p>
                株価基準日: {yutai.priceUpdatedAt ?? "未記録"}(必要投資額 = 株価 × {yutai.minShares}株)
              </p>
            </div>
          </section>
        )}

        {/* 取得可能最短日: 今から買った場合に初回の優待を受け取れる見込み時期 */}
        {firstReceipt && (
          <section
            className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2"
            aria-labelledby="first-receipt-heading"
          >
            <h2 id="first-receipt-heading" className="text-base font-bold">
              今から購入した場合の初回受取見込み
            </h2>
            <FirstReceiptNote estimate={firstReceipt} yutai={yutai} />
            <p className="text-xs text-muted-foreground">
              基準日の月末と権利付最終日(基準日の2営業日前)をもとにした概算で、祝日の並びは考慮していません。
              優待の発送・付与時期は企業ごとに異なります。参考情報としてご利用ください。
            </p>
          </section>
        )}

        {!firstReceipt && holdingNotice && (
          <section className="rounded-xl border border-border bg-muted/30 p-4 space-y-1" aria-label="初回受取見込み">
            <h2 className="text-base font-bold">今から購入した場合の初回受取見込み</h2>
            <p className="text-xs text-muted-foreground">{holdingNotice}</p>
          </section>
        )}

        {/* 優待内容 */}
        <section className="space-y-2" aria-labelledby="yutai-detail-heading">
          <h2 id="yutai-detail-heading" className="text-base font-bold">優待内容</h2>
          <p className="text-sm leading-relaxed">{yutai.description}</p>
        </section>

        {/* 権利確定月 */}
        <section className="space-y-2" aria-labelledby="rights-months-heading">
          <h2 id="rights-months-heading" className="text-base font-bold">
            {abolished ? "過去の権利確定月" : "権利確定月"}
          </h2>
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
            {abolished
              ? `制度が実施されていた当時の権利確定月です。現在この基準日で優待を受け取ることはできません（参考情報）。`
              : yutai.holdingRequirement
                ? `権利確定月の最終営業日時点で${yutai.minShares}株以上を保有し、${yutai.holdingRequirement}の継続保有条件を満たしている場合に優待を受け取れます（参考情報）。`
                : `権利確定月の最終営業日時点で${yutai.minShares}株以上保有している場合に優待を受け取れます（参考情報）。`}
          </p>
        </section>

        {/* カレンダー上の位置(掲載データから自動算出) */}
        {calendarPosition && (
          <section className="space-y-1" aria-labelledby="calendar-position-heading">
            <h2 id="calendar-position-heading" className="text-base font-bold">カレンダー上の位置</h2>
            <p className="text-sm leading-relaxed">{calendarPosition}</p>
            <p className="text-xs text-muted-foreground">
              当サイト掲載銘柄のうち、優待を実施中の銘柄を数えた結果です。
            </p>
          </section>
        )}

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
        {!abolished && matchingExpenseCategories.length > 0 && (
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
          <h2 className="text-lg font-bold">
            {abolished ? "ほかの優待を探しますか?" : "あなたにこの優待は合う?"}
          </h2>
          <p className="text-sm opacity-90">
            {abolished
              ? "この優待は廃止されています。生活スタイルから、いま実施中の優待の候補を表示します（無料・1分）"
              : "生活スタイルから、あなたに本当に合う優待を診断します（無料・1分）"}
          </p>
          <Link href="/onboarding" className={buttonVariants({ size: "lg", variant: "secondary" })}>
            無料で診断する
          </Link>
        </section>

        <AdUnit format="horizontal" className="my-2" />

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
            {/* 確認元URLがある銘柄は実際のIRページへ。未入力の銘柄は検索リンクで代替する */}
            <a
              href={
                yutai.sourceUrl ??
                `https://www.google.com/search?q=${encodeURIComponent(yutai.name + " 株主優待 IR")}`
              }
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {yutai.sourceUrl ? "企業IRページ" : "企業IRページ等(検索)"}
            </a>
            で必ずご確認ください。
          </p>
          <p>
            ※ 本ページは参考情報であり、投資勧誘ではありません。優待内容は変更・廃止される場合があります。
            投資判断はご自身の責任でお願いします(<Link href="/terms" className="underline">利用規約</Link>)。
          </p>
        </section>

        {/* アフィリエイトバナー(1ページ1本・本文の後。参考情報・廃止銘柄には出さない) */}
        {showPr && (
          <section className="space-y-2" aria-label="証券口座のご案内">
            <h2 className="text-base font-bold">この銘柄を購入するには証券口座が必要です</h2>
            <AffiliateBanner />
          </section>
        )}

        <Link href="/stocks" className="inline-flex text-sm text-primary hover:underline">
          ← 銘柄一覧に戻る
        </Link>
      </div>
    </div>
  );
}
