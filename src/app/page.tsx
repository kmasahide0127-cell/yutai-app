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
      {/* メインコンテンツ */}
      <div className="flex-1 w-full flex flex-col items-center justify-center px-4 py-12">
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
      <footer className="mt-12 mb-6 text-center text-xs text-muted-foreground space-y-3 max-w-2xl mx-auto px-4">
        <p className="leading-relaxed">
          本サイトは個人開発のベータ版です。優待情報は2026年5月27日時点のもので、最新でない可能性があります。
          投資判断はご自身の責任でお願いします。詳細は<Link href="/terms" className="underline">利用規約</Link>をご確認ください。
        </p>
        <div className="space-x-4">
          <Link href="/stocks" className="hover:underline">銘柄一覧</Link>
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
        <p>© 2026 優待アプリ(ベータ版) | データ取得日: 2026年5月27日</p>
      </footer>
    </div>
  );
}
