import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { AdSenseScript } from "@/components/common/AdSenseScript";
import { DATA_LAST_UPDATED, DATA_STATS, YUTAI_LIST, hasActiveYutai } from "@/lib/yutai-data";
import { CHANGELOG } from "@/lib/changelog-data";
import { GUIDES } from "@/lib/guides";

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${y}年${parseInt(m)}月${parseInt(d)}日`;
}

export const metadata: Metadata = buildPageMetadata({
  title: "このサイトについて",
  description:
    "個人開発の株主優待マッチングサービス「優待マッチ」のデータ品質・検証方法・運営方針・免責事項について詳しく説明します。",
  path: "/about",
});

const ABOUT_FAQ = [
  {
    q: "このサービスは誰が運営していますか？",
    a: "テック系の個人開発者が副業として運営しています。金融・証券の専門家ではなく、あくまで情報提供のみを目的とするサービスです。氏名・住所等の個人情報は公開しておりません。",
  },
  {
    q: "データはどこから取得していますか？",
    a: "各企業のIR情報・公式ウェブサイト・公開された株主優待案内をもとに収集・整理しています。一部データはAIによる推定を含む場合があり、取得基準日以降の変更は反映されないことがあります。",
  },
  {
    q: "「検証済み」と「参考情報」の違いは何ですか？",
    a: "「✓ 検証済み」は、企業のIRページ・公式優待ページ・適時開示で、優待内容・必要株数・権利確定月・継続保有条件を確認した銘柄です。年間優待価値は当サイトの換算値のため判定に含めず、公式に金額の記載がない優待は銘柄ページで試算である旨を表示しています。「参考情報（⚠）」は、証券会社の優待ページでの照合のみの銘柄と、確認元が記録されていない銘柄です。証券会社の優待ページで照合した銘柄は、銘柄ページに「証券会社の優待ページで照合（確認日: YYYY-MM-DD）」と表示しています。どちらの場合も、最新情報は必ず各企業のIRページでご確認ください。",
  },
  {
    q: "優待内容が古い・間違っている場合は？",
    a: "優待情報の誤りや変更のご報告は、お問い合わせページからメールにてご連絡ください。確認後、できる限り速やかに修正・更新いたします。",
  },
  {
    q: "利用に費用はかかりますか？",
    a: "すべての機能を無料でご利用いただけます。登録・課金も不要です。",
  },
  {
    q: "入力した情報はどこに保存されますか？",
    a: "入力データ（出費カテゴリ・投資額・世帯構成等）はすべてご自身のブラウザ内（localStorage）にのみ保存されます。サーバーへの個人情報送信は行いません。",
  },
  {
    q: "スマートフォンでも使えますか？",
    a: "はい。スマートフォン・タブレット・PCいずれでもご利用いただけます。すべてブラウザで動作し、アプリのインストールは不要です。",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <AdSenseScript />
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* タイトル＆ミッション */}
        <header>
          <h1 className="text-2xl font-bold mb-2">このサイトについて</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            「優待マッチ」は、生活費・出費カテゴリから株主優待を逆引きで探せる個人開発の情報提供サービスです。
          </p>
        </header>

        {/* 開発の背景 */}
        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="font-bold text-base text-foreground">開発の背景</h2>
          <p className="text-muted-foreground">
            個人投資家として株主優待に興味を持ち始めたとき、
            「自分の生活スタイルに本当に合う優待が見つかりにくい」という課題を感じました。
            既存サービスの多くは優待情報の一覧や銘柄スクリーニングが中心で、
            「外食費を月1万円使っている→それを削減できる優待は？」という
            <strong className="text-foreground">逆引き発想でのマッチング</strong>ができるサービスがありませんでした。
          </p>
          <p className="text-muted-foreground">
            この問題を解決するために本サービスを開発しました。
            「優待ありき」ではなく「生活費削減という実用性」を軸に逆引き検索できる点が、
            他にはない独自性です。
          </p>
        </section>

        {/* 運営者情報 */}
        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="font-bold text-base text-foreground">運営者について</h2>
          <div className="border border-border rounded-xl p-4 bg-card space-y-2 text-muted-foreground">
            <p>
              本サービスは<strong className="text-foreground">個人開発者が副業として運営</strong>しています。
              金融商品取引業者・投資助言業者ではありません。
            </p>
            <p>
              テック系エンジニアとして開発・運営していますが、
              金融・証券の専門家ではありません。
              あくまで情報提供を目的としたサービスであり、
              投資に関する判断はご自身の責任でお願いします。
            </p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
              <dt className="font-medium text-foreground">サイト名</dt>
              <dd>優待マッチ(yutai-match.com)</dd>
              <dt className="font-medium text-foreground">運営形態</dt>
              <dd>個人(副業として開発・運営。金融商品取引業・投資助言業の登録はありません)</dd>
              <dt className="font-medium text-foreground">担当範囲</dt>
              <dd>サイトの開発、掲載データの収集・照合・更新、お問い合わせへの対応をすべて運営者1名で行っています</dd>
              <dt className="font-medium text-foreground">連絡先</dt>
              <dd>yutaiinfoshare@gmail.com(<Link href="/contact" className="text-primary underline">お問い合わせ</Link>)</dd>
              <dt className="font-medium text-foreground">収益</dt>
              <dd>Google AdSense による広告と、証券口座の成果報酬型広告(「PR」と表示)。広告の有無で掲載内容や順位を変えることはありません</dd>
            </dl>
            <ul className="text-xs space-y-1 list-disc list-inside ml-1">
              <li>個人開発・個人運営（法人ではありません）</li>
              <li>氏名・住所等の個人情報は公開しておりません</li>
              <li>お問い合わせは<Link href="/contact" className="text-primary underline">こちら</Link>から</li>
            </ul>
          </div>
        </section>

        {/* データ品質・検証方法 */}
        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="font-bold text-base text-foreground">データ品質・検証方法</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>
              優待実施中の{DATA_STATS.active}銘柄のうち、企業のIRページ・公式優待ページ・適時開示で
              優待内容・必要株数・権利確定月・継続保有条件を確認した銘柄だけを
              <strong className="text-foreground">「✓ 検証済み」({DATA_STATS.activeVerified}銘柄)</strong>
              と表記しています。
              証券会社の優待ページでの照合のみの銘柄は、確認日があっても
              <strong className="text-foreground">（⚠ 参考情報）</strong>として扱い、検証済みの件数には含めていません。
            </p>

            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div>
                <p className="font-semibold text-xs text-foreground mb-1">✓ 検証済み（{DATA_STATS.activeVerified}銘柄）</p>
                <p className="text-xs">
                  企業のIRページ・公式優待ページ・適時開示で、公式資料に書かれている事実(優待内容・必要株数・権利確定月・継続保有条件)を確認済み。確認したページのURLと確認日を銘柄ページに表示しています。
                  年間優待価値は当サイトの換算値のため判定には含めず、公式に金額の記載がない優待は銘柄ページで「当サイトの換算ルールによる試算」と表示しています(<Link href="/method#annual-value" className="text-primary underline">算出方法</Link>)。
                </p>
              </div>
              <div className="border-t border-border pt-3">
                <p className="font-semibold text-xs text-foreground mb-1">⚠ 参考情報（{DATA_STATS.activeReference}銘柄）</p>
                <p className="text-xs">
                  証券会社の優待ページで照合した銘柄（{DATA_STATS.activeBrokerChecked}銘柄。銘柄ページに「証券会社の優待ページで照合（確認日: YYYY-MM-DD）」と表示）と、
                  確認元が記録されていない銘柄です。企業の一次情報では未確認のため、最新でない・不正確な可能性があります。
                  必ずご自身で最新情報をご確認ください。
                </p>
              </div>
            </div>

            <ul className="text-xs space-y-1">
              <li>検証済み: <strong className="text-foreground">{DATA_STATS.activeVerified}銘柄</strong></li>
              <li>参考情報: <strong className="text-foreground">{DATA_STATS.activeReference}銘柄</strong>（うち証券会社の優待ページで照合済み {DATA_STATS.activeBrokerChecked}銘柄）</li>
              <li>データ基準日: <strong className="text-foreground">{formatDate(DATA_LAST_UPDATED)}</strong></li>
            </ul>
            <p className="text-xs">
              年間優待価値・利回り・初回受取見込みの計算方法は<Link href="/method" className="text-primary underline">算出方法</Link>、
              廃止・修正の記録は<Link href="/changelog" className="text-primary underline">更新履歴</Link>をご覧ください。
              優待内容は企業の判断により予告なく変更・廃止されることがあるため、
              最新情報は必ず各企業のIRページや公式発表でご確認ください。
            </p>
          </div>
        </section>

        {/* データの収集・検証プロセス(WEEKLY_MAINTENANCE.md と scripts/ の実際の運用どおりに書く) */}
        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="font-bold text-base text-foreground">データの収集・検証の手順</h2>
          <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
            <li>
              <strong className="text-foreground">掲載する銘柄を決める</strong>: 生活の出費やよく使われるブランド・サービスとの関係がある優待実施企業を中心に、
              銘柄データ(必要株数・権利確定月・優待内容・関連ブランド・出費カテゴリ)を作成します。現在は{DATA_STATS.total}銘柄を収録し、
              うち{DATA_STATS.active}銘柄が優待実施中、{DATA_STATS.abolished}銘柄は廃止・上場廃止の記録として残しています。
            </li>
            <li>
              <strong className="text-foreground">企業の一次情報で照合する</strong>: 企業のIRページ・公式の優待案内・適時開示(TDnet)で、
              優待内容・必要株数・権利確定月・継続保有条件を確認します。確認できた銘柄は確認元を「企業IR」として、照合したページのURLと確認日を記録し、「✓ 検証済み」と表示します。
            </li>
            <li>
              <strong className="text-foreground">一次情報で確認できない銘柄</strong>: 証券会社の優待情報ページで照合し、確認元を「証券会社」として記録します。
              この場合は「⚠ 参考情報」と表示し、検証済みには数えません。公式資料に記載のない事項(継続保有の判定方法など)は推測で補わず、「確認できていない」と表示します。
            </li>
            <li>
              <strong className="text-foreground">全件の照合</strong>: 2026年11月11日に収録全銘柄を照合し直しました。適時開示(2026年8月〜11月の優待関連の開示)と証券会社の優待情報を突き合わせ、
              廃止の反映や「優待なし」の誤記の修正を行い、あわせて直近1年の株式分割・併合の開示を確認して必要株数と必要投資額を点検しました。
            </li>
            <li>
              <strong className="text-foreground">週次の自動点検</strong>: 毎週日曜21時に、全銘柄の株価の取得(必要投資額・利回りの更新)と、適時開示から「優待」を含む開示の検出を自動で行います。
              優待の内容は自動では書き換えず、検出した開示を運営者が読んで反映します。株式分割・併合を検出した銘柄は、必要株数を確認するまで株価の更新を保留します。
            </li>
            <li>
              <strong className="text-foreground">手動のローテーション確認</strong>: 自動検出では拾えない変更(「優待」という語を含まない開示や、自社サイトのみでの告知)に備えて、
              確認日の古い銘柄から順に優待制度の継続・変更を確認しています。
            </li>
            <li>
              <strong className="text-foreground">記録の公開</strong>: 反映した新設・変更・廃止と、掲載内容の修正は<Link href="/changelog" className="text-primary underline">更新履歴</Link>に日付つきで公開しています(現在{CHANGELOG.length}件)。
            </li>
          </ol>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="font-bold text-base text-foreground">更新頻度</h2>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>株価(必要投資額・優待利回り): 週1回(日曜21時の自動処理)。名古屋証券取引所のみに上場している銘柄など自動取得できない銘柄は手動で確認し、「自動更新対象外」と表示します。</li>
            <li>優待内容: 適時開示の週次検出と、確認日の古い銘柄からのローテーション確認で随時。各銘柄の確認日は銘柄ページに表示しています。</li>
            <li>銘柄ページの「初回受取見込み」「受け取るまでの流れ」: 今日の日付から計算するため、12時間ごとに再計算します。</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="font-bold text-base text-foreground">情報の限界</h2>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>確認日より後に発表された変更は、反映されるまで掲載内容と異なる場合があります。</li>
            <li>参考情報の銘柄({DATA_STATS.activeReference}銘柄)は企業の一次情報で確認していません。</li>
            <li>年間優待価値のうち{DATA_STATS.valueEstimated}銘柄は、公式資料に金額の記載がない優待を当サイトの換算ルールで試算した値です(<Link href="/method#annual-value" className="text-primary underline">算出方法</Link>)。</li>
            <li>権利付最終日は土日のみを除いた概算で、祝日・年末年始の休場日は考慮していません。</li>
            <li>優待の発送時期は、個別に記録している{YUTAI_LIST.filter((y) => hasActiveYutai(y) && y.receiptLagMonths !== undefined).length}銘柄を除き、基準日から3ヶ月後という目安で概算しています。</li>
            <li>優待券の有効期限・利用できる店舗の範囲・併用の可否などの利用条件は掲載していません。</li>
          </ul>
        </section>

        {/* プライバシー・セキュリティ */}
        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="font-bold text-base text-foreground">プライバシー・セキュリティ</h2>
          <div className="border border-border rounded-xl p-4 bg-card space-y-2 text-muted-foreground text-xs">
            <p>
              本サービスはユーザーデータを<strong className="text-foreground">ブラウザのLocalStorageのみに保存</strong>します。
              入力された出費カテゴリ・投資額・世帯構成などの情報は端末内にのみ保存され、
              サーバーに個人情報を送信することは一切ありません。
            </p>
            <ul className="space-y-1 list-disc list-inside ml-1">
              <li>メールアドレス・氏名等の個人情報の収集なし</li>
              <li>サーバーへのデータ送信なし</li>
              <li>ブラウザのLocalStorageを利用（端末ごとに独立）</li>
              <li>ブラウザの履歴消去・LocalStorage削除で完全にデータを削除できます</li>
            </ul>
            <p>
              詳細は<Link href="/privacy" className="text-primary underline">プライバシーポリシー</Link>をご覧ください。
            </p>
          </div>
        </section>

        {/* 免責事項 */}
        <section>
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-5 space-y-3">
            <h2 className="font-bold text-sm text-foreground">重要な免責事項</h2>
            <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed list-disc list-inside">
              <li>
                本サービスは<strong className="text-foreground">情報提供のみを目的</strong>としており、
                投資助言・投資勧誘ではありません。
                金融商品取引法に定める投資助言業には該当しません。
              </li>
              <li>
                個別銘柄の売買推奨・目標株価の提示・将来の投資成果の保証は行いません。
              </li>
              <li>
                <strong className="text-foreground">投資判断はご自身の責任</strong>で行ってください。
                本サービスの情報を利用した投資に伴う損益について、運営者は一切の責任を負いません。
              </li>
              <li>
                優待情報は変更・廃止される場合があります。最新情報は各企業のIR情報をご確認ください。
              </li>
              <li>
                掲載データには「参考情報（⚠）」として古い情報・推定値を含む場合があります。
                ご利用は自己責任でお願いします。
              </li>
            </ul>
          </div>
        </section>

        {/* よくある質問 */}
        <section>
          <h2 className="font-bold text-base text-foreground mb-4">よくある質問</h2>
          <div className="space-y-2">
            {ABOUT_FAQ.map(({ q, a }) => (
              <details
                key={q}
                className="border border-border rounded-xl bg-card overflow-hidden"
              >
                <summary className="px-4 py-3 text-sm font-medium text-foreground cursor-pointer select-none flex items-start gap-2 list-none [&::-webkit-details-marker]:hidden">
                  <span className="shrink-0 text-primary font-bold mt-px">Q.</span>
                  <span>{q}</span>
                </summary>
                <div className="px-4 pb-4 pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground leading-relaxed">{a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* 技術情報 */}
        <section className="space-y-2 text-sm">
          <h2 className="font-bold text-base text-foreground">技術情報</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Next.js (App Router) + TypeScript で構築。Vercel でホスティング。
            ユーザーデータはすべてブラウザ内（localStorage）に保存し、
            サーバーへの個人情報送信は行いません。
          </p>
        </section>

        {/* 関連ページ */}
        <section className="space-y-2 text-sm">
          <h2 className="font-bold text-base text-foreground">関連ページ</h2>
          <ul className="space-y-1.5">
            <li><Link href="/terms" className="text-primary underline">利用規約</Link></li>
            <li><Link href="/privacy" className="text-primary underline">プライバシーポリシー</Link></li>
            <li><Link href="/contact" className="text-primary underline">お問い合わせ</Link></li>
            <li><Link href="/stocks" className="text-primary underline">全銘柄一覧</Link></li>
            <li><Link href="/method" className="text-primary underline">算出方法</Link></li>
            <li><Link href="/guide" className="text-primary underline">株主優待のガイド</Link>(全{GUIDES.length}本)</li>
            <li><Link href="/changelog" className="text-primary underline">掲載データの更新履歴</Link></li>
          </ul>
        </section>

        <p className="text-xs text-muted-foreground pt-2">
          ページ更新日: 2026年11月18日
        </p>
      </div>
    </div>
  );
}
