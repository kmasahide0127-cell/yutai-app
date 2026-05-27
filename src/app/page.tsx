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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">優待アプリ</h1>
        <p className="text-sm text-muted-foreground mt-1">（仮称）</p>
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
  );
}
