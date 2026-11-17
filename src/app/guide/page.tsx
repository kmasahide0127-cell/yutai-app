import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { AdSenseScript } from "@/components/common/AdSenseScript";
import { buildPageMetadata } from "@/lib/seo";
import { GUIDES } from "@/lib/guides";
import { DATA_STATS } from "@/lib/yutai-data";

export const metadata = buildPageMetadata({
  title: "株主優待のガイド",
  description:
    "株主優待の始め方、権利付最終日と継続保有条件の仕組み、権利確定月の分散、情報の確かめ方、優待の変更・廃止の実例を、優待マッチの掲載データをもとに解説する記事の一覧です。",
  path: "/guide",
});

export default function GuideIndexPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <AdSenseScript />
      <div className="mx-auto max-w-2xl min-w-0 space-y-8 px-4 py-8">
        <nav className="text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">トップ</Link>
          <span className="mx-2">›</span>
          <span>ガイド</span>
        </nav>
        <header className="space-y-2">
          <h1 className="text-2xl font-bold">株主優待のガイド</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            当サイトに掲載している優待実施中の{DATA_STATS.active}銘柄のデータと、銘柄ページ・算出方法・更新履歴の内容をもとに、
            株主優待を受け取るまでの仕組みと、情報を確かめる方法をまとめた読み物です。
            記事中の件数・金額・日付は掲載データから算出しており、データの更新に合わせて変わります。
          </p>
        </header>
        <ol className="space-y-3">
          {GUIDES.map((g, i) => (
            <li key={g.slug}>
              <Link
                href={`/guide/${g.slug}`}
                className="block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
              >
                <p className="text-xs text-muted-foreground">ガイド {i + 1}</p>
                <h2 className="mt-1 text-base font-bold leading-snug">{g.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{g.description}</p>
              </Link>
            </li>
          ))}
        </ol>
        <section className="space-y-2 text-sm">
          <h2 className="text-base font-bold">あわせて読む</h2>
          <ul className="space-y-1.5">
            <li><Link href="/method" className="text-primary underline">算出方法</Link><span className="text-xs text-muted-foreground"> — 年間優待価値・利回り・初回受取見込みの計算</span></li>
            <li><Link href="/changelog" className="text-primary underline">更新履歴</Link><span className="text-xs text-muted-foreground"> — 優待の新設・変更・廃止とデータ修正の記録</span></li>
            <li><Link href="/about" className="text-primary underline">このサイトについて</Link><span className="text-xs text-muted-foreground"> — 運営者とデータの収集・検証の手順</span></li>
          </ul>
        </section>
        <p className="border-t border-border pt-4 text-xs text-muted-foreground">
          ※ 各記事は情報提供を目的としたもので、特定の銘柄の売買を勧めるものではありません。投資判断はご自身の責任でお願いします。
        </p>
      </div>
    </div>
  );
}
