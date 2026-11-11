import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { AdSenseScript } from "@/components/common/AdSenseScript";
import { DATA_LAST_UPDATED, DATA_STATS } from "@/lib/yutai-data";
import { EXPENSE_CATEGORIES } from "@/lib/matching";
import { buildPageMetadata } from "@/lib/seo";

// このページは実装(src/lib/*.ts・scripts/fetch/update_stock_prices.py)の説明。
// ロジックを変えたら必ずこのページも更新すること。実装にないことは書かない。

export const metadata = buildPageMetadata({
  title: "算出方法",
  description:
    "優待マッチで表示している年間優待価値・優待利回り・初回受取見込み・出費カテゴリの対応付け・優待カレンダーの組み立て方と、検証済み/参考情報の区分を説明します。",
  path: "/method",
});

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${y}年${Number(m)}月${Number(d)}日`;
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="space-y-2 scroll-mt-20" aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className="text-base font-bold">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-border bg-card px-3 py-2 font-mono text-xs text-foreground">
      {children}
    </p>
  );
}

export default function MethodPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <AdSenseScript />
      <div className="mx-auto max-w-2xl min-w-0 space-y-8 px-4 py-8">
        <nav className="text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">トップ</Link>
          <span className="mx-2">›</span>
          <span>算出方法</span>
        </nav>

        <header className="space-y-2">
          <h1 className="text-2xl font-bold">算出方法</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            当サイトで表示している数値・提案がどのように計算されているかを、実装している処理のとおりに説明します。
            データ基準日: {formatDate(DATA_LAST_UPDATED)}。
          </p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
            <li><a href="#annual-value" className="text-primary underline">年間優待価値</a></li>
            <li><a href="#yield" className="text-primary underline">優待利回り</a></li>
            <li><a href="#first-receipt" className="text-primary underline">初回受取見込み</a></li>
            <li><a href="#expense" className="text-primary underline">出費カテゴリ</a></li>
            <li><a href="#calendar" className="text-primary underline">優待カレンダー</a></li>
            <li><a href="#quality" className="text-primary underline">検証済み/参考</a></li>
          </ul>
        </header>

        <Section id="annual-value" title="年間優待価値">
          <p>
            年間優待価値は、最低必要株数で1年間に受け取れる優待を円に換算した値で、銘柄ごとにデータへ入力しています。
            プログラムで自動換算はしていません。
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>金額が記載された金券・優待券・食事券・商品(「◯円相当」): 最低必要株数で1年間に受け取る額面・記載額の合計を入力しています。金額に幅がある場合は下限です。</li>
            <li>ポイント: 公式資料に記載の換算(例: 1ポイント=1円)で入力しています。</li>
            <li>
              公式資料に金額の記載がない優待(割引券・カタログ・現物商品・招待券・乗車券など)は、次の当サイトの換算ルールによる試算です
              (現在{DATA_STATS.valueEstimated}銘柄)。銘柄ページの年間優待価値の下に「年間価値は当サイトの換算ルールによる試算です」と表示しています。
              <ul className="list-[circle] space-y-1 pl-5 mt-1">
                <li>割引券・割引カード: 割引率 × 想定利用額 × 枚数(回数)。</li>
                <li>乗車券・入場券・招待券・無料券など1回分の利用券: 1枚あたりの想定額(通常料金の目安)× 枚数。</li>
                <li>カタログ・現物商品: 同種の商品の一般的な販売価格を目安にした想定額。</li>
              </ul>
              想定利用額・1枚あたりの想定額は銘柄ごとに当サイトが置いた値で、実際の価値は使い方によって変わります。
              前提を優待内容の説明文に記載している銘柄があります(例: 「年間価値は1枚4,000円として試算」)。
            </li>
            <li>
              継続保有の到達時に1回だけ受け取れる優待(例: 保有2年到達時・5年到達時に各1回)は毎年もらえないため、
              年間優待価値に含めず0円として扱い、「◯年保有で1回◯円相当」と別に表示します。
              このような銘柄は年間優待価値・利回りの並び替えや診断の候補から外れます(現在{DATA_STATS.oneTimeOnly}銘柄)。
            </li>
            <li>
              「1年以上保有で」のように基本の優待そのものに保有期間の条件がある銘柄は、条件を満たした後に毎年受け取れる額を年間優待価値としています。
            </li>
          </ul>
        </Section>

        <Section id="yield" title="必要投資額・優待利回り">
          <Formula>必要投資額 = 株価 × 最低必要株数(1円単位に四捨五入)</Formula>
          <Formula>優待利回り(%) = 年間優待価値 ÷ 必要投資額 × 100(小数第1位に四捨五入)</Formula>
          <p>
            株価は週1回(日曜21時)の自動処理で Yahoo! Finance から取得した直近の株価を使い、取得日を「株価基準日」として各銘柄ページに表示しています。名古屋証券取引所のみに上場している銘柄など自動で取得できない銘柄は、手動で確認した株価の日付を「株価基準日」とし、「自動更新対象外」と併記しています。
            株価を取得できなかった銘柄は前回の値のまま残ります。配当は利回りに含めていません。
          </p>
        </Section>

        <Section id="first-receipt" title="今から購入した場合の初回受取見込み">
          <p>今日買った場合に、初めて優待を受け取れる見込みの年月を次の手順で概算しています。</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              権利付最終日 = 基準日の月の最終営業日から2営業日前。営業日は土日のみを除いて数えており、
              <strong className="text-foreground">祝日・年末年始の休場日は考慮していません</strong>
              (祝日が重なる月は実際より1〜2日遅く出ます)。
            </li>
            <li>今月が基準日の月で、今日が権利付最終日を過ぎていれば、今月の基準日は数えません。</li>
            <li>
              継続保有の条件がある銘柄は、株主名簿の記録月(例: 3月末・9月末)を今日から順に数え、必要な連続記録回数に達するまで積み上げます。
              条件がない銘柄は記録1回で足ります。
            </li>
            <li>条件を満たした時点以降で最初に来る優待の基準日を「初回の基準日」とします。</li>
            <li>受取見込み = 初回の基準日 + 発送までの月数(既定3ヶ月、銘柄ごとに設定がある場合はその月数)。</li>
          </ol>
          <p>
            保有期間の条件があるのに、名簿の記録回数などの判定方法を確認できていない銘柄は、条件を無視した早すぎる時期を出さないよう、
            初回受取見込みを算出せずその旨を表示しています。企業の公式資料に判定方法が書かれていない銘柄は、継続保有の条件を公式の文言どおり表示し、
            「公式に判定方法の記載がないため算出していません」と表示します。
          </p>
        </Section>

        <Section id="expense" title="出費カテゴリへの対応付け">
          <p>
            各銘柄には業種ジャンル(例: 外食・交通)とライフスタイルタグ(例: 「出張多い」)をデータとして付けています。
            {EXPENSE_CATEGORIES.length}の出費カテゴリそれぞれに対応するジャンルとタグの一覧を定義し、
            <strong className="text-foreground">ジャンルかタグのどちらか1つでも一致した銘柄</strong>をそのカテゴリの銘柄としています。
            1つの銘柄が複数の出費カテゴリに入ることがあります。
          </p>
          <p>
            カテゴリページの「権利確定月の分布」や銘柄ページの「カレンダー上の位置」は、この対応付けで同じカテゴリに入る優待実施中の銘柄を数えた結果です。
          </p>
        </Section>

        <Section id="calendar" title="優待カレンダーの組み立て(診断結果)">
          <p>選んだ出費カテゴリに対応する銘柄を候補とし、予算内で次の順に組み合わせを作ります。</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              候補ごとにスコアを付けます: 年間優待価値÷1,000(上限50点)+ 選んだ好みのタグとの一致分。
            </li>
            <li>
              月のカバー: 1銘柄の必要投資額が予算の15%以下の候補から、安く埋められる月の順に、各月で最も安い銘柄を1つずつ選びます。
            </li>
            <li>残りの予算で、スコアの高い順に予算を超えない銘柄を追加します。</li>
            <li>1つの月に入れる銘柄は最大2つまでです。累計の必要投資額が予算を超えることはありません。</li>
            <li>
              埋まらなかった月には、予算をやや超える銘柄(予算+50万円まで)を「来年以降の買い足し候補」として別枠で表示します。
            </li>
          </ol>
          <p>
            5年・10年プランでは、総額÷年数(1万円単位に四捨五入)を年間の予算とし、毎年同じ手順(月のカバーは予算の30%以下の銘柄から)を繰り返します。
            使い切れなかった予算は翌年に繰り越します。
          </p>
          <p>組み合わせは条件に合う一例であり、特定の銘柄の購入を勧めるものではありません。</p>
        </Section>

        <Section id="quality" title="検証済み/参考情報の区分">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-foreground">✓ 検証済み</strong>({DATA_STATS.activeVerified}銘柄):
              企業のIRページ・公式の優待案内・適時開示で、公式資料に書かれている事実(優待内容・必要株数・権利確定月・継続保有条件)を確認した銘柄です(確認元の種類: 企業IR)。確認したページのURLと確認日を銘柄ページに表示しています。
              年間優待価値は当サイトの換算値のため、検証済みかどうかの判定には含めていません(公式に金額の記載がない優待は<a href="#annual-value" className="text-primary underline">換算ルールによる試算</a>)。
              公式資料に記載のない事項は推測で補わず、表示しません。
            </li>
            <li>
              <strong className="text-foreground">⚠ 参考情報</strong>({DATA_STATS.activeReference}銘柄):
              証券会社の優待ページで照合した銘柄({DATA_STATS.activeBrokerChecked}銘柄、確認元の種類: 証券会社)と、確認元が記録されていない銘柄です。
              証券会社のページで照合した銘柄には確認日を記録し、銘柄ページに「証券会社の優待ページで照合（確認日: YYYY-MM-DD）」と表示しますが、検証済みには数えません。
              確認元が記録されていない銘柄(企業IR・証券会社のどちらでも照合できていない銘柄)と廃止銘柄のページには広告(PR)を表示していません。
            </li>
          </ul>
          <p>
            区分は銘柄ごとに記録した確認元の種類(企業IR/証券会社)で決まり、企業IRで確認した銘柄だけが検証済みになります。株価の自動更新は内容の確認とは別扱いで、区分や確認日は変わりません。
            上場廃止・優待廃止・掲載停止の記録は<Link href="/changelog" className="text-primary underline">更新履歴</Link>にまとめています。
          </p>
        </Section>

        <section className="space-y-1 border-t border-border pt-4 text-xs text-muted-foreground">
          <p>
            ※ 本ページの数値は参考情報であり、投資勧誘ではありません。投資判断はご自身の責任でお願いします
            (<Link href="/terms" className="underline">利用規約</Link>)。
          </p>
        </section>
      </div>
    </div>
  );
}
