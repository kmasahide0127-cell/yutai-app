import Link from "next/link";
import type { Yutai } from "@/lib/yutai-data";
import {
  getAbolishedNotice,
  isAbolished,
  type FirstReceiptEstimate,
} from "@/lib/product-search";
import { cn } from "@/lib/utils";

/** 廃止済み銘柄のバッジ。一覧・検索結果で active と視覚的に区別するために使う */
export function AbolishedBadge() {
  return (
    <span className="inline-flex shrink-0 items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      廃止
    </span>
  );
}

/** 初回受取見込み時期の一文。継続保有要件がある銘柄は記録の積み上げも添える */
export function FirstReceiptNote({
  estimate,
  yutai,
  className,
}: {
  estimate: FirstReceiptEstimate;
  yutai: Yutai;
  className?: string;
}) {
  const recordFlow = estimate.recordDates
    .map((d) => `${d.year}年${d.month}月末`)
    .join(" → ");

  return (
    <div className={cn("space-y-1 text-xs", className)}>
      <p className="font-medium text-foreground">🗓 {estimate.label}</p>
      {estimate.requiredRecords > 1 && (
        <p className="text-muted-foreground">
          継続保有要件: {yutai.minShares}株以上を株主名簿に連続
          {estimate.requiredRecords}回記録({recordFlow})
        </p>
      )}
      {estimate.missedCurrentCycle && (
        <p className="text-muted-foreground">
          ※ 今月の権利付最終日を過ぎているため、次の基準日を起点に計算しています
        </p>
      )}
    </div>
  );
}

/**
 * 検索結果・一覧で使う銘柄カード。
 * 廃止済みは非表示にせず、枠線を破線・文字を淡色にしてバッジと廃止文言で区別する。
 */
export function StockResultCard({
  yutai,
  firstReceipt,
  matchedTerms,
  showFirstReceipt = true,
}: {
  yutai: Yutai;
  firstReceipt?: FirstReceiptEstimate | null;
  matchedTerms?: string[];
  showFirstReceipt?: boolean;
}) {
  const abolished = isAbolished(yutai);
  const abolishedNotice = getAbolishedNotice(yutai);

  return (
    <Link
      href={`/stocks/${yutai.code}`}
      className={cn(
        "block rounded-lg border p-3 transition-colors",
        abolished
          ? "border-dashed border-border bg-muted/30 hover:bg-muted/50"
          : "border-border bg-card hover:bg-muted/50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={cn(
                "text-sm font-medium",
                abolished && "text-muted-foreground"
              )}
            >
              {yutai.name}
            </p>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              ({yutai.code})
            </span>
            {abolished && <AbolishedBadge />}
          </div>

          {abolished ? (
            <p className="text-xs font-medium text-muted-foreground">
              株主優待は{abolishedNotice}
              {yutai.abolishedNote ? `(${yutai.abolishedNote})` : ""}
            </p>
          ) : (
            <p className="text-xs tabular-nums text-muted-foreground">
              年間 {yutai.annualValue.toLocaleString()}円相当 / 必要投資額 約
              {yutai.approxInvestment.toLocaleString()}円 / 利回り {yutai.yieldPercent}%
            </p>
          )}

          {matchedTerms && matchedTerms.length > 0 && (
            <p className="text-xs text-muted-foreground">
              一致: {matchedTerms.slice(0, 4).join("・")}
            </p>
          )}

          {showFirstReceipt && firstReceipt && (
            <FirstReceiptNote
              estimate={firstReceipt}
              yutai={yutai}
              className="pt-1"
            />
          )}
        </div>
      </div>
    </Link>
  );
}
