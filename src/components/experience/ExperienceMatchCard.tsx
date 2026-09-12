import Link from "next/link";
import type { ExperienceMatch } from "@/lib/experience-matching";
import { cn } from "@/lib/utils";

/**
 * 体験提案モードの銘柄カード。
 * 1回あたりの割引額・投資効率・(投資可能額入力時のみ)到達可否を表示する。
 */
export function ExperienceMatchCard({ match }: { match: ExperienceMatch }) {
  const { yutai, discountAmount, discountRate, efficiency, reachable } = match;

  return (
    <Link
      href={`/stocks/${yutai.code}`}
      className={cn(
        "block rounded-lg border p-3 transition-colors",
        reachable === false
          ? "border-dashed border-border bg-muted/30 hover:bg-muted/50"
          : "border-border bg-card hover:bg-muted/50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">{yutai.name}</p>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              ({yutai.code})
            </span>
            {reachable === true && (
              <span className="inline-flex shrink-0 items-center rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                届く特典
              </span>
            )}
            {reachable === false && (
              <span className="inline-flex shrink-0 items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                届かない特典
              </span>
            )}
          </div>

          <p className="text-xs tabular-nums text-muted-foreground">
            必要投資額 約{yutai.approxInvestment.toLocaleString()}円 / 年間優待価値{" "}
            {yutai.annualValue.toLocaleString()}円相当
          </p>

          <p className="text-xs">
            🎯 1回あたりの割引額 約{discountAmount.toLocaleString()}円(割引率目安{" "}
            {Math.round(discountRate * 100)}%) / 投資効率{" "}
            {(efficiency * 100).toFixed(2)}%
          </p>

          <p className="text-xs leading-relaxed text-muted-foreground">
            {yutai.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
