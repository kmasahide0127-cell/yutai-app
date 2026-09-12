import type { Metadata } from "next";
import Link from "next/link";
import { YUTAI_LIST } from "@/lib/yutai-data";
import { searchProducts, type BrandResolution } from "@/lib/product-search";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_SLUGS } from "@/lib/matching";
import { BRAND_DATA_LAST_UPDATED } from "@/lib/brand-data";
import { AppHeader } from "@/components/AppHeader";
import { ProductSearchForm } from "@/components/search/ProductSearchForm";
import {
  StockResultCard,
  FirstReceiptNote,
} from "@/components/search/StockResultCard";

export const metadata: Metadata = {
  title: "商品名から株主優待を逆引き検索 | 優待マッチ",
  description:
    "ReFa・SIXPAD・ARグラスなど、欲しい商品やブランド名から該当する株主優待銘柄を逆引きします。非上場ブランドの場合は、その商品を買える小売の優待も参考として表示します。",
  alternates: { canonical: "/search" },
};

type SearchParams = Promise<{ q?: string }>;

/** ブランド辞書ヒット1件のカード */
function BrandResolutionCard({ resolution }: { resolution: BrandResolution }) {
  const { brand, kind, yutai, firstReceipt, statusMessage, retailerRelays } = resolution;
  const hasYutai = kind === "listed-with-yutai";

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-bold">{brand.brandName}</h3>
          <span className="text-xs text-muted-foreground">
            {brand.makerCompany}
            {brand.ticker ? `(${brand.ticker})` : ""}
          </span>
          {brand.isListed ? (
            <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              上場
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              非上場
            </span>
          )}
        </div>
        {brand.note && (
          <p className="text-xs leading-relaxed text-muted-foreground">{brand.note}</p>
        )}
      </div>

      {/* 優待が取れない場合も「0件」にせず、理由を明示する */}
      {statusMessage && (
        <p className="rounded-lg bg-muted/50 p-3 text-sm font-medium">
          ⚠ {statusMessage}
        </p>
      )}

      {yutai && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {hasYutai ? "該当銘柄" : "該当企業"}
          </p>
          <StockResultCard
            yutai={yutai}
            firstReceipt={firstReceipt}
            showFirstReceipt={false}
          />
          {hasYutai && firstReceipt && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
              <FirstReceiptNote estimate={firstReceipt} yutai={yutai} />
              <p className="mt-2 text-xs text-muted-foreground">
                権利付最終日・基準日は祝日の並びで前後します。実際の発送・付与時期は各企業のIR情報でご確認ください。
              </p>
            </div>
          )}
          {hasYutai && (
            <p className="text-sm leading-relaxed">{yutai.description}</p>
          )}
        </div>
      )}

      {/* 取扱小売リレー: メーカーが非上場でも「買う店の優待」を候補として残す */}
      {retailerRelays.length > 0 && (
        <div className="space-y-2 border-t border-border pt-3">
          <p className="text-xs font-medium text-muted-foreground">
            この商品を買える店の優待(候補)
          </p>
          {retailerRelays.map((relay) => (
            <div key={relay.retailer.code} className="space-y-1.5">
              <StockResultCard yutai={relay.yutai} firstReceipt={relay.firstReceipt} />
              <p className="px-1 text-xs text-muted-foreground">
                利用可: {relay.retailer.channels.join("・")}
                {relay.note ? ` / ${relay.note}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const result = query ? searchProducts(query, YUTAI_LIST) : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <div className="mx-auto max-w-2xl min-w-0 space-y-6 px-4 py-8">
        <nav className="text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">
            トップ
          </Link>
          <span className="mx-2">›</span>
          <span>商品名から探す</span>
        </nav>

        <header className="space-y-1">
          <h1 className="text-2xl font-bold">商品名から株主優待を探す</h1>
          <p className="text-sm text-muted-foreground">
            欲しい商品やブランド名を入れると、その商品に関係する優待銘柄の候補を表示します。
          </p>
        </header>

        <ProductSearchForm defaultValue={query} />

        {/* ── 検索前 ── */}
        {!result && (
          <section className="space-y-3 rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              「ReFa が欲しい」「AR グラスが気になる」といった商品起点の探し方に対応しています。
              ブランドを展開している会社が上場していれば、その銘柄の優待と
              「今から購入した場合の初回受取見込み時期」を表示します。
            </p>
            <p>
              ブランドが非上場の場合も0件にはせず、非上場である事実と、
              その商品を買える小売(家電量販店など)の優待を候補として表示します。
            </p>
            <p className="text-xs">
              ※ 本サービスは情報提供のみを目的としており、投資助言・投資勧誘にはあたりません。
              優待内容・取得条件は変更・廃止される場合があります。投資判断はご自身の責任でお願いします。
            </p>
          </section>
        )}

        {/* ── 該当なし ── */}
        {result && !result.hasAnyResult && (
          <section className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-medium">
                「{result.query}」に該当するブランド・銘柄は見つかりませんでした
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                ブランド辞書に未収録の商品の可能性があります。
                カタカナ・英字のどちらでも検索できます(例: 「リファ」「ReFa」)。
                出費カテゴリから探す方法もあります。
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                出費カテゴリから探す
              </p>
              <div className="flex flex-wrap gap-1.5">
                {EXPENSE_CATEGORIES.map((category) => {
                  const slug = EXPENSE_CATEGORY_SLUGS[category];
                  return slug ? (
                    <Link
                      key={category}
                      href={`/expense/${slug}`}
                      className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/50"
                    >
                      {category}
                    </Link>
                  ) : null;
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── ブランド辞書のヒット ── */}
        {result && result.brandResolutions.length > 0 && (
          <section className="space-y-3" aria-labelledby="brand-results-heading">
            <h2 id="brand-results-heading" className="text-base font-bold">
              ブランドから特定した候補
            </h2>
            {result.brandResolutions.map((resolution) => (
              <BrandResolutionCard key={resolution.brand.id} resolution={resolution} />
            ))}
          </section>
        )}

        {/* ── 銘柄データの直接ヒット ── */}
        {result && result.stockMatches.length > 0 && (
          <section className="space-y-3" aria-labelledby="stock-results-heading">
            <h2 id="stock-results-heading" className="text-base font-bold">
              関連する銘柄({result.stockMatches.length}件)
            </h2>
            <div className="space-y-2">
              {result.stockMatches.map((match) => (
                <StockResultCard
                  key={match.yutai.id}
                  yutai={match.yutai}
                  firstReceipt={match.firstReceipt}
                  matchedTerms={match.matchedTerms}
                />
              ))}
            </div>
          </section>
        )}

        {result && result.hasAnyResult && (
          <section className="space-y-1 rounded-lg bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
            <p>
              ・表示しているのは候補・参考情報です。特定銘柄の売買を勧めるものではありません。
              投資判断はご自身の責任でお願いします。
            </p>
            <p>
              ・優待内容・継続保有条件は変更・廃止される場合があります。最新情報は各企業のIRページでご確認ください。
            </p>
            <p>
              ・初回受取見込み時期は、基準日の月末と権利付最終日(2営業日前)をもとにした概算です。
              祝日の並びは考慮していません。
            </p>
            <p>・ブランド辞書の最終更新: {BRAND_DATA_LAST_UPDATED}</p>
          </section>
        )}

        <div className="flex flex-wrap gap-3 pt-2 text-sm">
          <Link href="/stocks" className="text-primary hover:underline">
            銘柄一覧を見る
          </Link>
          <Link href="/onboarding" className="text-primary hover:underline">
            生活から診断する
          </Link>
        </div>
      </div>
    </div>
  );
}
