import Link from "next/link";
import { Search } from "lucide-react";
import { SEARCH_EXAMPLES } from "@/lib/product-search";
import { cn } from "@/lib/utils";

/**
 * 商品名・ブランド名からの逆引き検索フォーム。
 *
 * 素の GET フォームにしているのは、JS が無効でも動き Server Component から
 * そのまま置けるため。検索結果は /search?q= の Server Component 側で組み立てる。
 */
export function ProductSearchForm({
  defaultValue = "",
  className,
  showExamples = true,
}: {
  defaultValue?: string;
  className?: string;
  showExamples?: boolean;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <form action="/search" method="get" role="search" className="flex gap-2">
        <div className="relative flex-1 min-w-0">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            name="q"
            defaultValue={defaultValue}
            placeholder="商品名・ブランド名で探す(例: ReFa)"
            aria-label="商品名・ブランド名で株主優待を探す"
            className="w-full rounded-lg border border-input bg-background py-2.5 pl-9 pr-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          検索
        </button>
      </form>

      {showExamples && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">例:</span>
          {SEARCH_EXAMPLES.map((example) => (
            <Link
              key={example}
              href={`/search?q=${encodeURIComponent(example)}`}
              className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/50"
            >
              {example}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
