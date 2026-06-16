"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { YUTAI_LIST } from "@/lib/yutai-data";
import type { Yutai } from "@/lib/yutai-data";
import {
  resolveHoldings,
  analyzeRightsMonthGaps,
  analyzeCategoryBias,
  analyzeRedundancy,
  suggestForGaps,
  type ResolvedHolding,
  type RightsMonthGapAnalysis,
  type CategoryBiasAnalysis,
  type RedundancyAnalysis,
  type GapSuggestions,
} from "@/lib/portfolio";
import { cn } from "@/lib/utils";

type HeldItem = {
  input: string;
  resolved: ResolvedHolding;
};

type AnalysisResult = {
  resolvedList: ResolvedHolding[];
  monthGaps: RightsMonthGapAnalysis;
  categoryBias: CategoryBiasAnalysis;
  redundancy: RedundancyAnalysis;
  gaps: GapSuggestions;
};

function formatMan(amount: number): string {
  const man = Math.round(amount / 10000);
  return `約${man.toLocaleString()}万円`;
}

function searchYutai(query: string): Yutai[] {
  const lower = query.toLowerCase();
  return YUTAI_LIST.filter(
    (y) =>
      y.name.toLowerCase().includes(lower) ||
      y.code.includes(lower) ||
      y.brands.some((b) => b.toLowerCase().includes(lower))
  ).slice(0, 8);
}

// ── 候補銘柄のコンパクトカード ────────────────────────────────────────────

function SuggestionCard({ yutai }: { yutai: Yutai }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5 space-y-1">
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground w-10 shrink-0">{yutai.code}</span>
        <span className="text-sm font-medium flex-1 truncate">{yutai.name}</span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 pl-12">{yutai.description}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 pl-12 text-xs text-muted-foreground">
        <span>権利確定: {yutai.rightsMonths.map((m) => `${m}月`).join("・")}</span>
        <span>必要投資額: {formatMan(yutai.approxInvestment)}</span>
      </div>
    </div>
  );
}

// ── 分析結果ビュー ────────────────────────────────────────────────────────

function AnalysisResultView({ result }: { result: AnalysisResult }) {
  const { resolvedList, monthGaps, categoryBias, redundancy, gaps } = result;

  const foundCount = resolvedList.filter((h) => h.found).length;
  const notFoundList = resolvedList.filter((h) => !h.found);
  const coveredSet = new Set(monthGaps.coveredMonths);
  const topCategories = categoryBias.dominantCategories.slice(0, 5);

  // 月→候補銘柄のマップ(全空き月を含む)
  const emptyMonthMap = new Map(gaps.forEmptyMonths.map((e) => [e.month, e.suggestions]));

  // 候補なしの空き月(カレンダー下部にまとめて正直表示)
  const noSuggestionMonths = gaps.forEmptyMonths
    .filter((e) => e.suggestions.length === 0)
    .map((e) => e.month);

  // 提案: 提案があるカテゴリのみ・最大4カテゴリ
  const categorySuggestions = gaps.forMissingCategories
    .filter((c) => c.suggestions.length > 0)
    .slice(0, 4);

  return (
    <div className="space-y-8">

      {/* セクション0: 入力サマリー */}
      <div className="rounded-lg border border-border bg-card px-4 py-3 space-y-1.5">
        <p className="text-sm font-medium">
          {resolvedList.length}銘柄を入力 — データ収録: {foundCount}件 / 分析対象外: {notFoundList.length}件
        </p>
        {notFoundList.length > 0 && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            分析対象外: {notFoundList.map((h) => `「${h.input}」`).join("・")}
            （優待データに収録されていない銘柄のため除外しています）
          </p>
        )}
        {foundCount === 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            データ収録銘柄がないため、分析を表示できません。銘柄名・証券コードで再入力してみてください。
          </p>
        )}
      </div>

      {foundCount > 0 && (
        <>
          {/* セクション1: 権利確定月の分布 */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold border-b border-border pb-2">権利確定月の分布</h2>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
                const covered = coveredSet.has(m);
                return (
                  <div
                    key={m}
                    className={cn(
                      "rounded py-2 text-center text-xs font-medium",
                      covered
                        ? "bg-primary/15 text-foreground"
                        : "bg-muted/40 text-muted-foreground"
                    )}
                  >
                    {m}月
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {monthGaps.coveredMonths.length === 0
                ? "カバーされている月がありません。"
                : monthGaps.coveredMonths.length === 12
                ? "12ヶ月すべてカバーされています。"
                : (() => {
                    const covered = monthGaps.coveredMonths.map((m) => `${m}月`).join("・");
                    const empty = monthGaps.emptyMonths.map((m) => `${m}月`).join("・");
                    return `${covered}に権利確定が集中しています。${empty}はカバーされていません。`;
                  })()}
            </p>
          </section>

          {/* セクション2: ジャンルの傾向 */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold border-b border-border pb-2">ジャンルの傾向</h2>
            {topCategories.length > 0 ? (
              <>
                <div className="space-y-1.5">
                  {topCategories.map(({ category, count }) => (
                    <div
                      key={category}
                      className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2"
                    >
                      <span className="text-sm flex-1">{category}</span>
                      <span className="text-xs text-muted-foreground">{count}銘柄</span>
                    </div>
                  ))}
                  {categoryBias.dominantCategories.length > 5 && (
                    <p className="text-xs text-muted-foreground pl-1">
                      ほか{categoryBias.dominantCategories.length - 5}ジャンル
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {categoryBias.missingCategories.length > 0
                    ? `収録銘柄の中でまだ手元にないジャンルが${categoryBias.missingCategories.length}カテゴリあります。`
                    : "保有銘柄で収録中のジャンルをすべてカバーしています。"}
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">ジャンル情報が取得できませんでした。</p>
            )}
          </section>

          {/* セクション3: 同ジャンル重複（重複がある場合のみ表示） */}
          {redundancy.redundantGroups.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold border-b border-border pb-2">同ジャンルの重複（参考）</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                同じジャンルに複数の銘柄があります。良し悪しの判断ではなく、傾向の確認としてご参照ください。
              </p>
              <div className="space-y-2">
                {redundancy.redundantGroups.map(({ category, yutaiNames }) => (
                  <div
                    key={category}
                    className="rounded-lg border border-border bg-card px-3 py-2.5"
                  >
                    <p className="text-xs text-muted-foreground">{category}</p>
                    <p className="text-sm mt-0.5">{yutaiNames.join("・")}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* セクション4: 穴を埋める候補 — 年間カレンダー形式 */}
          {(monthGaps.emptyMonths.length > 0 || categorySuggestions.length > 0) && (
            <section className="space-y-5">
              <div className="border-b border-border pb-2">
                <h2 className="text-sm font-semibold">穴を埋める候補</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  空き月・不足ジャンルに該当する銘柄の候補です。投資の判断はご自身でお願いします。
                </p>
              </div>

              {/* 年間カレンダーグリッド */}
              {monthGaps.emptyMonths.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground">空き月のカレンダー</p>

                  {/* 4列×3行グリッド */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
                      const isHeld = coveredSet.has(m);
                      const candidates = emptyMonthMap.get(m);
                      const hasCandidate = !isHeld && candidates !== undefined && candidates.length > 0;

                      return (
                        <div
                          key={m}
                          className={cn(
                            "rounded py-2 px-1 text-center space-y-0.5",
                            isHeld
                              ? "bg-primary/15 text-foreground"
                              : hasCandidate
                              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200"
                              : "bg-muted/40 text-muted-foreground"
                          )}
                        >
                          <p className="text-xs font-medium">{m}月</p>
                          <p className={cn(
                            "text-[10px] leading-none",
                            isHeld
                              ? "text-foreground/60"
                              : hasCandidate
                              ? "text-amber-700 dark:text-amber-300"
                              : "text-muted-foreground/60"
                          )}>
                            {isHeld ? "保有" : hasCandidate ? `候補${candidates!.length}件` : "—"}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* 凡例 */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-3 h-3 rounded bg-primary/15" />
                      保有済み
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-3 h-3 rounded bg-amber-100 dark:bg-amber-900/30" />
                      候補あり
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-3 h-3 rounded bg-muted/40" />
                      候補なし
                    </span>
                  </div>

                  {/* 月別候補詳細(候補がある月のみ展開) */}
                  <div className="space-y-4 pt-1">
                    {gaps.forEmptyMonths
                      .filter((e) => e.suggestions.length > 0)
                      .map(({ month, suggestions }) => (
                        <div key={month} className="space-y-2">
                          <p className="text-xs font-medium">{month}月の空きを埋める候補</p>
                          <div className="space-y-1.5">
                            {suggestions.map((y) => (
                              <SuggestionCard key={y.code} yutai={y} />
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* 候補なし月をまとめて正直に表示 */}
                  {noSuggestionMonths.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {noSuggestionMonths.map((m) => `${m}月`).join("・")}:
                      {" "}この月に該当する優待データはありません
                    </p>
                  )}
                </div>
              )}

              {/* 不足ジャンルの候補 */}
              {categorySuggestions.length > 0 && (
                <div className="space-y-4">
                  <p className="text-xs font-medium text-muted-foreground">不足ジャンルの候補</p>
                  {categorySuggestions.map(({ category, suggestions }) => (
                    <div key={category} className="space-y-2">
                      <p className="text-xs font-medium">{category}</p>
                      <div className="space-y-1.5">
                        {suggestions.map((y) => (
                          <SuggestionCard key={y.code} yutai={y} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* フッター注記 */}
          <p className="text-xs text-muted-foreground">
            ※ 優待情報は2026年5月27日時点。内容は各企業のIRページで必ずご確認ください。
          </p>
        </>
      )}
    </div>
  );
}

// ── メインページ ──────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const [query, setQuery] = useState("");
  const [held, setHeld] = useState<HeldItem[]>([]);
  const [suggestions, setSuggestions] = useState<Yutai[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim()) {
      setSuggestions(searchYutai(query));
      setShowDropdown(true);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (analysisResult) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }, [analysisResult]);

  const isAlreadyHeld = useCallback(
    (code: string) => held.some((h) => h.resolved.found && h.resolved.yutai?.code === code),
    [held]
  );

  function addByYutai(yutai: Yutai) {
    if (isAlreadyHeld(yutai.code)) return;
    setHeld((prev) => [
      ...prev,
      { input: yutai.name, resolved: { input: yutai.name, found: true, yutai } },
    ]);
    setQuery("");
    setShowDropdown(false);
    inputRef.current?.focus();
  }

  function addByFreeText(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const [resolved] = resolveHoldings([trimmed]);
    if (resolved.found && resolved.yutai && isAlreadyHeld(resolved.yutai.code)) return;
    if (!resolved.found && held.some((h) => !h.resolved.found && h.input === trimmed)) return;
    setHeld((prev) => [...prev, { input: trimmed, resolved }]);
    setQuery("");
    setShowDropdown(false);
    inputRef.current?.focus();
  }

  function remove(index: number) {
    setHeld((prev) => prev.filter((_, i) => i !== index));
    setAnalysisResult(null);
  }

  function analyze() {
    const resolvedList = held.map((h) => h.resolved);
    const monthGaps = analyzeRightsMonthGaps(resolvedList);
    const categoryBias = analyzeCategoryBias(resolvedList);
    const redundancy = analyzeRedundancy(resolvedList);
    const gaps = suggestForGaps(resolvedList, YUTAI_LIST);
    setAnalysisResult({ resolvedList, monthGaps, categoryBias, redundancy, gaps });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="px-4 py-8 pb-20">
        <div className="mx-auto max-w-2xl space-y-6">

          {/* ヘッダー */}
          <div className="space-y-2">
            <Link href="/" className="text-xs text-muted-foreground hover:underline">
              ← トップに戻る
            </Link>
            <h1 className="text-xl font-bold">保有株を分析する</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              お持ちの株を入力すると、優待の偏りや、まだ手をつけていないジャンルを分析します。
              主要な2〜3銘柄だけでも分析できます。
            </p>
          </div>

          {/* 銘柄入力 */}
          <div className="space-y-2">
            <p className="text-sm font-medium">銘柄を追加</p>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && query.trim()) {
                    if (suggestions.length > 0) {
                      addByYutai(suggestions[0]);
                    } else {
                      addByFreeText(query);
                    }
                  }
                  if (e.key === "Escape") {
                    setShowDropdown(false);
                  }
                }}
                onFocus={() => {
                  if (query.trim()) setShowDropdown(true);
                }}
                placeholder="銘柄名・証券コードで検索(例: すかい、4755)"
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              />

              {/* オートコンプリートドロップダウン */}
              {showDropdown && (
                <div
                  ref={dropdownRef}
                  className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-md overflow-hidden"
                >
                  {suggestions.length > 0 ? (
                    <>
                      {suggestions.map((y) => {
                        const alreadyHeld = isAlreadyHeld(y.code);
                        return (
                          <button
                            key={y.code}
                            type="button"
                            disabled={alreadyHeld}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              addByYutai(y);
                            }}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors",
                              alreadyHeld
                                ? "opacity-40 cursor-not-allowed"
                                : "hover:bg-muted/60"
                            )}
                          >
                            <span className="font-mono text-xs text-muted-foreground w-10 shrink-0">
                              {y.code}
                            </span>
                            <span className="font-medium flex-1 truncate">{y.name}</span>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {y.categories.slice(0, 2).join("・")}
                            </span>
                            {alreadyHeld && (
                              <span className="text-xs text-muted-foreground shrink-0">追加済</span>
                            )}
                          </button>
                        );
                      })}
                      {/* DBにない銘柄として「そのまま追加」 */}
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          addByFreeText(query);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 border-t border-border text-xs text-muted-foreground hover:bg-muted/40 transition-colors"
                      >
                        「{query}」をそのまま追加
                      </button>
                    </>
                  ) : (
                    <div className="px-3 py-3 space-y-1.5">
                      <p className="text-sm text-muted-foreground">候補が見つかりませんでした</p>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          addByFreeText(query);
                        }}
                        className="text-xs text-accent hover:underline"
                      >
                        「{query}」をそのまま追加する
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Enterキーでも追加できます</p>
          </div>

          {/* 保有リスト */}
          {held.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">追加した銘柄（{held.length}件）</p>
              <div className="space-y-1.5">
                {held.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
                  >
                    {item.resolved.found ? (
                      <>
                        <span className="font-mono text-xs text-muted-foreground w-10 shrink-0">
                          {item.resolved.yutai?.code}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{item.resolved.yutai?.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.resolved.yutai?.categories.join("・")}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="w-10 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{item.input}</p>
                          <p className="text-xs text-muted-foreground">
                            データにない銘柄（優待なし株・未収録）
                          </p>
                        </div>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      aria-label={`${item.input}を削除`}
                      className="shrink-0 rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 0件のときのガイド */}
          {held.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              まだ銘柄が追加されていません。上の検索欄から追加してください。
            </p>
          )}

          {/* 分析ボタン */}
          <Button
            onClick={analyze}
            disabled={held.length === 0}
            className="w-full"
            size="lg"
          >
            分析する
          </Button>

          {/* 分析結果 */}
          {analysisResult && (
            <div ref={resultsRef} className="border-t border-border pt-6">
              <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                分析結果
              </p>
              <AnalysisResultView result={analysisResult} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
