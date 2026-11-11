import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { AdSenseScript } from "@/components/common/AdSenseScript";
import { DATA_LAST_UPDATED, DATA_STATS } from "@/lib/yutai-data";

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
    a: "「✓ 検証済み」は、企業のIRページ・公式優待ページ・適時開示で内容を確認した銘柄です。「参考情報（⚠）」は、証券会社の優待ページでの照合のみの銘柄と、確認元が記録されていない銘柄です。証券会社の優待ページで照合した銘柄は、銘柄ページに「証券会社の優待ページで照合（確認日: YYYY-MM-DD）」と表示しています。どちらの場合も、最新情報は必ず各企業のIRページでご確認ください。",
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
              内容を確認した銘柄だけを
              <strong className="text-foreground">「✓ 検証済み」({DATA_STATS.activeVerified}銘柄)</strong>
              と表記しています。
              証券会社の優待ページでの照合のみの銘柄は、確認日があっても
              <strong className="text-foreground">（⚠ 参考情報）</strong>として扱い、検証済みの件数には含めていません。
            </p>

            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div>
                <p className="font-semibold text-xs text-foreground mb-1">✓ 検証済み（{DATA_STATS.activeVerified}銘柄）</p>
                <p className="text-xs">企業のIRページ・公式優待ページ・適時開示で内容・金額・権利確定月を確認済み。確認したページのURLと確認日を銘柄ページに表示しています。</p>
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
            <li><Link href="/changelog" className="text-primary underline">掲載データの更新履歴</Link></li>
          </ul>
        </section>

        <p className="text-xs text-muted-foreground pt-2">
          ページ更新日: 2026年11月11日
        </p>
      </div>
    </div>
  );
}
