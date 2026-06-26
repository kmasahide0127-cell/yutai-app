import Link from "next/link";
import type { Metadata } from "next";
import { buttonVariants } from "@/components/ui/button";
import { ResetLink } from "@/components/ResetLink";
import { DATA_LAST_UPDATED, VERIFIED_COUNT, TOTAL_COUNT } from "@/lib/yutai-data";
import { EXPENSE_CATEGORY_SLUGS } from "@/lib/matching";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "優待マッチ - 生活逆引き型 株主優待マッチング",
  description: "毎月の外食・通信費・交通費などの出費から、実生活で使える株主優待銘柄を提案。個人開発の情報提供サービスです。",
  alternates: {
    canonical: siteConfig.url,
  },
};

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${y}年${parseInt(m)}月${parseInt(d)}日`;
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* メインコンテンツ */}
      <div className="flex-1 w-full flex flex-col items-center justify-center px-4 py-12">
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight">優待マッチ</h1>
          <p className="text-base text-muted-foreground mt-2">生活逆引き型 株主優待マッチング</p>
        </header>

        <main className="text-center space-y-8 w-full max-w-2xl">
          <p className="text-xl text-muted-foreground max-w-sm mx-auto">
            あなたの生活に合う株主優待を見つけます
          </p>
          <div className="flex flex-col items-center gap-3">
            <Link href="/onboarding" className={buttonVariants({ size: "lg" })}>
              始める(無料・1分)
            </Link>
            <ResetLink />
            <p className="text-xs text-muted-foreground text-center mt-4">
              データ最終更新: {formatDate(DATA_LAST_UPDATED)}<br />
              全{TOTAL_COUNT}銘柄（検証済み {VERIFIED_COUNT}銘柄）
            </p>
          </div>

          {/* 出費カテゴリから探す(SEO内部リンク) */}
          <section className="w-full" aria-label="出費カテゴリ一覧">
            <p className="text-xs text-muted-foreground text-center mb-3">出費カテゴリから優待を探す</p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {Object.entries(EXPENSE_CATEGORY_SLUGS).map(([cat, slug]) => (
                <Link
                  key={slug}
                  href={`/expense/${slug}`}
                  className="inline-flex items-center px-2.5 py-1 rounded-md border border-border bg-card text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </section>
        </main>

        {/* サービス説明セクション(AdSense審査・Googlebot向けコンテンツ) */}
        <section className="mt-12 w-full max-w-2xl mx-auto px-4 space-y-6 text-sm leading-relaxed text-muted-foreground" aria-label="サービス説明">
          <div className="border border-border rounded-xl p-5 space-y-3 bg-card">
            <h2 className="text-base font-bold text-foreground">優待マッチとは</h2>
            <p>
              優待マッチは、あなたの毎月の生活費・出費カテゴリを入力するだけで、
              実生活で活用できる株主優待銘柄を提案する情報提供サービスです。
              「優待ありき」ではなく「生活ありき」で逆引き検索できるのが特徴です。
            </p>
            <p>
              外食・カフェ代、通信費、日用品・ドラッグストア代、旅行費、趣味・ガジェット代など、
              毎月かかる出費カテゴリを選ぶと、その出費を実質削減できる優待銘柄が見つかります。
              予算(投資可能額)や世帯人数に応じた絞り込みにも対応しています。
            </p>
          </div>

          <div className="border border-border rounded-xl p-5 space-y-3 bg-card">
            <h2 className="text-base font-bold text-foreground">こんな方に活用いただけます</h2>
            <ul className="space-y-1.5 list-disc list-inside ml-1">
              <li>外食・カフェをよく利用する方(食事券系の優待)</li>
              <li>スーパー・コンビニの食材費を抑えたい方(食品系の優待)</li>
              <li>通信費・携帯代を節約したい方(通信会社系の優待)</li>
              <li>旅行・交通費をお得にしたい方(鉄道・旅行系の優待)</li>
              <li>子育て費・教育費をサポートしたい方(玩具・教育系の優待)</li>
              <li>趣味・ガジェットに出費が多い方(家電・ホビー系の優待)</li>
            </ul>
          </div>

          <div className="border border-border rounded-xl p-5 space-y-3 bg-card">
            <h2 className="text-base font-bold text-foreground">掲載データについて</h2>
            <p>
              本サービスには{TOTAL_COUNT}銘柄の株主優待情報を収録しています(うち{VERIFIED_COUNT}銘柄は運営者が内容を精査した「検証済み」銘柄)。
              データ取得基準日は{formatDate(DATA_LAST_UPDATED)}です。
              株主優待制度は企業の判断により予告なく変更・廃止されることがあるため、
              最新情報は必ず各企業のIRページや公式発表でご確認ください。
            </p>
            <p>
              本サービスは<strong className="text-foreground">情報提供のみを目的</strong>としており、
              投資助言・投資勧誘にはあたりません。
              個別銘柄の売買推奨・目標株価の提示は行いません。
              投資判断はご自身の責任でお願いします。
            </p>
          </div>

          <div className="text-center pt-2">
            <Link href="/stocks" className="text-primary underline text-xs hover:opacity-80">
              全{TOTAL_COUNT}銘柄の一覧を見る →
            </Link>
          </div>
        </section>
      </div>

      {/* フッター */}
      <footer className="mt-12 mb-6 text-center text-xs text-muted-foreground space-y-3 max-w-2xl mx-auto px-4">
        <p className="leading-relaxed">
          本サイトは個人開発による情報提供サイトです。優待情報は{formatDate(DATA_LAST_UPDATED)}時点のもので、最新でない可能性があります。
          投資判断はご自身の責任でお願いします。詳細は<Link href="/terms" className="underline">利用規約</Link>をご確認ください。
        </p>
        <nav aria-label="フッターナビゲーション">
          <div className="space-x-4">
            <Link href="/stocks" className="hover:underline">銘柄一覧</Link>
            <Link href="/about" className="hover:underline">このサイトについて</Link>
            <Link href="/contact" className="hover:underline">お問い合わせ</Link>
            <Link href="/terms" className="hover:underline">利用規約</Link>
            <Link href="/privacy" className="hover:underline">プライバシーポリシー</Link>
          </div>
        </nav>
        <p>© 2026 優待マッチ | データ取得日: {formatDate(DATA_LAST_UPDATED)}</p>
      </footer>
    </div>
  );
}
