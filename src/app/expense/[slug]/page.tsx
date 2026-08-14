import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { YUTAI_LIST, DATA_LAST_UPDATED } from "@/lib/yutai-data";
import {
  EXPENSE_CATEGORY_SLUGS,
  getExpenseCategoryBySlug,
  getYutaiForExpenseCategory,
} from "@/lib/matching";
import { AppHeader } from "@/components/AppHeader";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import AdUnit from "@/components/common/AdUnit";
import AffiliateBanner from "@/components/AffiliateBanner";

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

  const description = `${expense}の株主優待まとめ。代表銘柄・活用例・全銘柄一覧を掲載。あなたに合う優待を無料で診断できます。`;

  return {
    title: `${expense}に使える株主優待 | 優待マッチ`,
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

// カテゴリ別の詳細説明
const CATEGORY_DESCRIPTIONS: Record<string, { summary: string; tips: string; caution: string }> = {
  "外食・カフェ": {
    summary: "外食やカフェの支出は、食事券・お食事優待券の形で還元できる株主優待が充実しています。ファミリーレストラン、回転寿司、牛丼チェーン、カフェなど幅広い業種から選べます。",
    tips: "外食頻度が月4回以上の方なら、年間1〜3万円分の優待を活用できるケースがあります。家族でよく利用するチェーン系の銘柄を選ぶと使いやすくなります。",
    caution: "優待券には有効期限があるものが多く、店舗限定の場合もあります。最新情報は必ず各企業のIRページでご確認ください。",
  },
  "自炊・食材": {
    summary: "食材購入に使える株主優待として、スーパーマーケットの割引券や食品メーカーの自社商品詰め合わせがあります。日常の食費削減につながる優待です。",
    tips: "食品・食材系の優待は「自社商品セット」の形が多く、生活必需品として活用しやすい傾向があります。",
    caution: "商品ギフト型優待は、商品の種類が毎年変わることがあります。最新内容は企業IRサイトでご確認ください。",
  },
  "コンビニ・お菓子": {
    summary: "コンビニ関連や菓子メーカーの株主優待は、自社製品の詰め合わせや割引クーポンの形で提供されることが多く、日常生活に密着した優待です。",
    tips: "コンビニを毎日利用する方にとっては小額でも積み重なる効果があります。菓子メーカー系は贈答品にも活用できます。",
    caution: "有効期限・使用店舗が限定される場合があります。優待内容の変更も多いため、必ずIRページでご確認ください。",
  },
  "日用品・ドラッグストア": {
    summary: "ドラッグストアや日用品メーカーの株主優待では、割引クーポンや自社商品セットが提供されます。毎月かかる日用品費の実質的な節約につながります。",
    tips: "ドラッグストア系は関東・関西など地域限定の場合があります。居住エリアで使える銘柄を選ぶと効率的です。",
    caution: "全国展開していない企業の優待は、近隣店舗がない場合に利用できません。株主優待の内容・条件は変更されることがあります。",
  },
  "衣服・ファッション": {
    summary: "アパレル・ファッション企業の株主優待では、自社ブランドの割引券や商品券が提供されます。普段使いのブランドと銘柄が一致すると活用しやすくなります。",
    tips: "アパレル系は季節ごとのセール前後に優待を活用すると、より大きな節約効果が期待できます。",
    caution: "優待の対象ブランドが限定されることがあります。詳細は企業のIRページまたは株主優待専用ページでご確認ください。",
  },
  "美容・スキンケア": {
    summary: "化粧品メーカーや美容サービス関連企業の株主優待として、自社製品のサンプルセットや割引クーポンが提供されることがあります。",
    tips: "化粧品系の優待は定価換算での価値が高い場合があります。普段使いのブランドと一致すると効果的です。",
    caution: "優待内容は変更・廃止されることがあります。事前に最新の優待詳細を必ずご確認ください。",
  },
  "通信費": {
    summary: "通信会社の株主優待では、携帯料金の割引や通信関連のポイント付与などが提供されます。毎月発生する固定費の実質削減につながる優待です。",
    tips: "通信費は毎月発生する固定費のため、優待を活用できると年間を通じた節約効果が安定しやすいです。",
    caution: "通信会社の優待は料金プランや契約条件に依存する場合があります。詳細条件は必ずご確認ください。",
  },
  "車関連費(ガソリン・駐車場・整備)": {
    summary: "自動車関連企業の株主優待では、ガソリンスタンドの割引、カーメンテナンスサービス、カー用品の割引などが提供されます。車を使う方の日常的な支出削減に活用できます。",
    tips: "ガソリン代は価格変動が大きいですが、株主優待による固定的な還元は安定した節約効果があります。EVオーナーは給油系優待より電気関連・カー用品系を選ぶと活用しやすいです。",
    caution: "ガソリンスタンドの優待は特定のブランド店舗のみ対応の場合があります。最新の対象店舗情報をご確認ください。",
  },
  "交通・旅行": {
    summary: "鉄道会社、航空会社、旅行会社の株主優待では、運賃割引証や旅行商品の優待が提供されます。旅行好きの方や長距離通勤の方に活用しやすい優待です。",
    tips: "鉄道系の株主優待割引証は、乗車券購入時に使える場合が多く、年に数回の帰省や旅行で大きな節約になることがあります。",
    caution: "航空・鉄道優待は繁忙期に使えない場合や、対象路線が限定されることがあります。利用前に必ず条件をご確認ください。",
  },
  "エンタメ(映画・テーマパーク)": {
    summary: "映画館やテーマパーク、レジャー施設を運営する企業の株主優待では、入場券や割引券が提供されます。家族でのお出かけや趣味のエンタメ費用を実質削減できます。",
    tips: "映画鑑賞券はファミリーでの利用にも向いており、年に複数回映画館を訪れる方は継続的な活用が見込めます。",
    caution: "テーマパーク系優待は入場可能な曜日・時期に制限がある場合があります。詳細は最新の優待案内でご確認ください。",
  },
  "健康・スポーツ": {
    summary: "フィットネスクラブや健康関連企業の株主優待では、施設利用割引や健康食品の提供などがあります。健康維持にかかるコストを一部優待で補える場合があります。",
    tips: "スポーツジム系優待は利用頻度が高いほど費用対効果が高まります。自宅や職場近くの施設が対象かどうかを事前に確認しましょう。",
    caution: "施設の場所が限定されるため、居住地域との相性をご確認ください。優待条件は変更されることがあります。",
  },
  "子育て・教育": {
    summary: "子育て・教育関連企業の株主優待では、玩具の割引、学習サービスの優待、子ども向け施設の入場券などが提供されることがあります。お子様がいるご家庭の出費削減に役立てられます。",
    tips: "お子様の年齢に合わせた優待を選ぶことで、実際の生活費削減につながります。玩具メーカー系は誕生日やクリスマスギフト代わりにも活用できます。",
    caution: "子育て関連優待は対象年齢に制限がある場合があります。お子様の年齢要件を事前にご確認ください。",
  },
  "趣味・ガジェット": {
    summary: "家電量販店や趣味・ホビー関連企業の株主優待では、自社店舗の割引クーポンや商品券が提供されます。ガジェット好きや趣味の出費が多い方に活用しやすい優待です。",
    tips: "家電量販店系優待は大型購入の際にまとめて使うと節約効果が大きくなります。ポイント還元との組み合わせも検討しましょう。",
    caution: "優待クーポンの利用条件(金額下限・対象商品)があることが多いです。詳細は各企業のIRページでご確認ください。",
  },
  "ネットショッピング": {
    summary: "ECサービスや通販を展開する企業の株主優待では、割引クーポンやポイント付与が提供されることがあります。日常的にオンラインショッピングを利用する方の出費削減に役立てられます。",
    tips: "ネットショッピング系の優待は自宅から気軽に使えるため、使いやすさが高い傾向にあります。",
    caution: "優待クーポンには有効期限や最低購入金額の条件があることがあります。最新条件は必ずご確認ください。",
  },
};

// カテゴリ別の優待種類
const CATEGORY_BENEFIT_TYPES: Record<string, string[]> = {
  "外食・カフェ": ["食事優待券型（特定チェーン店で使える券）", "割引型（来店時の割引・クーポン）", "プリペイドチャージ型（専用カードへの入金）"],
  "自炊・食材": ["自社製品詰め合わせ型", "割引クーポン型", "カタログギフト型"],
  "コンビニ・お菓子": ["自社製品詰め合わせ型", "割引クーポン型"],
  "日用品・ドラッグストア": ["割引クーポン型", "自社製品セット型", "ポイント付与型"],
  "衣服・ファッション": ["割引券型（○%OFF）", "商品券型", "会員特典型"],
  "美容・スキンケア": ["自社製品セット型", "割引クーポン型", "サンプルセット型"],
  "通信費": ["ポイント付与型", "料金割引型", "通信サービス提供型（eSIMなど）"],
  "車関連費(ガソリン・駐車場・整備)": ["割引チケット型", "カー用品割引型", "サービス優待型"],
  "交通・旅行": ["割引証型（運賃○%割引）", "招待券型", "旅行代金割引型"],
  "エンタメ(映画・テーマパーク)": ["入場券型", "割引券型", "会員優待型"],
  "健康・スポーツ": ["施設利用割引型", "自社製品提供型", "会員特典型"],
  "子育て・教育": ["自社製品提供型（玩具・食品）", "割引券型", "施設入場券型"],
  "趣味・ガジェット": ["割引クーポン型", "商品券型", "ポイント付与型"],
  "ネットショッピング": ["ポイント付与型", "割引クーポン型", "送料無料特典型"],
};

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
  const categoryDesc = CATEGORY_DESCRIPTIONS[expense];
  const benefitTypes = CATEGORY_BENEFIT_TYPES[expense];

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
            {expense}の出費は、株主優待で削減できます。
            ここでは{expense}に活用できる優待銘柄を年間優待価値の高い順に紹介します（{allYutai.length}銘柄掲載）。
          </p>
        </header>

        {/* カテゴリ説明 */}
        {categoryDesc && (
          <section className="space-y-3 text-sm leading-relaxed" aria-label="カテゴリについて">
            <h2 className="font-bold text-base text-foreground">このカテゴリについて</h2>
            <p className="text-muted-foreground">{categoryDesc.summary}</p>
            <div className="rounded-lg bg-muted/50 p-4 space-y-1.5">
              <p className="font-medium text-xs text-muted-foreground uppercase tracking-wide">活用のポイント</p>
              <p className="text-sm text-muted-foreground">{categoryDesc.tips}</p>
            </div>
            <p className="text-xs text-muted-foreground border-l-2 border-amber-400 pl-3">
              注意: {categoryDesc.caution}
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
                        {yutai.dataQuality === "verified" && (
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded-md">
                            ✓ 検証済み
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        年間 {formatYen(yutai.annualValue)} / 権利確定: {formatMonths(yutai.rightsMonths)}
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

        {/* 優待の種類 */}
        {benefitTypes && benefitTypes.length > 0 && (
          <section className="space-y-3" aria-labelledby="benefit-types-heading">
            <h2 id="benefit-types-heading" className="font-bold text-base text-foreground">
              {expense}優待の種類
            </h2>
            <ul className="space-y-1.5">
              {benefitTypes.map((type) => (
                <li key={type} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="shrink-0 text-primary mt-0.5">▪</span>
                  <span>{type}</span>
                </li>
              ))}
            </ul>
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
                      {formatMonths(yutai.rightsMonths)}確定 · 年{formatYen(yutai.annualValue)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {yutai.dataQuality === "verified" ? (
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
