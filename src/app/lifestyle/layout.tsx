import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

// 検索結果には出さないが、既存リンクからの到達先としてページは残す。
// title はルートの template がサイト名を付けるのでページ名のみ(付けると二重になる)。
export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "生活スタイル診断",
    description: "使っているブランドやライフスタイルから、合う株主優待を見つけます。",
    path: "/lifestyle",
  }),
  robots: { index: false, follow: true },
};

export default function LifestyleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
