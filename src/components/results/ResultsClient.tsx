"use client";

import { useMemo } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MatchResultV2 } from "@/lib/matching";

function formatYen(amount: number): string {
  return amount.toLocaleString("ja-JP") + "円";
}

type Props = {
  results: MatchResultV2[];
  expenseCategoryCount: number;
};

export function ResultsClient({ results, expenseCategoryCount }: Props) {
  // annualValue === 0 の銘柄はサーバー側でも除外済みだが念のため二重フィルタ
  const validResults = useMemo(
    () => results.filter((r) => r.yutai.annualValue > 0),
    [results]
  );

  // カテゴリ数に応じた表示上限(各カテゴリ×perCategoryLimit、最大20件)
  const displayLimit = useMemo(() => {
    const perCategoryLimit =
      expenseCategoryCount <= 1 ? 5 :
      expenseCategoryCount === 2 ? 4 :
      expenseCategoryCount <= 5 ? 3 : 2;
    return Math.min(perCategoryLimit * Math.max(1, expenseCategoryCount), 20);
  }, [expenseCategoryCount]);

  const displayResults = useMemo(
    () => validResults.slice(0, displayLimit),
    [validResults, displayLimit]
  );

  // サマリーは表示銘柄のみで集計(全マッチ銘柄ではない)
  const totalSavings = useMemo(
    () => displayResults.reduce((sum, r) => sum + r.annualSavings, 0),
    [displayResults]
  );
  const totalInvestment = useMemo(
    () => displayResults.reduce((sum, r) => sum + r.yutai.approxInvestment, 0),
    [displayResults]
  );

  return (
    <div className="space-y-6">
      {/* 合計サマリー */}
      {displayResults.length > 0 && (
        <div className="space-y-2 rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            厳選{displayResults.length}銘柄で削減できる見込み額
          </p>
          <p className="text-3xl font-bold text-primary">
            年間 {formatYen(totalSavings)}
          </p>
          <p className="text-xs text-muted-foreground">
            必要投資額の合計: 約{Math.round(totalInvestment / 10000)}万円
          </p>
          <p className="text-xs text-muted-foreground text-center mt-2">
            優待情報の取得日: 2026年5月27日 | 全銘柄共通
          </p>
        </div>
      )}

      {/* 結果リスト */}
      {displayResults.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            該当する優待が見つかりませんでした。条件を変えて再検索してみてください。
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {displayResults.map(({ yutai, matchReason, annualSavings }, idx) => (
            <li key={yutai.id}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg leading-snug">{yutai.name}</CardTitle>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        証券コード {yutai.code}
                        {" · "}
                        {yutai.dataQuality === "verified" ? (
                          <span className="text-green-600 dark:text-green-400">
                            ✓ 検証済み({yutai.lastVerified.replace(/-/g, "/").slice(2)}時点)
                          </span>
                        ) : (
                          <span>⚠ 参考情報</span>
                        )}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-primary/10 px-4 py-4 text-center">
                    <p className="text-xs text-muted-foreground">年間出費削減見込み</p>
                    <p className="text-3xl font-bold text-primary">
                      {formatYen(annualSavings)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">必要投資額</p>
                      <p className="font-semibold">{formatYen(yutai.approxInvestment)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">優待利回り</p>
                      <p className="font-semibold">{yutai.yieldPercent}%</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{matchReason}</p>
                  <p className="text-sm">{yutai.description}</p>

                  <div className="flex justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                    <span>権利確定: {yutai.rightsMonths.map((m) => `${m}月`).join("・")}</span>
                    <span>取得日: {yutai.lastVerified}</span>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <div className="pb-4">
        <Link
          href="/onboarding"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
        >
          条件を変える
        </Link>
      </div>

      <footer className="mb-6 text-center text-xs text-muted-foreground">
        <div className="space-x-4">
          <Link href="/terms" className="hover:underline">利用規約</Link>
          <Link href="/privacy" className="hover:underline">プライバシーポリシー</Link>
          <a
            href="https://github.com/kmasahide0127-cell/yutai-app/issues"
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            お問い合わせ
          </a>
        </div>
        <p className="mt-2">© 2026 優待アプリ(ベータ版) | データ取得日: 2026年5月27日</p>
      </footer>
    </div>
  );
}
