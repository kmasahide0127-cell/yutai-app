import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ResetLink } from "@/components/ResetLink";
import { DATA_LAST_UPDATED, VERIFIED_COUNT, TOTAL_COUNT } from "@/lib/yutai-data";

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${y}年${parseInt(m)}月${parseInt(d)}日`;
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* 免責バナー */}
      <div className="w-full bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-4 py-3 text-sm">
        <div className="max-w-2xl mx-auto text-amber-900 dark:text-amber-200">
          <p className="font-semibold mb-2">⚠ ベータ版です</p>
          <ul className="text-xs space-y-1 list-disc list-inside">
            <li>本サイトは個人開発のテスト版です</li>
            <li><strong>掲載している優待情報は2026年5月27日時点のもの</strong>です。優待制度は予告なく変更・廃止される場合があります</li>
            <li>実際の優待については各企業のIRページで最新情報を必ずご確認ください</li>
            <li>本サイトは投資助言ではありません、投資判断は自己責任でお願いします</li>
            <li>本サイトの情報による損害について、運営者は一切責任を負いません</li>
          </ul>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight">優待アプリ</h1>
          <p className="text-sm text-muted-foreground mt-1">ベータ版</p>
        </header>

        <main className="text-center space-y-8">
          <p className="text-xl text-muted-foreground max-w-sm">
            あなたの生活に合う株主優待を見つけます
          </p>
          <div className="flex flex-col items-center gap-3">
            <Link href="/onboarding" className={buttonVariants({ size: "lg" })}>
              始める
            </Link>
            <ResetLink />
            <p className="text-xs text-muted-foreground text-center mt-4">
              データ最終更新: {formatDate(DATA_LAST_UPDATED)}<br />
              全{TOTAL_COUNT}銘柄（検証済み {VERIFIED_COUNT}銘柄）
            </p>
          </div>
        </main>
      </div>

      {/* フッター */}
      <footer className="mb-6 text-center text-xs text-muted-foreground">
        <div className="space-x-4">
          <Link href="/terms" className="hover:underline">利用規約</Link>
          <Link href="/privacy" className="hover:underline">プライバシーポリシー</Link>
          <a
            href="https://github.com/kmasahide0127-cell/yutai-app/issues"
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            お問い合わせ
          </a>
        </div>
        <p className="mt-2">© 2026 優待アプリ(ベータ版) | データ取得日: 2026年5月27日</p>
      </footer>
    </div>
  );
}
