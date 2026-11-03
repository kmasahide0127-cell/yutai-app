import Link from "next/link";
import { Menu } from "lucide-react";

// ヘッダーに常設する導線。「やり直す」(診断条件のリセット)は入力内容を消す操作なので
// ヘッダーには置かず、/results ページ内にだけ置く。
const NAV_ITEMS = [
  { href: "/onboarding", label: "生活から診断" },
  { href: "/expense", label: "出費カテゴリ" },
  { href: "/search", label: "商品名で探す" },
  { href: "/experiences", label: "体験から探す" },
  { href: "/stocks", label: "銘柄一覧" },
] as const;

/**
 * 高さは 65px(py-3 + h-10 + border 1px)で固定。/results のサマリーが
 * sticky top-[65px] でこの高さに依存しているため、変える場合は ResultsClient も揃えること。
 * モバイルのメニューは <details> の絶対配置パネルにして、開いてもヘッダーの高さを変えない(JS不要)。
 */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm safe-top">
      <div className="relative mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3 safe-left safe-right">
        <Link href="/" className="flex h-10 shrink-0 items-center gap-2">
          <span className="text-xl">🎁</span>
          <span className="font-bold">優待マッチ</span>
        </Link>

        <nav className="hidden items-center gap-3 md:flex" aria-label="メインナビゲーション">
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="whitespace-nowrap text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>

        <details className="group md:hidden">
          <summary
            className="flex h-10 cursor-pointer list-none items-center gap-1.5 rounded-lg px-2.5 text-xs text-muted-foreground hover:bg-muted/50 [&::-webkit-details-marker]:hidden"
            aria-label="メニューを開く"
          >
            <Menu className="h-4 w-4" />
            メニュー
          </summary>
          <nav
            className="absolute inset-x-4 top-full mt-1 rounded-xl border border-border bg-background p-2 shadow-lg"
            aria-label="メインナビゲーション(モバイル)"
          >
            <ul>
              {NAV_ITEMS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="block rounded-lg px-3 py-2.5 text-sm hover:bg-muted/50">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </details>
      </div>
    </header>
  );
}
