import Link from "next/link";
import { YUTAI_LIST, hasActiveYutai, isAbolishedYutai } from "@/lib/yutai-data";
import { BRANDS, BRAND_DATA_LAST_UPDATED, BRAND_RETAILER_LINKS, RETAILERS } from "@/lib/brand-data";
import { SEARCH_EXAMPLES } from "@/lib/product-search";

// /search の使い方・探せる内容・データの範囲の説明。
// ツールページが入力欄だけの薄いページにならないよう、検索対象の件数はデータから数えて書く。
export function SearchGuide() {
  const searchable = YUTAI_LIST.filter((y) => hasActiveYutai(y) || isAbolishedYutai(y));
  const brandNames = new Set(searchable.flatMap((y) => y.brands));
  const listed = BRANDS.filter((b) => b.isListed).length;
  const unlisted = BRANDS.length - listed;
  const tags = new Set(searchable.flatMap((y) => y.lifestyleTags));

  return (
    <section className="space-y-4 text-sm leading-relaxed" aria-labelledby="search-guide-heading">
      <h2 id="search-guide-heading" className="text-base font-bold">商品名検索の使い方と、探せる範囲</h2>

      <div className="space-y-1">
        <h3 className="font-semibold">検索の対象</h3>
        <p className="text-muted-foreground">
          入力した語を、次の2つのデータと照合します。
        </p>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          <li>
            <strong className="text-foreground">ブランド辞書</strong>({BRANDS.length}ブランド、最終更新 {BRAND_DATA_LAST_UPDATED}):
            ブランドの展開企業と上場の有無を登録した辞書です。上場企業のブランドが{listed}件、非上場のブランドが{unlisted}件で、
            非上場ブランドのうち{new Set(BRAND_RETAILER_LINKS.map((l) => l.brandId)).size}件は取扱小売({RETAILERS.map((r) => r.retailerName).join("・")})の優待とひも付けています。
          </li>
          <li>
            <strong className="text-foreground">優待銘柄データ</strong>: 掲載している{searchable.length}銘柄(優待実施中と、廃止の記録を残している銘柄)の
            銘柄名・証券コード・関連ブランド(重複を除き{brandNames.size}件)・業種ジャンル・生活タグ({tags.size}種類)です。
            辞書にない語(例: 「自転車」のようなジャンル名)もここで拾います。
          </li>
        </ul>
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold">入力の例</h3>
        <p className="text-muted-foreground">
          {SEARCH_EXAMPLES.map((ex, i) => (
            <span key={ex}>
              {i > 0 && "、"}
              <Link prefetch={false} href={`/search?q=${encodeURIComponent(ex)}`} className="text-primary underline">{ex}</Link>
            </span>
          ))}
          。カタカナ・英字のどちらでも検索でき、大文字・小文字や全角・半角の違いは区別しません。
        </p>
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold">結果の見方</h3>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          <li>ブランドを展開する会社が上場していて優待がある場合は、その銘柄の優待と「今から購入した場合の初回受取見込み」を表示します。</li>
          <li>上場していても優待がない場合や、優待が廃止されている場合は、その事実を表示します。</li>
          <li>ブランドが非上場の場合は0件にせず、非上場である事実と、その商品を買える小売の優待を参考として表示します。</li>
          <li>初回受取見込みは、基準日の月末と権利付最終日(2営業日前)をもとにした概算です(<Link href="/method#first-receipt" className="text-primary underline">算出方法</Link>)。</li>
        </ul>
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold">見つからないとき</h3>
        <p className="text-muted-foreground">
          ブランド辞書は手作業で追加しているため、収録していない商品があります。商品のジャンルで探す場合は
          <Link href="/expense" className="text-primary underline">出費カテゴリ</Link>、行きたい場所やしたいことから探す場合は
          <Link href="/experiences" className="text-primary underline">体験から探す</Link>が使えます。
          優待を受け取るまでの流れは<Link href="/guide/getting-started" className="text-primary underline">株主優待の始め方</Link>にまとめています。
        </p>
      </div>
    </section>
  );
}
