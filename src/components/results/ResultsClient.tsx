"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { MatchResultV2 } from "@/lib/matching";

function scoreLabel(score: number): { text: string; className: string } {
  if (score >= 70)
    return {
      text: `${score}点`,
      className:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    };
  if (score >= 40)
    return {
      text: `${score}点`,
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    };
  return {
    text: `${score}点`,
    className: "bg-muted text-muted-foreground",
  };
}

function formatYen(amount: number): string {
  return amount.toLocaleString("ja-JP") + "円";
}

function formatRightsMonths(months: number[]): string {
  return months.map((m) => `${m}月`).join("・");
}

type Props = {
  results: MatchResultV2[];
  totalSavings: number;
  totalInvestment: number;
};

export function ResultsClient({ results, totalSavings, totalInvestment }: Props) {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [brandSearch, setBrandSearch] = useState("");

  const allBrands = useMemo(() => {
    const set = new Set<string>();
    for (const r of results) {
      for (const b of r.yutai.brands) set.add(b);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ja"));
  }, [results]);

  const filteredBrands = useMemo(
    () =>
      brandSearch.trim()
        ? allBrands.filter((b) => b.includes(brandSearch.trim()))
        : allBrands,
    [allBrands, brandSearch]
  );

  const displayResults = useMemo(() => {
    if (selectedBrands.length === 0) return results;
    const matching = results.filter((r) =>
      r.yutai.brands.some((b) => selectedBrands.includes(b))
    );
    const others = results.filter(
      (r) => !r.yutai.brands.some((b) => selectedBrands.includes(b))
    );
    return [...matching, ...others];
  }, [results, selectedBrands]);

  const toggleBrand = (brand: string) =>
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );

  const matchingCount =
    selectedBrands.length > 0
      ? results.filter((r) => r.yutai.brands.some((b) => selectedBrands.includes(b))).length
      : null;

  return (
    <div className="space-y-6">
      {/* 合計サマリー */}
      {results.length > 0 && (
        <div className="space-y-2 rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            推奨優待で削減できる見込み額
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

      {/* ブランド絞り込み */}
      {results.length > 0 && allBrands.length > 0 && (
        <details className="overflow-hidden rounded-xl border border-border">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-medium hover:bg-muted/50">
            <span className="text-sm">
              ブランドで絞り込む
              {selectedBrands.length > 0 && (
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  {selectedBrands.length}件選択中
                  {matchingCount !== null && ` · ${matchingCount}銘柄がトップに`}
                </span>
              )}
            </span>
            <span className="text-xs text-muted-foreground">▼</span>
          </summary>
          <div className="border-t border-border p-4 space-y-3">
            <input
              type="text"
              placeholder="ブランド名で検索..."
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {selectedBrands.length > 0 && (
              <button
                onClick={() => setSelectedBrands([])}
                className="text-xs text-muted-foreground hover:underline"
              >
                選択をクリア
              </button>
            )}
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {filteredBrands.map((brand) => (
                <label
                  key={brand}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/50"
                >
                  <Checkbox
                    checked={selectedBrands.includes(brand)}
                    onCheckedChange={() => toggleBrand(brand)}
                  />
                  <span className="text-xs leading-tight">{brand}</span>
                </label>
              ))}
            </div>
            {filteredBrands.length === 0 && (
              <p className="text-xs text-muted-foreground">「{brandSearch}」に一致するブランドがありません</p>
            )}
          </div>
        </details>
      )}

      {/* 結果リスト */}
      {results.length === 0 ? (
        <div className="space-y-2 rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            該当する優待が見つかりませんでした。条件を変えて再検索してみてください。
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {displayResults.map(({ yutai, score, matchReason, annualSavings }, idx) => {
            const badge = scoreLabel(score);
            const isBoosted =
              selectedBrands.length > 0 &&
              yutai.brands.some((b) => selectedBrands.includes(b));
            const isDivider =
              selectedBrands.length > 0 &&
              matchingCount !== null &&
              idx === matchingCount;
            return (
              <li key={yutai.id}>
                {isDivider && (
                  <div className="flex items-center gap-2 py-2">
                    <hr className="flex-1 border-border" />
                    <span className="text-xs text-muted-foreground">その他の銘柄</span>
                    <hr className="flex-1 border-border" />
                  </div>
                )}
                <Card className={isBoosted ? "ring-1 ring-primary/30" : undefined}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle>{yutai.name}</CardTitle>
                          {yutai.dataQuality === "verified" ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              ✓ 検証済み(
                              {yutai.lastVerified.replace(/-/g, "/").slice(2)}
                              時点)
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                              ⚠ 参考情報
                            </span>
                          )}
                        </div>
                        <CardDescription>証券コード {yutai.code}</CardDescription>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}
                      >
                        {badge.text}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{matchReason}</p>
                    <p className="text-sm">{yutai.description}</p>
                    <div className="rounded-lg bg-primary/5 px-4 py-3">
                      <p className="text-xs text-muted-foreground">年間出費削減見込み</p>
                      <p className="text-xl font-bold text-primary">
                        {formatYen(annualSavings)}
                      </p>
                    </div>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
                      <div>
                        <dt className="text-xs text-muted-foreground">必要投資額</dt>
                        <dd className="font-medium">{formatYen(yutai.approxInvestment)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">優待利回り</dt>
                        <dd className="font-medium">{yutai.yieldPercent}%</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">権利確定月</dt>
                        <dd className="font-medium">
                          {formatRightsMonths(yutai.rightsMonths)}
                        </dd>
                      </div>
                    </dl>
                    <p className="text-xs text-muted-foreground">
                      ※ 優待情報取得日: {yutai.lastVerified} | 最新情報は企業IRページで要確認
                    </p>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <div className="pb-4">
        <Link
          href="/onboarding"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "w-full"
          )}
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
