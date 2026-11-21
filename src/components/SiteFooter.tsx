import Link from "next/link";
import { DATA_LAST_UPDATED } from "@/lib/yutai-data";

// 全ページ共通のフッター。ルートレイアウトに置き、どのページからも
// 運営情報(このサイトについて・お問い合わせ)と規約類(利用規約・プライバシーポリシー)、
// 解説コンテンツ(算出方法・更新履歴)へ辿れるようにする。
// 以前はトップと診断結果ページにだけ個別のフッターがあり、銘柄ページ・カテゴリページからは辿れなかった。
const FOOTER_LINKS = [
  { href: "/stocks", label: "銘柄一覧" },
  { href: "/expense", label: "出費カテゴリ" },
  { href: "/guide", label: "ガイド" },
  { href: "/method", label: "算出方法" },
  { href: "/changelog", label: "更新履歴" },
  { href: "/about", label: "このサイトについて" },
  { href: "/contact", label: "お問い合わせ" },
  { href: "/terms", label: "利用規約" },
  { href: "/privacy", label: "プライバシーポリシー" },
] as const;

function formatJapaneseDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${y}年${Number(m)}月${Number(d)}日`;
}

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-8 max-w-2xl space-y-3 border-t border-border px-4 pt-6 pb-8 text-center text-xs text-muted-foreground">
      <p className="leading-relaxed">
        本サービスは情報提供を目的としており、投資判断はご自身の責任でお願いします。ご利用にあたっては
        <Link href="/terms" className="underline">利用規約</Link>をご確認ください。
      </p>
      <nav aria-label="フッターナビゲーション">
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {FOOTER_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link prefetch={false} href={href} className="hover:underline">{label}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <p>© 2026 優待マッチ | データ取得日: {formatJapaneseDate(DATA_LAST_UPDATED)}</p>
    </footer>
  );
}
