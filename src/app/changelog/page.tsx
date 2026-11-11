import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { AdSenseScript } from "@/components/common/AdSenseScript";
import { CHANGELOG, groupChangelogByDate, type ChangelogKind } from "@/lib/changelog-data";
import { buildPageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata = buildPageMetadata({
  title: "掲載データの更新履歴",
  description:
    "優待マッチの掲載データの更新履歴。株主優待の新設・変更・廃止、上場廃止、掲載停止・修正した銘柄を日付ごとに記録しています。",
  path: "/changelog",
});

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${y}年${Number(m)}月${Number(d)}日`;
}

const KIND_STYLE: Record<ChangelogKind, string> = {
  新設: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  変更: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  廃止: "bg-muted text-muted-foreground",
  上場廃止: "bg-muted text-muted-foreground",
  掲載停止: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  修正: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  追加: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
};

export default function ChangelogPage() {
  const groups = groupChangelogByDate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <AdSenseScript />
      <div className="mx-auto max-w-2xl min-w-0 space-y-8 px-4 py-8">
        <nav className="text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">トップ</Link>
          <span className="mx-2">›</span>
          <span>更新履歴</span>
        </nav>

        <header className="space-y-2">
          <h1 className="text-2xl font-bold">掲載データの更新履歴</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            株主優待の新設・変更・廃止、上場廃止、当サイトの誤りの修正や掲載停止を、
            データに反映した日付ごとに記録しています(全{CHANGELOG.length}件)。
            制度の廃止日・上場廃止日など出来事の日付は各項目の本文に記載しています。
          </p>
        </header>

        {groups.map(({ date, items }) => (
          <section key={date} className="space-y-2" aria-labelledby={`log-${date}`}>
            <h2 id={`log-${date}`} className="text-base font-bold">
              {formatDate(date)}
              <span className="ml-2 text-xs font-normal text-muted-foreground">{items.length}件</span>
            </h2>
            <ul className="space-y-2">
              {/* 同じ日に同じ銘柄・種類の記録が複数あり得るため、キーに位置も含める */}
              {items.map((e, i) => (
                <li key={`${e.code}-${e.kind}-${i}`} className="rounded-lg border border-border bg-card p-3 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", KIND_STYLE[e.kind])}>
                      {e.kind}
                    </span>
                    {e.hasPage ? (
                      <Link href={`/stocks/${e.code}`} className="text-sm font-medium underline">
                        {e.name}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium">{e.name}</span>
                    )}
                    {e.code && <span className="text-xs tabular-nums text-muted-foreground">({e.code})</span>}
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{e.detail}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="space-y-1 border-t border-border pt-4 text-xs text-muted-foreground">
          <p>
            ※ 掲載データの算出方法は<Link href="/method" className="underline">算出方法</Link>をご覧ください。
            誤りのご報告は<Link href="/contact" className="underline">お問い合わせ</Link>からお願いします。
          </p>
          <p>
            ※ 本ページは参考情報であり、投資勧誘ではありません。投資判断はご自身の責任でお願いします
            (<Link href="/terms" className="underline">利用規約</Link>)。
          </p>
        </section>
      </div>
    </div>
  );
}
