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
import type { CategoryGroup } from "@/lib/matching";

function formatYen(amount: number): string {
  return amount.toLocaleString("ja-JP") + "円";
}

type Props = {
  groupedResults: CategoryGroup[];
  expenseCategoryCount: number;
};

export function ResultsClient({ groupedResults, expenseCategoryCount }: Props) {
  const perCategoryLimit = useMemo(() => {
    if (expenseCategoryCount <= 1) return 8;
    if (expenseCategoryCount === 2) return 5;
    if (expenseCategoryCount === 3) return 4;
    if (expenseCategoryCount <= 5) return 3;
    return 2;
  }, [expenseCategoryCount]);

  const hasAnyResults = groupedResults.some((g) => g.results.length > 0);

  // サマリー: 同銘柄が複数カテゴリに出てもダブルカウントしない
  const { totalSavings, totalInvestment, totalUnique } = useMemo(() => {
    const seen = new Set<string>();
    let savings = 0;
    let investment = 0;
    for (const { results } of groupedResults) {
      for (const r of results.slice(0, perCategoryLimit)) {
        if (!seen.has(r.yutai.id)) {
          seen.add(r.yutai.id);
          savings += r.annualSavings;
          investment += r.yutai.approxInvestment;
        }
      }
    }
    return { totalSavings: savings, totalInvestment: investment, totalUnique: seen.size };
  }, [groupedResults, perCategoryLimit]);

  return (
    <div className="space-y-8">
      {/* 合計サマリー */}
      {hasAnyResults && (
        <div className="space-y-2 rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            厳選{totalUnique}銘柄で削減できる見込み額
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

      {/* 全カテゴリ該当なし */}
      {!hasAnyResults && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            選んだ出費カテゴリに該当する優待銘柄が見つかりませんでした。条件を変えて再検索してみてください。
          </p>
        </div>
      )}

      {/* カテゴリ別セクション */}
      {groupedResults.map(({ category, results }) => {
        if (results.length === 0) return null;
        const topResults = results.slice(0, perCategoryLimit);
        const sectionTotal = topResults.reduce((sum, r) => sum + r.annualSavings, 0);

        return (
          <section key={category}>
            <div className="mb-4 border-b-2 border-primary pb-2">
              <h2 className="text-lg font-bold">{category}</h2>
              <p className="text-sm text-muted-foreground">
                上位{topResults.length}銘柄で年間 {formatYen(sectionTotal)} 削減見込み
              </p>
            </div>

            <ul className="space-y-3">
              {topResults.map(({ yutai, matchReason, annualSavings }, idx) => (
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
          </section>
        );
      })}

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
