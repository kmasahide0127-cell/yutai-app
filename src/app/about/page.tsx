import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { DATA_LAST_UPDATED, TOTAL_COUNT, VERIFIED_COUNT } from "@/lib/yutai-data";

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${y}年${parseInt(m)}月${parseInt(d)}日`;
}

export const metadata: Metadata = {
  title: "このサイトについて | 優待マッチ",
  description: "個人開発の株主優待マッチングサービス「優待マッチ」のデータ品質・検証方法・運営方針・免責事項について詳しく説明します。",
  alternates: {
    canonical: "/about",
  },
};

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
    a: "「検証済み」は運営者が企業のIRページを直接確認し、高い確度で内容を把握している銘柄です。「参考情報（⚠）」は過去の公開情報をもとに作成した参考データで、内容が古いまたは不正確な可能性があります。どちらの場合も、最新情報は必ず各企業のIRページでご確認ください。",
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
              全{TOTAL_COUNT}銘柄の中から、運営者が実際に企業のIRページを確認し
              内容を高い確度で把握した銘柄を
              <strong className="text-foreground">「✓ 検証済み」({VERIFIED_COUNT}銘柄)</strong>
              と表記しています。
              残りは過去の公開情報をもとにした参考データ
              <strong className="text-foreground">（⚠ 参考情報）</strong>です。
            </p>

            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div>
                <p className="font-semibold text-xs text-foreground mb-1">✓ 検証済み（{VERIFIED_COUNT}銘柄）</p>
                <p className="text-xs">企業のIRページ・公式優待ページを直接確認。内容・金額・権利確定月を精査済みです。</p>
              </div>
              <div className="border-t border-border pt-3">
                <p className="font-semibold text-xs text-foreground mb-1">⚠ 参考情報（{TOTAL_COUNT - VERIFIED_COUNT}銘柄）</p>
                <p className="text-xs">
                  過去の公開情報をもとに作成。最新でない可能性があります。
                  選択肢を広げる目的で掲載していますが、必ずご自身で最新情報をご確認ください。
                </p>
              </div>
            </div>

            <p className="text-xs">
              データ取得基準日: <strong className="text-foreground">{formatDate(DATA_LAST_UPDATED)}</strong>。
              毎週25銘柄ペースで検証・更新を進めています。
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
          </ul>
        </section>

        <p className="text-xs text-muted-foreground pt-2">
          ページ更新日: 2026年6月26日
        </p>
      </div>
    </div>
  );
}
