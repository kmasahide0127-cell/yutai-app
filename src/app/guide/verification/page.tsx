import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { GuideArticle, Note, P, Section, StockLink } from "@/components/guide/GuideArticle";
import { getGuide } from "@/lib/guides";
import { DATA_STATS, YUTAI_LIST, hasActiveYutai, isVerifiedYutai } from "@/lib/yutai-data";
import { CHANGELOG } from "@/lib/changelog-data";

const guide = getGuide("verification");
export const metadata = buildPageMetadata({ title: guide.title, description: guide.description, path: "/guide/verification" });

export default function VerificationGuide() {
  const active = YUTAI_LIST.filter(hasActiveYutai);
  const withUrl = active.filter((y) => y.sourceUrl).length;
  const verifiedEstimate = active.filter((y) => isVerifiedYutai(y) && y.annualValueIsEstimate).length;
  // 確認日の分布(新しい順に上位3日)
  const dates = new Map<string, number>();
  for (const y of active) dates.set(y.lastVerified, (dates.get(y.lastVerified) ?? 0) + 1);
  const recentDates = [...dates.entries()].sort((a, b) => b[0].localeCompare(a[0])).slice(0, 3);
  // 照合の結果、説明文や判定を直した実例(更新履歴の「修正」から、銘柄に紐づくものを新しい順に3件)
  const fixes = CHANGELOG.filter((e) => e.kind === "修正" && e.code && e.hasPage)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  return (
    <GuideArticle slug="verification">
      <Section id="labels" title="2つの表示区分">
        <P>
          当サイトの銘柄ページには、優待内容をどこで確認したかに応じて「✓ 検証済み」か「⚠ 参考情報」のどちらかを表示しています。
          優待実施中の{DATA_STATS.active}銘柄の内訳は、検証済みが{DATA_STATS.activeVerified}銘柄、参考情報が{DATA_STATS.activeReference}銘柄です
          (参考情報のうち{DATA_STATS.activeBrokerChecked}銘柄は証券会社の優待ページで照合済み)。
        </P>
        <div className="space-y-2">
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-sm font-semibold">✓ 検証済み</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              企業のIRページ・公式の優待案内・適時開示(取引所に提出される開示資料)で、公式資料に書かれている事実
              (優待内容・必要株数・権利確定月・継続保有条件)を確認した銘柄です。確認したページのURLと確認日を銘柄ページに表示しています。
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-sm font-semibold">⚠ 参考情報</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              証券会社の優待ページでの照合のみの銘柄と、確認元が記録されていない銘柄です。企業の一次情報では確認していないため、
              内容が最新でない・不正確な可能性があります。
            </p>
          </div>
        </div>
        <P>
          区分は銘柄ごとに記録した「確認元の種類」だけで決まり、株価の自動更新では変わりません。判定基準の詳細は<Link href="/method#quality" className="text-primary underline">算出方法</Link>にあります。
        </P>
      </Section>

      <Section id="value" title="年間優待価値は「検証」の対象ではない">
        <P>
          年間優待価値は、最低必要株数で1年間に受け取れる優待を当サイトが円に換算した値です。公式資料に金額が書かれていない優待
          (割引券・カタログ・現物商品・招待券・乗車券など)は当サイトの換算ルールによる試算で、該当する銘柄は{DATA_STATS.valueEstimated}銘柄あります
          (うち検証済みの銘柄が{verifiedEstimate}銘柄)。
          検証済みかどうかは公式資料で確認できる事実だけで判定しているため、検証済みの銘柄でも年間優待価値が試算の場合があります。
          試算の銘柄では、銘柄ページの年間優待価値の下にその旨を表示しています(<Link href="/method#annual-value" className="text-primary underline">換算ルール</Link>)。
        </P>
      </Section>

      <Section id="dates" title="「確認日」と「株価基準日」は別のもの">
        <P>
          銘柄ページには2つの日付があります。<strong className="text-foreground">確認日</strong>は優待の内容を照合した日、
          <strong className="text-foreground">株価基準日</strong>は必要投資額・利回りの計算に使った株価を取得した日です。
          株価は週1回の自動処理で更新しますが、それによって優待内容が再確認されたことにはなりません。
          現在の確認日は{recentDates.map(([d, n]) => `${d}が${n}銘柄`).join("、")}などです。
        </P>
      </Section>

      <Section id="how-to-check" title="購入前に自分で確かめる手順">
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            <strong className="text-foreground">銘柄ページの「照合したページ」を開く</strong>: 優待実施中の{withUrl}銘柄で、照合に使ったページのURLを記録しています。
            検証済みの銘柄は企業の公式ページ、参考情報の銘柄は証券会社の優待ページです。
          </li>
          <li>
            <strong className="text-foreground">企業のIRページで最新の案内を確認する</strong>: 必要株数・権利確定月・継続保有条件・優待の内容が、当サイトの表示と一致しているかを確認します。
            特に継続保有条件は「同一株主番号で連続◯回」のように細かい条件が付くことがあります。
          </li>
          <li>
            <strong className="text-foreground">確認日以降の適時開示を確認する</strong>: 優待の変更・廃止は適時開示で発表されます。
            銘柄ページの確認日より後に「株主優待制度の変更(廃止)に関するお知らせ」などの開示がないかを確認します。
          </li>
          <li>
            <strong className="text-foreground">当サイトの更新履歴を見る</strong>: 当サイトで反映した変更・修正は<Link href="/changelog" className="text-primary underline">更新履歴</Link>に記録しています。
          </li>
        </ol>
      </Section>

      {fixes.length > 0 && (
        <Section id="examples" title="照合で内容を直した実例">
          <P>照合の結果、掲載内容や区分を修正した記録の一部です(更新履歴より、新しい順)。</P>
          <div className="space-y-2">
            {fixes.map((e) => (
              <Note key={`${e.code}-${e.date}`}>
                <p className="font-semibold text-foreground">
                  {e.date} <StockLink code={e.code} name={e.name} />
                </p>
                <p className="mt-1">{e.detail}</p>
              </Note>
            ))}
          </div>
        </Section>
      )}
    </GuideArticle>
  );
}
