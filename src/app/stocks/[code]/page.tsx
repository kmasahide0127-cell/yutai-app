import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { YUTAI_LIST, formatPriceBasisDate, hasActiveYutai, isAnnualizedYutai, isVerifiedYutai } from "@/lib/yutai-data";
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
import { buildStockCommentary } from "@/lib/stock-commentary";
import {
  buildReceiptFlow,
  buildShareTiers,
  buildStockFaq,
  buildUsageForms,
  explainExpenseMatch,
  getCategoryAlternatives,
} from "@/lib/stock-guide";

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
    ? `年間優待価値${yutai.annualValue.toLocaleString()}円相当${yutai.annualValueIsEstimate ? "(当サイト試算)" : ""}`
    : oneTimeText ?? "";
  const description = abolished
    ? `${yutai.name}(${yutai.code}): ${getAbolishedNotice(yutai)}。` +
      `${brandStr ? brandStr + "など。" : ""}${yutai.description.slice(0, 80)}`
    : `${yutai.name}(${yutai.code})の株主優待。` +
      `${brandStr ? brandStr + "など。" : ""}` +
      `${valueText}、権利確定月: ${rightsStr}。` +
      `${isVerifiedYutai(yutai) ? "検証済み銘柄。" : ""}` +
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
  // PR は確認元(企業IR または 証券会社の優待ページ)で照合済みの実施中銘柄に出す。
  // どこでも照合できていない銘柄(sourceType 未設定)と廃止銘柄のページでは口座開設を促さない。
  const showPr = !abolished && yutai.sourceType !== undefined;

  const abolishedNotice = getAbolishedNotice(yutai);
  const firstReceipt = estimateFirstReceipt(yutai);
  const matchingExpenseCategories = getMatchingExpenseCategoriesForYutai(yutai);
  const relatedYutai = getRelatedYutai(yutai, YUTAI_LIST);
  const calendarPosition = abolished ? null : describeCalendarPosition(yutai, YUTAI_LIST);
  const commentary = buildStockCommentary(yutai, YUTAI_LIST);
  const shareTiers = buildShareTiers(yutai);
  const receiptFlow = buildReceiptFlow(yutai);
  const usageForms = buildUsageForms(yutai);
  const alternatives = getCategoryAlternatives(yutai, YUTAI_LIST);
  const faq = buildStockFaq(yutai, YUTAI_LIST);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

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
      {faq.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }} />
      )}
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
            {isVerifiedYutai(yutai) ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium">
                ✓ 検証済み
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-medium">
                ⚠ 参考情報
              </span>
            )}
            <span className="text-xs text-muted-foreground">{verificationLabel(yutai)}</span>
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
                {/* 公式に金額の記載がない優待は、年間価値・利回りが当サイトの試算であることを明示する */}
                {yutai.annualValueIsEstimate && (
                  <p className="col-span-3 text-xs text-muted-foreground">
                    年間価値は当サイトの換算ルールによる試算です（公式資料に金額の記載がない優待のため。
                    <Link href="/method#annual-value" className="text-primary underline">
                      算出方法
                    </Link>
                    ）
                  </p>
                )}
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
                株価基準日: {formatPriceBasisDate(yutai)}(必要投資額 = 株価 × {yutai.minShares}株)
                {" "}
                <Link href="/method#yield" className="underline">算出方法</Link>
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
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-lg border border-border bg-card p-3 text-xs">
            <dt className="text-muted-foreground">必要株数</dt>
            <dd>{yutai.minShares.toLocaleString()}株以上{abolished ? "(制度があった当時)" : ""}</dd>
            <dt className="text-muted-foreground">権利確定月</dt>
            <dd>{formatMonths(yutai.rightsMonths)}(年{yutai.rightsMonths.length}回)</dd>
            <dt className="text-muted-foreground">継続保有条件</dt>
            <dd>
              {yutai.holdingRequirement
                ? `${yutai.holdingRequirement}${yutai.requiredConsecutiveRecords ? `(${formatMonths(yutai.recordMonths ?? yutai.rightsMonths)}末の名簿に連続${yutai.requiredConsecutiveRecords}回記録)` : "(判定方法は未確認)"}`
                : "なし(掲載データ時点)"}
            </dd>
            <dt className="text-muted-foreground">確認元</dt>
            <dd>{verificationLabel(yutai)}</dd>
          </dl>
        </section>

        {/* 株数ティア一覧: 説明文に書かれた株数ごとの内容と、同じ株価で換算した必要投資額 */}
        {shareTiers.length > 0 && (
          <section className="space-y-2" aria-labelledby="tiers-heading">
            <h2 id="tiers-heading" className="text-base font-bold">
              {abolished ? "保有株数ごとの内容(制度があった当時)" : "保有株数ごとの優待内容と必要投資額"}
            </h2>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[480px] text-left text-xs">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-medium">保有株数</th>
                    <th scope="col" className="px-3 py-2 font-medium">優待内容(優待内容の記載より)</th>
                    <th scope="col" className="px-3 py-2 font-medium">年間換算</th>
                    {!abolished && <th scope="col" className="px-3 py-2 font-medium">必要投資額の目安</th>}
                  </tr>
                </thead>
                <tbody>
                  {shareTiers.map((row) => (
                    <tr key={row.shares} className="border-t border-border align-top">
                      <td className="px-3 py-2 tabular-nums whitespace-nowrap">
                        {row.shares.toLocaleString()}株{row.isBase ? "(最低)" : ""}
                      </td>
                      <td className="px-3 py-2 leading-relaxed">{row.content}</td>
                      <td className="px-3 py-2 tabular-nums">{abolished ? "—" : row.annualValueText}</td>
                      {!abolished && <td className="px-3 py-2 tabular-nums whitespace-nowrap">{formatYen(row.investment)}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {shareTiers.length > 1
                ? `優待内容の記載に${shareTiers.length}段階の株数が書かれています。年間換算額は当サイトで最低株数の分だけを入力しており、それ以外の株数は換算していません。`
                : `株数による内容の違いは記載されていないため、最低株数の1行のみです${yutai.holdingRequirement ? `(${yutai.holdingRequirement}の継続保有が条件)` : ""}。`}
              {!abolished &&
                ` 必要投資額は株価基準日(${formatPriceBasisDate(yutai)})の株価 × 株数で計算した目安で、売買手数料は含めていません。`}
            </p>
          </section>
        )}

        {/* 受け取るまでの流れ: 次の基準日・権利付最終日・名簿記録の日程を、この銘柄の条件から算出 */}
        {receiptFlow.length > 0 && (
          <section className="space-y-3" aria-labelledby="flow-heading">
            <h2 id="flow-heading" className="text-base font-bold">受け取るまでの流れと注意点</h2>
            <ol className="space-y-2">
              {receiptFlow.map((step) => (
                <li key={step.title} className="rounded-lg border border-border bg-card p-3">
                  <p className="text-sm font-semibold">{step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </li>
              ))}
            </ol>
            <p className="text-xs text-muted-foreground leading-relaxed">
              日付は今日を起点に、権利付最終日 = 基準日の2営業日前(土日のみ除外・祝日は考慮しない)として計算した概算です。
              仕組みは<Link href="/guide/record-date" className="text-primary underline">権利付最終日・権利落ち日と継続保有条件の仕組み</Link>、
              計算方法は<Link href="/method#first-receipt" className="text-primary underline">算出方法</Link>で説明しています。
            </p>
          </section>
        )}

        {/* 使い方: 優待内容の記載から読み取れる受け取り形式と、掲載データ上の利用先 */}
        {!abolished && (
          <section className="space-y-2" aria-labelledby="usage-heading">
            <h2 id="usage-heading" className="text-base font-bold">優待の使い方</h2>
            {usageForms.length > 0 ? (
              <ul className="space-y-2">
                {usageForms.map((u) => (
                  <li key={u.quote} className="text-sm leading-relaxed">
                    <span className="font-semibold">{u.form}</span>
                    <span className="text-muted-foreground">: 「{u.quote}」— {u.note}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                優待内容の記載から受け取り形式を特定できなかったため、内容は上の「優待内容」の記載のとおりです。
              </p>
            )}
            {yutai.brands.length > 0 && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                掲載データで対応付けている利用先・関連サービスは{yutai.brands.slice(0, 6).join("、")}
                {yutai.brands.length > 6 ? `など${yutai.brands.length}件` : ""}です。
                {matchingExpenseCategories.length > 0 &&
                  `家計の出費では「${matchingExpenseCategories.join("」「")}」に充てる使い方に対応付けています。`}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              有効期限・利用できる店舗の範囲・併用の可否などの利用条件は掲載データに含めていません。届いた優待の案内と企業の公式ページで確認してください。
            </p>
          </section>
        )}

        {/* 銘柄固有の解説(掲載データから文章化。数値・バッジだけのページにしないため) */}
        <section className="space-y-4" aria-labelledby="commentary-heading">
          <h2 id="commentary-heading" className="text-base font-bold">
            {abolished ? "この銘柄の優待の記録" : "この銘柄の優待のポイント"}
          </h2>
          {commentary.paragraphs.map((p) => (
            <div key={p.heading} className="space-y-1">
              <h3 className="text-sm font-semibold">{p.heading}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{p.sentences.join("")}</p>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            掲載データ(基準日 {yutai.priceUpdatedAt ?? yutai.lastVerified})から自動で算出した説明です。順位・中央値は当サイト掲載銘柄の中での値で、
            投資判断の材料の一つとしてご利用ください。
          </p>
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
            <p className="text-sm leading-relaxed text-muted-foreground">
              {yutai.name}の優待に関連するブランド・サービスとして、掲載データでは{yutai.brands.length}件を登録しています。
              名前を選ぶと、<Link href="/search" className="text-primary underline">商品名・ブランド名検索</Link>でその名前に対応する優待銘柄を一覧できます
              (同じブランドを扱う他社の優待が見つかることもあります)。
            </p>
            <div className="flex flex-wrap gap-1.5">
              {yutai.brands.map((brand) => (
                <Link
                  key={brand}
                  href={`/search?q=${encodeURIComponent(brand)}`}
                  className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted text-xs hover:bg-muted/70"
                >
                  {brand}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 対応出費カテゴリ */}
        {!abolished && matchingExpenseCategories.length > 0 && (
          <section className="space-y-2" aria-labelledby="expense-cats-heading">
            <h2 id="expense-cats-heading" className="text-base font-bold">この優待で削減できる出費</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              当サイトの{matchingExpenseCategories.length}つの出費カテゴリに対応付けています。対応付けの根拠(一致した業種ジャンル・生活タグ)とカテゴリ内の位置は次のとおりです。
            </p>
            <ul className="space-y-1.5">
              {matchingExpenseCategories.map((expense) => {
                const slug = EXPENSE_CATEGORY_SLUGS[expense];
                const pos = commentary.categoryPositions.find((c) => c.expense === expense);
                const reason = explainExpenseMatch(yutai, expense);
                return (
                  <li key={expense} className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
                    <Link href={`/expense/${slug}`} className="font-medium text-primary underline">
                      {expense}
                    </Link>
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      {reason}
                      {pos && pos.stockCount > 1
                        ? ` / 掲載${pos.stockCount}銘柄中、必要投資額は低い方から${pos.investmentRank}番目${pos.valueRank !== null ? `・年間優待価値は高い方から${pos.valueRank}番目` : ""}`
                        : pos
                          ? " / このカテゴリの掲載銘柄はこの銘柄のみ"
                          : ""}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="text-xs text-muted-foreground">
              対応付けのルールは<Link href="/method#expense" className="underline">算出方法</Link>で説明しています。
            </p>
          </section>
        )}

        {/* 同じ出費カテゴリの代替候補: 必要投資額・権利確定月・年間価値の違いを1行で */}
        {alternatives.length > 0 && (
          <section className="space-y-2" aria-labelledby="alternatives-heading">
            <h2 id="alternatives-heading" className="text-base font-bold">
              {abolished ? "同じ出費に使える、実施中の優待" : `「${alternatives[0].expense}」の他の掲載銘柄との違い`}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {abolished
                ? `「${alternatives[0].expense}」カテゴリで、現在優待を実施している掲載銘柄のうち年間優待価値の高い順に${alternatives.length}件です。`
                : `同じ「${alternatives[0].expense}」カテゴリの掲載銘柄から、必要投資額が近い順に${alternatives.length}件を並べています。`}
            </p>
            <ul className="space-y-1.5">
              {alternatives.map((alt) => (
                <li key={alt.yutai.code} className="rounded-lg border border-border bg-card px-3 py-2">
                  <Link href={`/stocks/${alt.yutai.code}`} className="text-sm font-medium text-primary underline">
                    {alt.yutai.name}({alt.yutai.code})
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">{alt.line}</p>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">
              比較のための一覧で、特定の銘柄を勧めるものではありません。カテゴリ全体は
              <Link href={`/expense/${alternatives[0].slug}`} className="underline">{alternatives[0].expense}に使える株主優待</Link>
              で確認できます。
            </p>
          </section>
        )}

        {/* 銘柄別FAQ(この銘柄のデータで答えられる質問だけ) */}
        {faq.length > 0 && (
          <section className="space-y-2" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-base font-bold">{yutai.name}の優待についてのよくある質問</h2>
            <div className="space-y-2">
              {faq.map(({ q, a }) => (
                <div key={q} className="rounded-lg border border-border bg-card p-3">
                  <h3 className="text-sm font-semibold">Q. {q}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">A. {a}</p>
                </div>
              ))}
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

        {/* 解説コンテンツへの導線: 数値の根拠・カテゴリの全体像・データ更新の記録 */}
        <section className="space-y-2" aria-labelledby="guide-links-heading">
          <h2 id="guide-links-heading" className="text-base font-bold">このページの数値と関連する解説</h2>
          <ul className="space-y-1.5 text-sm">
            {commentary.categoryPositions.map((c) => (
              <li key={c.slug}>
                <Link href={`/expense/${c.slug}`} className="text-primary underline">
                  {c.expense}に使える株主優待({c.stockCount}銘柄)
                </Link>
                <span className="text-xs text-muted-foreground"> — 権利確定月の分布と同カテゴリの全銘柄</span>
              </li>
            ))}
            <li>
              <Link href="/guide" className="text-primary underline">株主優待のガイド</Link>
              <span className="text-xs text-muted-foreground"> — 始め方・権利付最終日・権利月の分散・情報の確かめ方</span>
            </li>
            <li>
              <Link href="/method#annual-value" className="text-primary underline">年間優待価値の算出方法</Link>
              <span className="text-xs text-muted-foreground"> — 割引券・カタログなど金額の記載がない優待の換算ルール</span>
            </li>
            <li>
              <Link href="/method#yield" className="text-primary underline">必要投資額・優待利回りの計算</Link>
              <span className="text-xs text-muted-foreground"> — 株価基準日と計算式</span>
            </li>
            <li>
              <Link href="/method#quality" className="text-primary underline">「検証済み」と「参考情報」の区分</Link>
            </li>
            <li>
              <Link href="/changelog" className="text-primary underline">更新履歴</Link>
              <span className="text-xs text-muted-foreground"> — 優待の変更・廃止とデータ更新の記録</span>
            </li>
          </ul>
        </section>

        {/* 掲載データ情報 */}
        <section className="pt-4 border-t border-border text-xs text-muted-foreground space-y-1" aria-label="掲載データ情報">
          <p>
            ※ {verificationLabel(yutai)}
            {yutai.sourceUrl && (
              <>
                {" "}(
                <a href={yutai.sourceUrl} className="underline" target="_blank" rel="noopener noreferrer">
                  照合したページ
                </a>
                )
              </>
            )}
            {" / "}
            {isVerifiedYutai(yutai) ? "検証済み銘柄" : "参考情報（企業IRでは未確認）"}
          </p>
          <p>
            ※ 最新の優待内容は
            {/* 企業IRで確認済みの銘柄はそのページへ。それ以外は検索リンクで代替する */}
            <a
              href={
                isVerifiedYutai(yutai) && yutai.sourceUrl
                  ? yutai.sourceUrl
                  : `https://www.google.com/search?q=${encodeURIComponent(yutai.name + " 株主優待 IR")}`
              }
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {isVerifiedYutai(yutai) && yutai.sourceUrl ? "企業IRページ" : "企業IRページ等(検索)"}
            </a>
            で必ずご確認ください。
          </p>
          <p>
            ※ 本ページは参考情報であり、投資勧誘ではありません。優待内容は変更・廃止される場合があります。
            投資判断はご自身の責任でお願いします(<Link href="/terms" className="underline">利用規約</Link>)。
          </p>
        </section>

        {/* アフィリエイトバナー(1ページ1本・本文の後。確認元が未記録の銘柄・廃止銘柄には出さない) */}
        {showPr && (
          <section className="space-y-2" aria-label="証券口座のご案内">
            <h2 className="text-base font-bold">この銘柄を購入するには証券口座が必要です</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {yutai.name}の優待の対象は{yutai.minShares.toLocaleString()}株以上の保有で、株価基準日の株価では約{formatYen(yutai.approxInvestment)}が必要です。
              株式の売買には証券口座が必要で、売買手数料は証券会社や取引コースによって異なります。
              口座開設から初回の優待受け取りまでの流れは<Link href="/guide/getting-started" className="text-primary underline">株主優待の始め方</Link>にまとめています。
            </p>
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

/**
 * 照合元と確認日の表示文言。
 * "broker" は証券会社の優待ページでの照合であり「検証済み」ではないことを明示する。
 */
function verificationLabel(yutai: (typeof YUTAI_LIST)[number]): string {
  if (yutai.sourceType === "ir") return `企業IR・適時開示で確認（確認日: ${yutai.lastVerified}）`;
  if (yutai.sourceType === "broker") return `証券会社の優待ページで照合（確認日: ${yutai.lastVerified}）`;
  return `優待情報取得日: ${yutai.lastVerified}（確認元の記録なし）`;
}
