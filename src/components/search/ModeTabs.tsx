import Link from "next/link";
import { cn } from "@/lib/utils";

export type SearchMode = "product" | "experience";

/**
 * 逆引きモード(商品名から探す)と体験提案モード(したい体験から探す)の
 * 切替タブ。既存の逆引きモードを壊さず共存させるための入口。
 */
export function ModeTabs({ active }: { active: SearchMode }) {
  const tabClass = (isActive: boolean) =>
    cn(
      "flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium transition-colors",
      isActive
        ? "bg-primary text-primary-foreground"
        : "bg-muted/50 text-muted-foreground hover:bg-muted"
    );

  return (
    <div className="flex gap-2" role="tablist" aria-label="優待の探し方">
      <Link
        href="/search"
        role="tab"
        aria-selected={active === "product"}
        className={tabClass(active === "product")}
      >
        🔍 商品名から探す
      </Link>
      <Link
        href="/experiences"
        role="tab"
        aria-selected={active === "experience"}
        className={tabClass(active === "experience")}
      >
        🎐 体験から探す
      </Link>
    </div>
  );
}
