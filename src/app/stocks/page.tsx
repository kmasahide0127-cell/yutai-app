import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import Link from "next/link";
import { DATA_STATS, YUTAI_LIST, formatPriceBasisDate, hasActiveYutai, isAnnualizedYutai, type Yutai } from "@/lib/yutai-data";
import {
  countYutaiByCategory,
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_SLUGS,
  filterYutaiByStockListFilter,
  getExpenseCategoryBySlug,
  GIFT_CARD_FILTER_KEY,
  yutaiMatchesExpense,
  type ExpenseCategory,
  type StockListFilter,
} from "@/lib/matching";
import { isAbolished } from "@/lib/product-search";
import { AppHeader } from "@/components/AppHeader";
import { AdSenseScript } from "@/components/common/AdSenseScript";
import { ProductSearchForm } from "@/components/search/ProductSearchForm";
import { StockResultCard } from "@/components/search/StockResultCard";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildPageMetadata({
  title: "株主優待 全銘柄一覧",
  description:
    "優待マッチが収録している全銘柄の一覧。生活費削減に使える株主優待を全件閲覧できます。カテゴリで絞り込んで探すこともできます。",
  path: "/stocks",
});

function formatYen(amount: number): string {
  return `${amount.toLocaleString()}円`;
}

// 優待利回りがこの値(%)を超える銘柄は、一覧上で算出根拠(年間優待価値・必要投資額・株価基準日)を併記する。
// 高い利回りは株価の急落や優待価値の見積もりに左右されやすく、根拠なしに数字だけを見せないため。
const YIELD_BASIS_THRESHOLD = 10;

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

type SearchParams = Promise<{ category?: string; expense?: string; month?: string }>;

type ListFilters = {
  expense: ExpenseCategory | null;
  month: number | null;
  genre: StockListFilter | null;
};

function applyFilters(list: Yutai[], f: ListFilters): Yutai[] {
  const byExpenseAndMonth = list.filter(
    (y) =>
      (!f.expense || yutaiMatchesExpense(y, f.expense)) &&
      (!f.month || y.rightsMonths.includes(f.month))
  );
  return filterYutaiByStockListFilter(byExpenseAndMonth, f.genre);
}

/** 現在の絞り込みに1項目だけ差し替えた URL を作る(null でその項目を解除) */
function buildHref(f: ListFilters, patch: Partial<ListFilters>): string {
  const next = { ...f, ...patch };
  const params = new URLSearchParams();
  if (next.expense) params.set("expense", EXPENSE_CATEGORY_SLUGS[next.expense]);
  if (next.month) params.set("month", String(next.month));
  if (next.genre) params.set("category", next.genre);
  const q = params.toString();
  return q ? `/stocks?${q}` : "/stocks";
}

export default async function StocksListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category, expense, month } = await searchParams;
  // 同名パラメータの重複で配列が渡るケースを除外する
  const monthNum = typeof month === "string" ? Number(month) : NaN;
  const filters: ListFilters = {
    expense: typeof expense === "string" ? getExpenseCategoryBySlug(expense) ?? null : null,
    month: Number.isInteger(monthNum) && monthNum >= 1 && monthNum <= 12 ? monthNum : null,
    genre: typeof category === "string" ? category : null,
  };
  const isFiltered = Boolean(filters.expense || filters.month || filters.genre);

  const validYutai = YUTAI_LIST.filter(isAnnualizedYutai).sort(
    (a, b) => b.annualValue - a.annualValue
  );
  // 継続保有の到達時に1回だけもらえる優待(NTT等)。年換算できないため年間価値の並びには混ぜない
  const oneTimeYutai = applyFilters(
    YUTAI_LIST.filter((y) => hasActiveYutai(y) && !isAnnualizedYutai(y)),
    filters
  );

  // 廃止済み銘柄は一覧から消さず、active と分けた別セクションで事実を表示する。
  // 件数・カテゴリチップは active のみで数えるため、上の validYutai とは混ぜない。
  const abolishedYutai = applyFilters(YUTAI_LIST.filter(isAbolished), filters).sort((a, b) =>
    (b.lastRecordDate ?? "").localeCompare(a.lastRecordDate ?? "")
  );

  // チップの件数は「他の絞り込みはそのまま、その項目だけ差し替えた場合」の件数
  const countWith = (patch: Partial<ListFilters>) =>
    applyFilters(validYutai, { ...filters, ...patch }).length;
  const categoryCounts = countYutaiByCategory(validYutai);

  const displayedYutai = applyFilters(validYutai, filters);

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
      <AdSenseScript />
      <div className="mx-auto max-w-2xl min-w-0 space-y-6 px-4 py-8">
        <nav className="text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">トップ</Link>
          <span className="mx-2">›</span>
          <span>銘柄一覧</span>
        </nav>
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">株主優待 全銘柄一覧</h1>
          <p className="text-sm text-muted-foreground">
            {isFiltered
              ? `${displayedYutai.length}銘柄(絞り込み中・全${validYutai.length}銘柄中)`
              : `${validYutai.length}銘柄(年間優待価値の高い順)`}
          </p>
          {/* トップの件数と食い違って見えないよう、収録件数の内訳を明示する */}
          <p className="text-xs text-muted-foreground">
            収録{DATA_STATS.total}件の内訳: 優待実施中{DATA_STATS.active}銘柄
            (年間優待価値を算出できる{DATA_STATS.annualized}銘柄+継続保有で単発の優待{DATA_STATS.oneTimeOnly}銘柄)
            / 優待廃止・上場廃止{DATA_STATS.abolished}件 / 優待なし{DATA_STATS.noYutai}件
            (商品名検索で「優待なし」と案内するためにのみ収録。一覧には表示しません)
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

        <ProductSearchForm />

        <p className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/50">
          💡 各銘柄をタップすると詳細ページが開きます。あなたに合う優待は<Link href="/onboarding" className="underline font-medium">診断</Link>で見つかります。
        </p>

        {/* ── 絞り込み: 出費カテゴリ → 権利確定月 → 業種ジャンルの順(生活起点を先に置く) ── */}
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">出費カテゴリで絞り込む</p>
            <div className="flex flex-wrap gap-1.5">
              <Link href={buildHref(filters, { expense: null })} className={chipClass(filters.expense === null)}>
                すべて({countWith({ expense: null })})
              </Link>
              {EXPENSE_CATEGORIES.map((e) => (
                <Link key={e} href={buildHref(filters, { expense: e })} className={chipClass(filters.expense === e)}>
                  {e}({countWith({ expense: e })})
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">権利確定月で絞り込む</p>
            <div className="flex flex-wrap gap-1.5">
              <Link href={buildHref(filters, { month: null })} className={chipClass(filters.month === null)}>
                すべて
              </Link>
              {MONTHS.map((m) => (
                <Link key={m} href={buildHref(filters, { month: m })} className={chipClass(filters.month === m)}>
                  {m}月({countWith({ month: m })})
                </Link>
              ))}
            </div>
          </div>

          {/* 「お酒だけ」「クオカードだけ」等、業種ジャンルを絞って探したい人向け */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">業種ジャンルで絞り込む</p>
            <div className="flex flex-wrap gap-1.5">
              <Link href={buildHref(filters, { genre: null })} className={chipClass(filters.genre === null)}>
                すべて
              </Link>
              <Link
                href={buildHref(filters, { genre: GIFT_CARD_FILTER_KEY })}
                className={chipClass(filters.genre === GIFT_CARD_FILTER_KEY)}
              >
                🎫 クオカード等の金券({countWith({ genre: GIFT_CARD_FILTER_KEY })})
              </Link>
              {categoryCounts.map(({ category: c }) => (
                <Link key={c} href={buildHref(filters, { genre: c })} className={chipClass(filters.genre === c)}>
                  {c}({countWith({ genre: c })})
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {displayedYutai.length === 0 && (
            <p className="rounded-lg border border-border bg-card p-4 text-center text-sm text-muted-foreground">
              この条件に該当する銘柄は現状ありません
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
                  <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                    年間 {formatYen(yutai.annualValue)} / 利回り {yutai.yieldPercent}% / {yutai.rightsMonths.map((m) => `${m}月`).join("・")}確定
                  </p>
                  {yutai.yieldPercent > YIELD_BASIS_THRESHOLD && (
                    <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                      算出根拠: 年間優待価値 {formatYen(yutai.annualValue)} ÷ 必要投資額 {formatYen(yutai.approxInvestment)}
                      (株価基準日 {formatPriceBasisDate(yutai)}・{yutai.minShares}株)
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── 単発優待(年換算しない) ── */}
        {oneTimeYutai.length > 0 && (
          <section className="space-y-2" aria-labelledby="onetime-heading">
            <h2 id="onetime-heading" className="text-base font-bold">
              継続保有で1回だけもらえる優待({oneTimeYutai.length}銘柄)
            </h2>
            <p className="text-xs text-muted-foreground">
              保有年数の到達時に1回ずつ進呈される優待です。毎年もらえるものではないため、
              年間優待価値・優待利回りは算出せず、上の一覧とは分けて表示しています。
            </p>
            <div className="space-y-2">
              {oneTimeYutai.map((yutai) => (
                <StockResultCard key={yutai.id} yutai={yutai} showFirstReceipt={false} />
              ))}
            </div>
          </section>
        )}

        {/* ── 廃止済み銘柄(検索で辿り着いた人に事実を残すため、非表示にしない) ── */}
        {abolishedYutai.length > 0 && (
          <section className="space-y-2" aria-labelledby="abolished-heading">
            <h2 id="abolished-heading" className="text-base font-bold">
              優待廃止・上場廃止の銘柄({abolishedYutai.length}件)
            </h2>
            <p className="text-xs text-muted-foreground">
              優待を探していて辿り着いたときに分かるよう、廃止の事実を記録として掲載しています。
              上の一覧(実施中)とは分けて表示しています。日付ごとの記録は
              <Link href="/changelog" className="underline">更新履歴</Link>にまとめています。
            </p>
            <div className="space-y-2">
              {abolishedYutai.map((yutai) => (
                <StockResultCard key={yutai.id} yutai={yutai} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
